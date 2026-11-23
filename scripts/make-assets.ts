import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";

const FONTS: Array<{ pkg: string; file: string }> = [
  { pkg: "ibm-plex-sans", file: "ibm-plex-sans-latin-400-normal.woff" },
  { pkg: "ibm-plex-sans", file: "ibm-plex-sans-latin-500-normal.woff" },
  { pkg: "ibm-plex-sans", file: "ibm-plex-sans-latin-600-normal.woff" },
  { pkg: "ibm-plex-sans", file: "ibm-plex-sans-latin-700-normal.woff" },
  { pkg: "barlow-condensed", file: "barlow-condensed-latin-500-normal.woff" },
  { pkg: "barlow-condensed", file: "barlow-condensed-latin-600-normal.woff" },
  { pkg: "barlow-condensed", file: "barlow-condensed-latin-700-normal.woff" },
  { pkg: "ibm-plex-mono", file: "ibm-plex-mono-latin-400-normal.woff" },
  { pkg: "ibm-plex-mono", file: "ibm-plex-mono-latin-600-normal.woff" },
];

const INK = "#14201C";
const LIGHT = "#FFFFFF";

const STROKE = 24;
const CAP = { "stroke-linecap": "round", "stroke-linejoin": "round" } as const;
const capAttrs = Object.entries(CAP)
  .map(([k, v]) => `${k}="${v}"`)
  .join(" ");

const GLYPHS: Record<string, (c: string) => string> = {
  "car-park": (c) =>
    `<rect x="64" y="64" width="384" height="384" rx="56" fill="none" stroke="${c}" stroke-width="${STROKE}" ${capAttrs}/>` +
    `<rect x="168" y="132" width="44" height="248" fill="${c}"/>` +
    `<path d="M212 132 H286 a70 70 0 0 1 0 140 H212" fill="none" stroke="${c}" stroke-width="44" ${capAttrs}/>`,
  toilets: (c) =>
    `<circle cx="168" cy="140" r="44" fill="${c}"/>` +
    `<rect x="124" y="212" width="88" height="236" rx="44" fill="${c}"/>` +
    `<circle cx="352" cy="140" r="44" fill="${c}"/>` +
    `<polygon points="352,212 424,448 280,448" fill="${c}"/>`,
  reception: (c) =>
    `<circle cx="256" cy="256" r="176" fill="none" stroke="${c}" stroke-width="${STROKE}" ${capAttrs}/>` +
    `<circle cx="256" cy="156" r="30" fill="${c}"/>` +
    `<rect x="232" y="216" width="48" height="160" rx="24" fill="${c}"/>`,
  lift: (c) =>
    `<rect x="64" y="64" width="384" height="384" rx="56" fill="none" stroke="${c}" stroke-width="${STROKE}" ${capAttrs}/>` +
    `<polygon points="256,112 324,208 188,208" fill="${c}"/>` +
    `<polygon points="256,400 188,304 324,304" fill="${c}"/>`,
  exit: (c) =>
    `<rect x="104" y="88" width="168" height="336" fill="none" stroke="${c}" stroke-width="${STROKE}" ${capAttrs}/>` +
    `<rect x="300" y="238" width="112" height="36" fill="${c}"/>` +
    `<polygon points="440,256 368,196 368,316" fill="${c}"/>`,
};

async function main(): Promise<void> {
  await mkdir("assets/fonts", { recursive: true });
  for (const { pkg, file } of FONTS) {
    await copyFile(`node_modules/@fontsource/${pkg}/files/${file}`, `assets/fonts/${file}`);
  }

  const colourways: Array<{ dir: string; colour: string }> = [
    { dir: "assets/pictograms", colour: INK },
    { dir: "assets/pictograms/light", colour: LIGHT },
  ];
  for (const { dir, colour } of colourways) {
    await mkdir(dir, { recursive: true });
    for (const [name, draw] of Object.entries(GLYPHS)) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${draw(colour)}</svg>`;
      const png = new Resvg(svg, { fitTo: { mode: "width", value: 512 } }).render().asPng();
      await writeFile(`${dir}/${name}.png`, png);
    }
  }
  console.log(`assets: ${FONTS.length} fonts, ${Object.keys(GLYPHS).length * 2} pictograms`);
}

await main();
