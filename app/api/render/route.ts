import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderImage } from "@hyper-elements/react/image";
import family from "../../../templates/sign-family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATS = ["near", "mid", "far"] as const;
type Format = (typeof FORMATS)[number];

const FONT_FILES = [
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-400-normal.woff", weight: 400 },
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-500-normal.woff", weight: 500 },
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-600-normal.woff", weight: 600 },
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-700-normal.woff", weight: 700 },
  // Every family the template declares in its `fonts` prop needs bytes here, or renderImage reports
  // image/font for the missing one on every format. The Halden template declares both families.
  { family: "Barlow Condensed", file: "barlow-condensed-latin-500-normal.woff", weight: 500 },
  { family: "Barlow Condensed", file: "barlow-condensed-latin-600-normal.woff", weight: 600 },
  { family: "Barlow Condensed", file: "barlow-condensed-latin-700-normal.woff", weight: 700 },
];

const PICTOGRAMS = ["car-park", "toilets", "reception", "lift", "exit"] as const;
type Pictogram = (typeof PICTOGRAMS)[number];

const ARROWS = ["left", "right", "up", "down", "none"] as const;

type Body = {
  destination?: unknown;
  long?: unknown;
  medium?: unknown;
  short?: unknown;
  arrow?: unknown;
  pictogram?: unknown;
};

const text = (v: unknown, max: number): string =>
  typeof v === "string" ? v.slice(0, max) : "";

export async function POST(request: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, diagnostics: [], images: {} }, { status: 400 });
  }

  const pictogramName: Pictogram = (PICTOGRAMS as readonly string[]).includes(
    String(body.pictogram)
  )
    ? (body.pictogram as Pictogram)
    : "car-park";

  const arrow = (ARROWS as readonly string[]).includes(String(body.arrow))
    ? (body.arrow as (typeof ARROWS)[number])
    : "right";

  const short = text(body.short, 30);

  const values = {
    destination: text(body.destination, 60) || "Car park",
    long: text(body.long, 120) || "Visitor car park — follow the blue P signs past the north gate",
    medium: text(body.medium, 60) || "Visitor car park, north gate",
    ...(short.trim() ? { short } : {}),
    arrow,
    pictogram: {
      src: `assets/pictograms/${pictogramName}.png`,
      width: 512,
      height: 512,
    },
  };

  const root = process.cwd();
  const fonts = await Promise.all(
    FONT_FILES.map(async (f) => ({
      family: f.family,
      weight: f.weight,
      src: await readFile(path.join(root, "assets", "fonts", f.file)),
    }))
  );
  const images: Record<string, Buffer> = {
    [values.pictogram.src]: await readFile(
      path.join(root, "assets", "pictograms", `${pictogramName}.png`)
    ),
  };

  const rendered: Partial<Record<Format, string>> = {};
  const diagnostics: unknown[] = [];

  for (const format of FORMATS) {
    try {
      const { image } = await renderImage(family.design(values, { format }), {
        fonts,
        images,
        format: "png",
      });
      rendered[format] = `data:image/png;base64,${Buffer.from(image).toString("base64")}`;
    } catch (error) {
      const found = (error as { diagnostics?: unknown[] }).diagnostics;
      if (Array.isArray(found)) diagnostics.push(...found);
      else diagnostics.push({ code: "render/failed", message: String(error) });
    }
  }

  // Exactly the CLI's contract: the formats that fit are returned, the one that cannot fit is
  // not, and the diagnostics explain why.
  if (diagnostics.length > 0) {
    return Response.json({ ok: false, diagnostics, images: rendered }, { status: 422 });
  }

  return Response.json({ ok: true, diagnostics: [], images: rendered });
}
