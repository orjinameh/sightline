import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Canvas, Column, Heading, Row, Text } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import family from "../templates/sign-family";
import { MM, FORMATS, FORMAT_LABEL, type FormatName } from "../src/formats";

const WIDTH = 2000;
const HEIGHT = 1400;

const FONTS = [
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-400-normal.woff", weight: 400 },
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-600-normal.woff", weight: 600 },
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-700-normal.woff", weight: 700 },
  { family: "IBM Plex Mono", file: "ibm-plex-mono-latin-400-normal.woff", weight: 400 },
  { family: "IBM Plex Mono", file: "ibm-plex-mono-latin-600-normal.woff", weight: 600 },
];

type Described = {
  id: string;
  templateVersion: string;
  root: string;
  formats: Record<string, unknown>;
  fields: Array<{
    path: string;
    kind: string;
    required: boolean;
    schema: { maxLength?: number };
    /**
     * Two shapes share this key: fitted text reports a per-format map
     * (`{ far: { maxLines, sizes } }`), while an image field reports a string
     * (`"contain"`). Reading it as a map alone throws on the pictogram row.
     */
    fit?: string | Record<string, { maxLines: number; sizes: number[] }>;
    aspect?: { min: number; max: number };
    minWidth?: number;
    accepts?: string[];
    transparent?: string;
    regions?: Record<string, { box: number[]; pixels: number[] }>;
  }>;
  rules: { core: Array<{ code: string; stage: string }> };
  fixed?: string;
};

const INK = "#14201C";
const MUTED = "#6B6A5F";
const RULE = "#DAD3C2";
const GREEN = "#1F4D3F";

function limits(field: Described["fields"][number]): string {
  const parts: string[] = [];
  // The Latin font subsets carry no U+2264, so spell the bound out rather than render tofu.
  if (field.schema.maxLength !== undefined) parts.push(`max ${field.schema.maxLength} chars`);
  if (typeof field.fit === "string") {
    parts.push(`fit: ${field.fit}`);
  } else if (field.fit) {
    for (const [name, f] of Object.entries(field.fit)) {
      parts.push(
        `${name}: ${f.sizes.join("/")} px, ${f.maxLines} line${f.maxLines === 1 ? "" : "s"}`
      );
    }
  }
  return parts.join(" · ") || "—";
}

async function main(): Promise<void> {
  const described = family.describe() as unknown as Described;
  await mkdir("docs", { recursive: true });
  await writeFile("docs/contract.json", `${JSON.stringify(described, null, 2)}\n`, "utf8");

  const fonts = await Promise.all(
    FONTS.map(async (f) => ({
      family: f.family,
      weight: f.weight,
      src: await readFile(`assets/fonts/${f.file}`),
    }))
  );

  const formats = Object.keys(described.formats) as FormatName[];

  const element = (
    <Canvas
      width={WIDTH}
      height={HEIGHT}
      style={{ backgroundColor: "#F4F1EA", padding: 72, fontFamily: "IBM Plex Sans" }}
    >
      <Column style={{ gap: 36 }}>
        <Text style={{ fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 600, color: GREEN }}>
          {"$ npx hyper-elements describe templates/sign-family.tsx --json"}
        </Text>
        <Heading level={1} style={{ fontFamily: "IBM Plex Sans", fontSize: 60, fontWeight: 700, color: INK }}>
          {described.id}
        </Heading>
        <Text style={{ fontFamily: "IBM Plex Sans", fontSize: 24, fontWeight: 400, color: MUTED }}>
          {`v${described.templateVersion} · ${described.root} · ${formats.length} formats · ${described.fields.length} fields — what an agent reads before it fills the family`}
        </Text>

        <Row style={{ gap: 20 }}>
          {formats.map((name) => (
            <Column
              key={name}
              style={{
                width: 596,
                padding: 24,
                gap: 8,
                backgroundColor: "#FFFFFF",
                border: { width: 2, style: "solid", color: RULE },
                borderRadius: 12,
              }}
            >
              <Text style={{ fontFamily: "IBM Plex Sans", fontSize: 30, fontWeight: 700, color: INK }}>
                {`${name} — ${FORMAT_LABEL[name]}`}
              </Text>
              <Text style={{ fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 400, color: MUTED }}>
                {`${MM[name].width}×${MM[name].height} mm`}
              </Text>
              <Text style={{ fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 400, color: GREEN }}>
                {`${FORMATS[name].width}×${FORMATS[name].height} px`}
              </Text>
            </Column>
          ))}
        </Row>

        <Row style={{ gap: 16, padding: [0, 0, 8, 0], border: { bottom: { width: 2, style: "solid", color: RULE } } }}>
          <Text style={{ width: 300, fontFamily: "IBM Plex Mono", fontSize: 18, fontWeight: 600, color: MUTED }}>field</Text>
          <Text style={{ width: 160, fontFamily: "IBM Plex Mono", fontSize: 18, fontWeight: 600, color: MUTED }}>kind</Text>
          <Text style={{ width: 140, fontFamily: "IBM Plex Mono", fontSize: 18, fontWeight: 600, color: MUTED }}>required</Text>
          <Text style={{ width: 1180, fontFamily: "IBM Plex Mono", fontSize: 18, fontWeight: 600, color: MUTED }}>limits</Text>
        </Row>

        {described.fields.map((field) => (
          <Row key={field.path} style={{ gap: 16 }}>
            <Text style={{ width: 300, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 600, color: INK }}>{field.path}</Text>
            <Text style={{ width: 160, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 400, color: MUTED }}>{field.kind}</Text>
            <Text style={{ width: 140, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 400, color: field.required ? GREEN : MUTED }}>
              {field.required ? "yes" : "no"}
            </Text>
            <Text style={{ width: 1180, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 400, color: INK }}>{limits(field)}</Text>
          </Row>
        ))}

        <Row style={{ gap: 12, padding: [16, 0, 0, 0], border: { top: { width: 2, style: "solid", color: RULE } } }}>
          {described.rules.core.map((rule) => (
            <Text
              key={rule.code}
              style={{
                fontFamily: "IBM Plex Mono",
                fontSize: 18,
                fontWeight: 600,
                color: rule.stage === "measured" ? "#FFFFFF" : INK,
                backgroundColor: rule.stage === "measured" ? GREEN : "#FFFFFF",
                border: { width: 2, style: "solid", color: rule.stage === "measured" ? GREEN : RULE },
                borderRadius: 999,
                padding: [6, 16],
              }}
            >
              {`${rule.code} · ${rule.stage}`}
            </Text>
          ))}
        </Row>

        <Row style={{ gap: 16, padding: [18, 0, 0, 0], border: { top: { width: 2, style: "solid", color: RULE } } }}>
          <Text style={{ width: 300, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 600, color: INK }}>pictogram</Text>
          <Text style={{ width: 1560, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 400, color: MUTED }}>
            {(() => {
              const pic = described.fields.find((f) => f.path === "pictogram");
              return formats
                .map((name) => {
                  const r = pic?.regions?.[name];
                  return r ? `${name} ${r.box[0]}\u00d7${r.box[1]} px` : `${name} \u2014`;
                })
                .join("  \u00b7  ");
            })()}
          </Text>
        </Row>

        <Text style={{ fontFamily: "IBM Plex Mono", fontSize: 18, fontWeight: 400, color: MUTED }}>
          {(() => {
            const pic = described.fields.find((f) => f.path === "pictogram");
            if (!pic) return "";
            const bits = [
              pic.aspect ? `aspect ${pic.aspect.min}\u2013${pic.aspect.max}` : "",
              pic.minWidth ? `min ${pic.minWidth} px` : "",
              pic.accepts ? pic.accepts.join("/") : "",
              pic.transparent ? `${pic.transparent} alpha` : "",
            ].filter(Boolean);
            return `image limits: ${bits.join(" \u00b7 ")}`;
          })()}
        </Text>

        <Text style={{ fontFamily: "IBM Plex Sans", fontSize: 18, fontWeight: 400, color: MUTED }}>
          {described.fixed ?? ""}
        </Text>
      </Column>
    </Canvas>
  );

  const { image } = await renderImage(element, { fonts, format: "png" });
  await mkdir("docs/images", { recursive: true });
  await writeFile("docs/images/contract.png", image);
  console.log(`contract: wrote docs/contract.json and docs/images/contract.png`);
}

await main();
