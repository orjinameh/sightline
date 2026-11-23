import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Canvas, Column, Image, Row, Text } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";

const SCALE = 0.335;
const PADDING = 64;
const GAP = 48;
const LABEL_GAP = 16;

/**
 * Declared, not derived: the output size is part of the artifact's contract.
 * Arithmetic at SCALE 0.335 — content is 594 + 1187 + 1781 + 96 of gaps = 3658, plus 128 of
 * padding = 3786, inside 3840; height is 594 + 16 + a ~34 px label + 128 = 772, inside 800.
 */
const WIDTH = 3840;
const HEIGHT = 800;

type Panel = { format: "near" | "mid" | "far"; label: string; file: string; width: number; height: number };

const PANELS: Panel[] = [
  { format: "near", label: "3 m — long form", file: "out/designs/halden-house/car-park.near.png", width: 1772, height: 1181 },
  { format: "mid", label: "12 m — medium form", file: "out/designs/halden-house/car-park.mid.png", width: 3543, height: 1772 },
  { format: "far", label: "30 m — short form", file: "out/designs/halden-house/car-park.far.png", width: 5315, height: 1772 },
];

const FONTS = [
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-400-normal.woff", weight: 400 },
  { family: "IBM Plex Sans", file: "ibm-plex-sans-latin-600-normal.woff", weight: 600 },
];

const shownWidth = (p: Panel): number => Math.round(p.width * SCALE);
const shownHeight = (p: Panel): number => Math.round(p.height * SCALE);

async function main(): Promise<void> {
  const fonts = await Promise.all(
    FONTS.map(async (f) => ({
      family: f.family,
      weight: f.weight,
      src: await readFile(`assets/fonts/${f.file}`),
    }))
  );

  const images: Record<string, Buffer> = {};
  for (const p of PANELS) images[p.file] = await readFile(p.file);

  const element = (
    <Canvas
      width={WIDTH}
      height={HEIGHT}
      style={{ backgroundColor: "#FFFFFF", padding: PADDING }}
    >
      <Row style={{ gap: GAP, alignItems: "end" }}>
        {PANELS.map((p) => (
          <Column key={p.format} style={{ gap: LABEL_GAP }}>
            <Image
              src={{ src: p.file, width: p.width, height: p.height }}
              alt={`${p.label} sign`}
              style={{ width: shownWidth(p), height: shownHeight(p) }}
            />
            <Text
              style={{
                fontFamily: "IBM Plex Sans",
                fontSize: 26,
                fontWeight: 600,
                color: "#14201C",
              }}
            >
              {p.label}
            </Text>
          </Column>
        ))}
      </Row>
    </Canvas>
  );

  const { image } = await renderImage(element, { fonts, images, format: "png" });
  await mkdir("docs/images", { recursive: true });
  await writeFile("docs/images/strip.png", image);
  console.log(`strip: wrote docs/images/strip.png (${WIDTH}x${HEIGHT})`);
}

await main();
