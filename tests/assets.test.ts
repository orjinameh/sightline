import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { sniffImage } from "@hyper-elements/react/template";

const FONTS = [
  "ibm-plex-sans-latin-400-normal.woff",
  "ibm-plex-sans-latin-500-normal.woff",
  "ibm-plex-sans-latin-600-normal.woff",
  "ibm-plex-sans-latin-700-normal.woff",
  "barlow-condensed-latin-500-normal.woff",
  "barlow-condensed-latin-600-normal.woff",
  "barlow-condensed-latin-700-normal.woff",
  "ibm-plex-mono-latin-400-normal.woff",
  "ibm-plex-mono-latin-600-normal.woff",
];

const PICTOS = ["car-park", "toilets", "reception", "lift", "exit"];

describe("assets", () => {
  it("ships every font as a real WOFF, not WOFF2", async () => {
    for (const file of FONTS) {
      const bytes = await readFile(`assets/fonts/${file}`);
      expect(bytes.subarray(0, 4).toString("latin1"), file).toBe("wOFF");
    }
  });

  it("ships every pictogram at 512x512 with transparency", async () => {
    for (const name of PICTOS) {
      for (const dir of ["assets/pictograms", "assets/pictograms/light"]) {
        const info = sniffImage(await readFile(`${dir}/${name}.png`));
        expect(info, `${dir}/${name}`).toBeDefined();
        if (!info) throw new Error(`not a readable image: ${dir}/${name}.png`);
        expect(info.width, `${dir}/${name}`).toBe(512);
        expect(info.height, `${dir}/${name}`).toBe(512);
        expect(info.alpha, `${dir}/${name}`).toBe(true);
      }
    }
  });
});
