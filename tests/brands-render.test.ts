import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { renderImage } from "@hyper-elements/react/image";
import { foundryNine, haldenHouse } from "../brand";
import family from "../templates/sign-family";
import foundry from "../templates/sign-family-foundry";

const FONT_FILES = [
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-400-normal.woff", weight: 400 },
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-500-normal.woff", weight: 500 },
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-600-normal.woff", weight: 600 },
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-700-normal.woff", weight: 700 },
  { family: "Barlow Condensed", file: "barlow-condensed-latin-500-normal.woff", weight: 500 },
  { family: "Barlow Condensed", file: "barlow-condensed-latin-600-normal.woff", weight: 600 },
  { family: "Barlow Condensed", file: "barlow-condensed-latin-700-normal.woff", weight: 700 },
];

async function renderFar(
  t: typeof family,
  pictogram: string
): Promise<Uint8Array> {
  const fonts = await Promise.all(
    FONT_FILES.map(async (f) => ({
      family: f.family,
      weight: f.weight,
      src: await readFile(`assets/fonts/${f.file}`),
    }))
  );
  const values = {
    destination: "Car park",
    long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
    medium: "Visitor car park, north gate",
    short: "Visitor car park",
    arrow: "right" as const,
    pictogram: { src: pictogram, width: 512, height: 512 },
  };
  const { image } = await renderImage(t.design(values, { format: "far" }), {
    fonts,
    images: { [pictogram]: await readFile(pictogram) },
    format: "png",
  });
  return image;
}

describe("two buildings", () => {
  it("renders the same destination differently from one factory", async () => {
    const a = await renderFar(family, "assets/pictograms/car-park.png");
    const b = await renderFar(foundry, "assets/pictograms/light/car-park.png");
    expect(a.length).toBeGreaterThan(10_000);
    expect(b.length).toBeGreaterThan(10_000);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
  });

  it("differs in what a judge sees first", () => {
    expect(haldenHouse.fontFamily).toBe("IBM Plex Sans");
    expect(foundryNine.fontFamily).toBe("Barlow Condensed");
    expect(haldenHouse.arrowStyle).toBe("circle");
    expect(foundryNine.arrowStyle).toBe("chevron");
  });
});
