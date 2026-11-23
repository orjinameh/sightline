# Template Implementation Plan

**Goal:** A brand-parameterized Hyper Elements `Canvas` template that renders one destination at 3 m / 12 m / 30 m, where the distance chooses the copy and a 30 m sign with no short form is refused by `image/fit`.
**Architecture:** Pure logic (`formats`, `copy`, `layout`) feeds one `template()` whose `render` reads the format's geometry; two buildings are two `extendTheme` instances of one factory; a second `Document` template renders the sign schedule.
**Tech Stack:** TypeScript 5.9.3 · Node 24 · React 19.3.1 · `@hyper-elements/react` 0.5.2 · `@hyper-elements/cli` 0.3.3 · `satori` 0.33.5 · `@resvg/resvg-js` 2.6.2 · `@react-pdf/renderer` 4.9.0 · `@fontsource/*` 5.3.0 · `vitest` 5.1.1 · `tsx` 4.23.15
**Source spec:** docs/superpowers/specs/2026-11-23-sightline-sign-family-design.md

> **Read first — facts verified against the real packages (spec §7).** These are not guesses; every
> one was measured on 2026-11-23 and each one is a failure mode if ignored:
> 1. A `Canvas`'s `fonts` prop takes **file paths, `data:` URIs or http(s) URLs — never `Buffer`s**.
>    Font bytes go only to `renderImage`'s `options.fonts`.
> 2. `fit` **sets its own font size**. Setting `style.fontSize` beside `fit` is `style/fit`.
> 3. Every font **weight** used must have a file, or `image/font-weight` is an **error**.
> 4. An element's `fontFamily` (or the theme's `fonts.body`) must name a family whose file is given,
>    or `image/font` is an error. The default stack is `Arial, Helvetica, sans-serif`.
> 5. A `Canvas` has **no `flexDirection`** — children stack; use a `Row` for horizontal layout.
> 6. A `Document` root has **no `padding`** — it takes `margin`; spacing goes on a `Column` inside.
> 7. `prop.object(fields, { label })` needs the **second argument**, or `prop.list` rejects it.
> 8. `image/fit` is a **measured** rule: in-memory `template.check()` reports it `not-run`. The CLI
>    (`check`, `render`) and `renderImage()` decide it. Only those can prove the refusal.
> 9. The far format renders: **5315×1772 in ~430 ms**. The first-hour spike is already cleared.

---

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `tests/smoke.test.ts`

**Effort:** low
**Model tier:** fast
**Provides:** `package.json scripts`, `hyperElements.templates trust list`
**Requires:** —

- [ ] **Step 1: Write `package.json`**

      ```json
      {
        "name": "sightline",
        "version": "1.0.0",
        "private": true,
        "type": "module",
        "description": "A wayfinding sign family where distance chooses the copy",
        "license": "MIT",
        "hyperElements": { "templates": ["templates/**", "src/**", "brand.ts"] },
        "scripts": {
          "test": "vitest run",
          "typecheck": "tsc --noEmit",
          "check": "hyper-elements check templates/ designs/",
          "assets": "tsx scripts/make-assets.ts",
          "build:directory": "tsx scripts/build-directory.ts",
          "render:designs": "tsx scripts/render-all.ts",
          "strip": "tsx scripts/strip.tsx",
          "contract": "tsx scripts/contract-image.tsx",
          "demo": "npm run assets && npm run build:directory && npm run render:designs && npm run strip && npm run contract"
        },
        "dependencies": {
          "@hyper-elements/react": "0.5.2",
          "@react-pdf/renderer": "4.9.0",
          "@resvg/resvg-js": "2.6.2",
          "react": "19.3.1",
          "react-dom": "19.3.1",
          "satori": "0.33.5"
        },
        "devDependencies": {
          "@fontsource/barlow-condensed": "5.3.0",
          "@fontsource/ibm-plex-mono": "5.3.0",
          "@fontsource/ibm-plex-sans": "5.3.0",
          "@hyper-elements/cli": "0.3.3",
          "@types/node": "24.19.2",
          "@types/react": "19.3.0",
          "@types/react-dom": "19.3.0",
          "tsx": "4.23.15",
          "typescript": "5.9.3",
          "vitest": "5.1.1"
        }
      }
      ```

      `satori` is pinned to `0.33.5` on purpose: `@hyper-elements/react@0.5.2` declares the peer range
      `^0.33.5`, which excludes `0.63.x`. Installing the latest satori breaks the peer resolution.

- [ ] **Step 2: Write `tsconfig.json`**

      ```json
      {
        "compilerOptions": {
          "target": "ES2022",
          "lib": ["ES2022", "DOM"],
          "module": "ESNext",
          "moduleResolution": "Bundler",
          "jsx": "react-jsx",
          "strict": true,
          "esModuleInterop": true,
          "skipLibCheck": true,
          "noEmit": true,
          "resolveJsonModule": true
        },
        "include": ["src", "templates", "directory", "scripts", "tests", "brand.ts"]
      }
      ```

- [ ] **Step 3: Write `vitest.config.ts`**

      ```ts
      import { defineConfig } from "vitest/config";

      export default defineConfig({
        test: {
          include: ["tests/**/*.test.ts"],
          testTimeout: 180_000,
          hookTimeout: 180_000,
        },
      });
      ```

- [ ] **Step 4: Write `.gitignore`**

      ```
      node_modules/
      out/
      *.log
      .DS_Store
      ```

- [ ] **Step 5: Write `tests/smoke.test.ts`**

      ```ts
      import { describe, expect, it } from "vitest";

      describe("sightline", () => {
        it("has a working test runner", () => {
          expect("sightline").toBe("sightline");
        });
      });
      ```

- [ ] **Step 6: Install and run the gate**

      Run: `npm install && npm test && echo GATE-PASS`
      Expected: `GATE-PASS`

- [ ] **Step 7: Commit (kernel-performed — no agent runs this)**
      Message: `chore: scaffold the sightline project`

---

### Task 2: Generate the font and pictogram assets

**Files:**
- Create: `scripts/make-assets.ts`
- Create: `tests/assets.test.ts`
- Create: `assets/fonts/ibm-plex-sans-latin-400-normal.woff`
- Create: `assets/fonts/ibm-plex-sans-latin-500-normal.woff`
- Create: `assets/fonts/ibm-plex-sans-latin-600-normal.woff`
- Create: `assets/fonts/ibm-plex-sans-latin-700-normal.woff`
- Create: `assets/fonts/barlow-condensed-latin-500-normal.woff`
- Create: `assets/fonts/barlow-condensed-latin-600-normal.woff`
- Create: `assets/fonts/barlow-condensed-latin-700-normal.woff`
- Create: `assets/fonts/ibm-plex-mono-latin-400-normal.woff`
- Create: `assets/fonts/ibm-plex-mono-latin-600-normal.woff`
- Create: `assets/pictograms/car-park.png`
- Create: `assets/pictograms/toilets.png`
- Create: `assets/pictograms/reception.png`
- Create: `assets/pictograms/lift.png`
- Create: `assets/pictograms/exit.png`
- Create: `assets/pictograms/light/car-park.png`
- Create: `assets/pictograms/light/toilets.png`
- Create: `assets/pictograms/light/reception.png`
- Create: `assets/pictograms/light/lift.png`
- Create: `assets/pictograms/light/exit.png`

**Depends on:** Task 1
**Effort:** medium
**Model tier:** standard
**Provides:** `assets/fonts/*.woff`, `assets/pictograms/*.png`
**Requires:** `package.json scripts`

- [ ] **Step 1: Write `scripts/make-assets.ts`**

      Fonts are copied out of `@fontsource/*` (which ships real `.woff` — verified magic `wOFF`;
      only WOFF2 is undrawable). Pictograms are drawn as SVG geometry and rasterised with resvg, in
      two colourways, so each building has its own pictogram set.

      ```ts
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

      const GLYPHS: Record<string, (c: string) => string> = {
        "car-park": (c) =>
          `<rect x="64" y="64" width="384" height="384" rx="56" fill="none" stroke="${c}" stroke-width="${STROKE}" ${Object.entries(CAP).map(([k, v]) => `${k}="${v}"`).join(" ")}/>` +
          `<rect x="168" y="132" width="44" height="248" fill="${c}"/>` +
          `<path d="M212 132 H286 a70 70 0 0 1 0 140 H212" fill="none" stroke="${c}" stroke-width="44" ${Object.entries(CAP).map(([k, v]) => `${k}="${v}"`).join(" ")}/>`,
        toilets: (c) =>
          `<circle cx="168" cy="140" r="44" fill="${c}"/>` +
          `<rect x="124" y="212" width="88" height="236" rx="44" fill="${c}"/>` +
          `<circle cx="352" cy="140" r="44" fill="${c}"/>` +
          `<polygon points="352,212 424,448 280,448" fill="${c}"/>`,
        reception: (c) =>
          `<circle cx="256" cy="256" r="176" fill="none" stroke="${c}" stroke-width="${STROKE}" ${Object.entries(CAP).map(([k, v]) => `${k}="${v}"`).join(" ")}/>` +
          `<circle cx="256" cy="156" r="30" fill="${c}"/>` +
          `<rect x="232" y="216" width="48" height="160" rx="24" fill="${c}"/>`,
        lift: (c) =>
          `<rect x="64" y="64" width="384" height="384" rx="56" fill="none" stroke="${c}" stroke-width="${STROKE}" ${Object.entries(CAP).map(([k, v]) => `${k}="${v}"`).join(" ")}/>` +
          `<polygon points="256,112 324,208 188,208" fill="${c}"/>` +
          `<polygon points="256,400 188,304 324,304" fill="${c}"/>`,
        exit: (c) =>
          `<rect x="104" y="88" width="168" height="336" fill="none" stroke="${c}" stroke-width="${STROKE}" ${Object.entries(CAP).map(([k, v]) => `${k}="${v}"`).join(" ")}/>` +
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
      ```

- [ ] **Step 2: Write `tests/assets.test.ts`**

      ```ts
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
              expect(info.width, `${dir}/${name}`).toBe(512);
              expect(info.height, `${dir}/${name}`).toBe(512);
              expect(info.alpha, `${dir}/${name}`).toBe(true);
            }
          }
        });
      });
      ```

- [ ] **Step 3: Run the gate**

      Run: `npm run assets && npx vitest run tests/assets.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

      If `info.alpha` is `false`, the SVG picked up a background: remove any `<rect>` that fills the
      whole 512 box and re-run. If a font file is missing, the `@fontsource` version in `package.json`
      does not ship that weight — pick the nearest weight that exists and use it everywhere.

- [ ] **Step 4: Commit (kernel-performed — no agent runs this)**
      Message: `feat: generate the OFL fonts and the two pictogram colourways`

---

### Task 3: Formats and copy-by-distance

**Files:**
- Create: `src/formats.ts`
- Create: `src/copy.ts`
- Create: `tests/copy.test.ts`

**Depends on:** Task 1
**Effort:** medium
**Model tier:** standard
**Provides:** `FORMATS`, `FORMAT_LABEL`, `MM`, `DPI`, `FormatName`, `CopyForm`, `SignValues`, `copyFormFor`, `copyFor`
**Requires:** —

- [ ] **Step 1: Write the failing test `tests/copy.test.ts`**

      ```ts
      import { describe, expect, it } from "vitest";
      import { FORMATS, FORMAT_LABEL } from "../src/formats";
      import { copyFor, copyFormFor } from "../src/copy";

      describe("formats", () => {
        it("matches the proof sizes the spec measured at 150 DPI", () => {
          expect(FORMATS.near).toEqual({ width: 1772, height: 1181, scale: 1 });
          expect(FORMATS.mid).toEqual({ width: 3543, height: 1772, scale: 1 });
          expect(FORMATS.far).toEqual({ width: 5315, height: 1772, scale: 1 });
        });

        it("labels each format by its viewing distance", () => {
          expect(FORMAT_LABEL.near).toBe("3 m");
          expect(FORMAT_LABEL.mid).toBe("12 m");
          expect(FORMAT_LABEL.far).toBe("30 m");
        });
      });

      describe("copy-by-distance", () => {
        const v = {
          long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
          medium: "Visitor car park, north gate",
          short: "Visitor car park",
        };

        it("chooses the copy from the distance, not from a field", () => {
          expect(copyFormFor("near")).toBe("long");
          expect(copyFormFor("mid")).toBe("medium");
          expect(copyFormFor("far")).toBe("short");
        });

        it("draws the long form at 3 m", () => {
          expect(copyFor("near", v)).toEqual({ field: "long", text: v.long, fellBack: false });
        });

        it("draws the medium form at 12 m", () => {
          expect(copyFor("mid", v)).toEqual({ field: "medium", text: v.medium, fellBack: false });
        });

        it("draws the short form at 30 m", () => {
          expect(copyFor("far", v)).toEqual({ field: "short", text: v.short, fellBack: false });
        });

        it("falls back to the long form at 30 m, and says so, when the short form is missing", () => {
          expect(copyFor("far", { long: v.long, medium: v.medium })).toEqual({
            field: "short",
            text: v.long,
            fellBack: true,
          });
        });

        it("treats a whitespace-only short form as missing", () => {
          expect(copyFor("far", { ...v, short: "   " })).toEqual({
            field: "short",
            text: v.long,
            fellBack: true,
          });
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/copy.test.ts`
      Expected: FAIL — `Failed to resolve import "../src/formats"`

- [ ] **Step 3: Write `src/formats.ts`**

      ```ts
      export type FormatName = "near" | "mid" | "far";

      /** The proof resolution. One constant, so the fallback ladder in spec §6.2 is a one-line change. */
      export const DPI = 150;

      const mmToPx = (mm: number): number => Math.round((mm / 25.4) * DPI);

      /** The sign's physical size at each viewing distance. Design choices, not standards. */
      export const MM: Record<FormatName, { width: number; height: number }> = {
        near: { width: 300, height: 200 },
        mid: { width: 600, height: 300 },
        far: { width: 900, height: 300 },
      };

      export const FORMATS: Record<FormatName, { width: number; height: number; scale: number }> = {
        near: { width: mmToPx(MM.near.width), height: mmToPx(MM.near.height), scale: 1 },
        mid: { width: mmToPx(MM.mid.width), height: mmToPx(MM.mid.height), scale: 1 },
        far: { width: mmToPx(MM.far.width), height: mmToPx(MM.far.height), scale: 1 },
      };

      export const FORMAT_LABEL: Record<FormatName, string> = {
        near: "3 m",
        mid: "12 m",
        far: "30 m",
      };
      ```

- [ ] **Step 4: Write `src/copy.ts`**

      The `field` stays `"short"` even when the text falls back to the long form — that is what makes
      the `image/fit` diagnostic name `short` (verified: `"field": "short"` in `check --json`).

      ```ts
      import type { FormatName } from "./formats";

      export type CopyForm = "long" | "medium" | "short";

      export type SignValues = {
        destination: string;
        long: string;
        medium: string;
        short?: string;
        arrow: "left" | "right" | "up" | "down" | "none";
        pictogram: { src: string; width: number; height: number };
      };

      export function copyFormFor(format: FormatName): CopyForm {
        if (format === "near") return "long";
        if (format === "mid") return "medium";
        return "short";
      }

      export function copyFor(
        format: FormatName,
        v: Pick<SignValues, "long" | "medium" | "short">
      ): { field: CopyForm; text: string; fellBack: boolean } {
        const field = copyFormFor(format);
        if (field === "long") return { field, text: v.long, fellBack: false };
        if (field === "medium") return { field, text: v.medium, fellBack: false };
        const short = (v.short ?? "").trim();
        if (short.length > 0) return { field: "short", text: short, fellBack: false };
        return { field: "short", text: v.long, fellBack: true };
      }
      ```

- [ ] **Step 5: Run the gate**

      Run: `npx vitest run tests/copy.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

- [ ] **Step 6: Commit (kernel-performed — no agent runs this)**
      Message: `feat: derive the sign's copy from its viewing distance`

---

### Task 4: Per-format layout geometry

**Files:**
- Create: `src/layout.ts`
- Create: `tests/layout.test.ts`

**Depends on:** Task 3
**Effort:** medium
**Model tier:** standard
**Provides:** `FormatLayout`, `LAYOUT`, `layoutFor`
**Requires:** `FORMATS`, `FormatName`

- [ ] **Step 1: Write the failing test `tests/layout.test.ts`**

      ```ts
      import { describe, expect, it } from "vitest";
      import { FORMATS, type FormatName } from "../src/formats";
      import { LAYOUT, layoutFor } from "../src/layout";

      const FORMATS_LIST: FormatName[] = ["near", "mid", "far"];

      describe("layout", () => {
        it("gives every format geometry that fits inside the canvas", () => {
          for (const name of FORMATS_LIST) {
            const L = layoutFor(name);
            expect(L.width).toBe(FORMATS[name].width);
            expect(L.height).toBe(FORMATS[name].height);
            expect(L.padding * 2 + L.copyColumnWidth, name).toBeLessThanOrEqual(L.width);
          }
        });

        it("bounds the copy column instead of giving it the whole canvas", () => {
          // The copy budget is the column, not the canvas: at full width a long form fits on one line
          // and nothing refuses (spec §7.3).
          expect(LAYOUT.far.copyColumnWidth).toBeLessThan(FORMATS.far.width * 0.7);
          expect(LAYOUT.mid.copyColumnWidth).toBeLessThan(FORMATS.mid.width * 0.7);
        });

        it("fits the far copy on exactly one line, and the near copy on several", () => {
          expect(LAYOUT.far.maxLines).toBe(1);
          expect(LAYOUT.mid.maxLines).toBe(1);
          expect(LAYOUT.near.maxLines).toBeGreaterThan(1);
        });

        it("tries type sizes from largest to smallest", () => {
          for (const name of FORMATS_LIST) {
            const sizes = LAYOUT[name].fitSizes;
            expect(sizes.length, name).toBeGreaterThan(0);
            for (let i = 1; i < sizes.length; i++) {
              expect(sizes[i]!).toBeLessThan(sizes[i - 1]!);
            }
          }
        });

        it("stacks the near sign and runs the mid and far signs horizontally", () => {
          expect(LAYOUT.near.arrangement).toBe("stacked");
          expect(LAYOUT.mid.arrangement).toBe("row");
          expect(LAYOUT.far.arrangement).toBe("row");
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/layout.test.ts`
      Expected: FAIL — `Failed to resolve import "../src/layout"`

- [ ] **Step 3: Write `src/layout.ts`**

      ```ts
      import { FORMATS, type FormatName } from "./formats";

      export type Arrangement = "stacked" | "row";

      export type FormatLayout = {
        width: number;
        height: number;
        padding: number;
        arrangement: Arrangement;
        copyColumnWidth: number;
        fitSizes: readonly number[];
        maxLines: number;
        pictogramBox: number;
        arrowBox: number;
        gap: number;
        footSize: number;
      };

      /**
       * The copy column is the copy budget. At the far format's full width an 82-character long form
       * fits on one line at 120 px and nothing refuses — so the copy gets 3200 px, and that is what
       * "cannot fit" means. Change these numbers and re-run the refusal test.
       */
      export const LAYOUT: Record<FormatName, FormatLayout> = {
        near: {
          width: FORMATS.near.width,
          height: FORMATS.near.height,
          padding: 72,
          arrangement: "stacked",
          copyColumnWidth: 1478,
          fitSizes: [72, 64, 56],
          maxLines: 3,
          pictogramBox: 260,
          arrowBox: 110,
          gap: 40,
          footSize: 24,
        },
        mid: {
          width: FORMATS.mid.width,
          height: FORMATS.mid.height,
          padding: 96,
          arrangement: "row",
          copyColumnWidth: 2100,
          fitSizes: [104, 92, 80],
          maxLines: 1,
          pictogramBox: 340,
          arrowBox: 150,
          gap: 44,
          footSize: 28,
        },
        far: {
          width: FORMATS.far.width,
          height: FORMATS.far.height,
          padding: 120,
          arrangement: "row",
          copyColumnWidth: 3200,
          fitSizes: [160, 140, 120],
          maxLines: 1,
          pictogramBox: 420,
          arrowBox: 200,
          gap: 56,
          footSize: 32,
        },
      };

      export function layoutFor(format: FormatName): FormatLayout {
        return LAYOUT[format];
      }
      ```

- [ ] **Step 4: Run the gate**

      Run: `npx vitest run tests/layout.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

- [ ] **Step 5: Commit (kernel-performed — no agent runs this)**
      Message: `feat: lay out each distance inside a bounded copy column`

---

### Task 5: Two buildings, and the legibility assumption

**Files:**
- Create: `brand.ts`
- Create: `tests/brand.test.ts`

**Depends on:** Task 1
**Effort:** medium
**Model tier:** standard
**Provides:** `SignBrand`, `ArrowStyle`, `haldenHouse`, `foundryNine`, `brands`, `legibility`
**Requires:** —

- [ ] **Step 1: Write the failing test `tests/brand.test.ts`**

      ```ts
      import { describe, expect, it } from "vitest";
      import { brands, foundryNine, haldenHouse, legibility } from "../brand";

      describe("brands", () => {
        it("makes two buildings from one base theme", () => {
          expect(Object.keys(brands)).toEqual(["halden-house", "foundry-nine"]);
          expect(haldenHouse.theme).toBeDefined();
          expect(foundryNine.theme).toBeDefined();
          expect(haldenHouse.theme).not.toBe(foundryNine.theme);
        });

        it("makes them visibly different in type and arrow", () => {
          expect(haldenHouse.fontFamily).not.toBe(foundryNine.fontFamily);
          expect(haldenHouse.arrowStyle).not.toBe(foundryNine.arrowStyle);
        });

        it("points each building at its own pictogram colourway", () => {
          expect(haldenHouse.pictogramDir).toBe("../assets/pictograms");
          expect(foundryNine.pictogramDir).toBe("../assets/pictograms/light");
        });
      });

      describe("legibility", () => {
        it("is a declared assumption, not a rule", () => {
          expect(legibility.ratio).toBe(0.0125);
          expect(legibility.houseWordLimit).toBe(6);
        });

        it("cites the standard only within its scope", () => {
          expect(legibility.scope).toContain("703.5.5");
          expect(legibility.scope).toContain("40");
          expect(legibility.scope).toContain("120");
          expect(legibility.beyond).toContain("assumption");
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/brand.test.ts`
      Expected: FAIL — `Failed to resolve import "../brand"`

- [ ] **Step 3: Write `brand.ts`**

      The word budget lives here, and only here, as a labelled assumption. It is **never** enforced:
      `require.core` is a closed set of seven codes with no custom predicate, so a "six words" rule is
      not expressible — the character-count refusal is what actually does the work.

      ```ts
      import { defineTheme, extendTheme } from "@hyper-elements/react";

      export type ArrowStyle = "circle" | "chevron";

      export type SignBrand = {
        id: string;
        label: string;
        arrowStyle: ArrowStyle;
        /** The family the template sets on every text node. Must have a file in FONT_FACES. */
        fontFamily: string;
        /** Relative to `templates/`, so a design's example resolves its pictogram. */
        pictogramDir: string;
        theme: ReturnType<typeof extendTheme>;
      };

      const base = defineTheme({
        colors: {
          background: "#FFFFFF",
          foreground: "#14201C",
          primary: "#1F4D3F",
          primaryForeground: "#FFFFFF",
          muted: "#5A6660",
          border: "#D9D4C8",
        },
        fontSizes: { body: 32 },
        lineHeights: { body: 1.15 },
        fonts: { body: "IBM Plex Sans", heading: "IBM Plex Sans" },
        radii: { md: 12 },
      });

      export const haldenHouse: SignBrand = {
        id: "halden-house",
        label: "Halden House",
        arrowStyle: "circle",
        fontFamily: "IBM Plex Sans",
        pictogramDir: "../assets/pictograms",
        theme: extendTheme(base, {
          colors: {
            background: "#F4F1EA",
            foreground: "#14201C",
            primary: "#1F4D3F",
            primaryForeground: "#F4F1EA",
            muted: "#6B6A5F",
            border: "#DAD3C2",
          },
        }),
      };

      export const foundryNine: SignBrand = {
        id: "foundry-nine",
        label: "Foundry Nine",
        arrowStyle: "chevron",
        fontFamily: "Barlow Condensed",
        pictogramDir: "../assets/pictograms/light",
        theme: extendTheme(base, {
          colors: {
            background: "#0B0B0C",
            foreground: "#FFFFFF",
            primary: "#F5D90A",
            primaryForeground: "#0B0B0C",
            muted: "#A8A8A8",
            border: "#2A2A2E",
          },
          fonts: { body: "Barlow Condensed", heading: "Barlow Condensed" },
          fontSizes: { body: 36 },
        }),
      };

      export const brands = { "halden-house": haldenHouse, "foundry-nine": foundryNine };

      export const legibility = {
        // ADA 2010 Standards Table 703.5.5 within its scope (characters 40-120 in above the floor).
        // Beyond that scope this ratio is OUR assumption; replace it with your fabricator's.
        ratio: 0.0125, // character height / viewing distance, far-field assumption
        houseWordLimit: 6, // our house limit, not a legal maximum
        scope: "characters 40-120 in above the floor (ADA 2010 Standards Table 703.5.5)",
        beyond: "beyond that distance the ratio is a declared assumption, not a standard",
      } as const;
      ```

- [ ] **Step 4: Run the gate**

      Run: `npx vitest run tests/brand.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

- [ ] **Step 5: Commit (kernel-performed — no agent runs this)**
      Message: `feat: two buildings from one base theme, and the declared legibility assumption`

---

### Task 6: The sign-family Canvas template

**Files:**
- Create: `templates/sign-family.tsx`
- Create: `templates/sign-family-foundry.tsx`
- Create: `tests/template.test.ts`

**Depends on:** Task 2, Task 3, Task 4, Task 5
**Effort:** high
**Model tier:** top
**Provides:** `signFamily`, `sightline.SignFamily`, `sightline.SignFamilyFoundry`
**Requires:** `assets/fonts/*.woff`, `assets/pictograms/*.png`, `FORMATS`, `FORMAT_LABEL`, `FormatName`, `copyFor`, `layoutFor`, `FormatLayout`, `SignBrand`, `haldenHouse`

- [ ] **Step 1: Write the failing test `tests/template.test.ts`**

      ```tsx
      import { describe, expect, it } from "vitest";
      import family from "../templates/sign-family";
      import foundry from "../templates/sign-family-foundry";

      const EXAMPLE = {
        destination: "Car park",
        long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
        medium: "Visitor car park, north gate",
        short: "Visitor car park",
        arrow: "right" as const,
        pictogram: { src: "../assets/pictograms/car-park.png", width: 512, height: 512 },
      };

      describe("the sign family", () => {
        it("opens three formats and six fields", () => {
          const d = family.describe();
          expect(Object.keys(d.formats ?? {})).toEqual(["near", "mid", "far"]);
          expect(d.fields.map((f) => f.path).sort()).toEqual(
            ["arrow", "destination", "long", "medium", "pictogram", "short"].sort()
          );
        });

        it("requires all four measured rules", () => {
          const d = family.describe();
          const core = (d.rules?.core ?? []).map((r) => (typeof r === "string" ? r : r.code));
          expect(core).toEqual(["canvas/overflow", "image/overflow", "image/glyph", "image/fit"]);
        });

        it("publishes each image's region in every format", () => {
          const d = family.describe();
          const pictogram = d.fields.find((f) => f.path === "pictogram") as
            | { regions?: Record<string, { box: number[]; pixels: number[] }> }
            | undefined;
          expect(Object.keys(pictogram?.regions ?? {})).toEqual(["near", "mid", "far"]);
          for (const region of Object.values(pictogram?.regions ?? {})) {
            expect(region.box).toHaveLength(2);
            expect(region.pixels).toHaveLength(2);
          }
        });

        it("makes a second building from the same factory, under its own id", () => {
          expect(family.describe().id).toBe("sightline.SignFamily");
          expect(foundry.describe().id).toBe("sightline.SignFamilyFoundry");
        });

        it("accepts its example in every format", () => {
          for (const format of ["near", "mid", "far"] as const) {
            const checked = family.check(EXAMPLE, { format });
            expect(checked.valid, format).toBe(true);
          }
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/template.test.ts`
      Expected: FAIL — `Failed to resolve import "../templates/sign-family"`

- [ ] **Step 3: Write `templates/sign-family.tsx`**

      ```tsx
      import {
        Canvas,
        Column,
        Heading,
        Image,
        Polygon,
        Row,
        Svg,
        Text,
        prop,
        token,
      } from "@hyper-elements/react";
      import { field, fitInside, template } from "@hyper-elements/react/template";
      import { copyFor } from "../src/copy";
      import { layoutFor, type FormatLayout } from "../src/layout";
      import { FORMATS, FORMAT_LABEL, type FormatName } from "../src/formats";
      import { haldenHouse, type SignBrand } from "../brand";

      /**
       * Paths, not bytes: a Canvas's `fonts` prop takes file paths, data: URIs or http(s) URLs.
       * Font bytes belong to renderImage's options. Every weight used below must be present, or
       * image/font-weight is an error.
       */
      const FONT_FACES = [
        { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-400-normal.woff", weight: 400 },
        { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-500-normal.woff", weight: 500 },
        { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-600-normal.woff", weight: 600 },
        { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-700-normal.woff", weight: 700 },
        { family: "Barlow Condensed", src: "../assets/fonts/barlow-condensed-latin-500-normal.woff", weight: 500 },
        { family: "Barlow Condensed", src: "../assets/fonts/barlow-condensed-latin-600-normal.woff", weight: 600 },
        { family: "Barlow Condensed", src: "../assets/fonts/barlow-condensed-latin-700-normal.woff", weight: 700 },
      ];

      type ArrowDir = "left" | "right" | "up" | "down" | "none";

      const ARROW_POINTS: Record<ArrowDir, string> = {
        right: "4,50 50,12 50,36 96,36 96,64 50,64 50,88",
        left: "96,50 50,12 50,36 4,36 4,64 50,64 50,88",
        up: "50,4 12,50 36,50 36,96 64,96 64,50 88,50",
        down: "50,96 12,50 36,50 36,4 64,4 64,50 88,50",
        none: "",
      };

      function arrow(brand: SignBrand, L: FormatLayout, dir: ArrowDir) {
        if (dir === "none") return null;
        const points = ARROW_POINTS[dir];

        if (brand.arrowStyle === "chevron") {
          return (
            <Svg width={L.arrowBox} height={L.arrowBox} viewBox="0 0 100 100" style={{ flex: "none" }}>
              <Polygon points={points} style={{ fill: token("colors.primary") }} />
            </Svg>
          );
        }

        return (
          <Column
            style={{
              width: L.arrowBox,
              height: L.arrowBox,
              borderRadius: L.arrowBox / 2,
              backgroundColor: token("colors.primary"),
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Svg width={L.arrowBox * 0.56} height={L.arrowBox * 0.56} viewBox="0 0 100 100">
              <Polygon points={points} style={{ fill: token("colors.primaryForeground") }} />
            </Svg>
          </Column>
        );
      }

      export function signFamily(brand: SignBrand, id: string) {
        const family = brand.fontFamily;

        return template({
          id,
          version: "1.0.0",
          label: `Wayfinding sign family — ${brand.label}`,
          guidance:
            "One destination per design. Give the long form for 3 m, the medium form for 12 m, and a three- or four-word short form for 30 m. Leave the short form out and the 30 m sign refuses by design — that is the point.",
          root: "Canvas",
          formats: FORMATS,
          fields: {
            destination: prop.text({ label: "Destination", required: true, maxLength: 60 }),
            long: prop.text({ label: "Long form (3 m)", required: true, maxLength: 120 }),
            medium: prop.text({ label: "Medium form (12 m)", required: true, maxLength: 60 }),
            short: prop.text({
              label: "Short form (30 m)",
              required: false,
              maxLength: 30,
              guidance:
                "Three or four words. Left empty, the 30 m sign carries the long form and refuses with image/fit.",
            }),
            arrow: prop.choice(["left", "right", "up", "down", "none"], {
              label: "Arrow",
              default: "right",
            }),
            pictogram: field.image({
              label: "Pictogram",
              required: true,
              fit: "contain",
              aspect: { min: 0.8, max: 1.2 },
              minWidth: 512,
              accepts: ["svg", "png"],
              transparent: "required",
            }),
          },
          rules: {
            require: { core: ["canvas/overflow", "image/overflow", "image/glyph", "image/fit"] },
          },
          example: {
            destination: "Car park",
            long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
            medium: "Visitor car park, north gate",
            short: "Visitor car park",
            arrow: "right",
            pictogram: { src: `${brand.pictogramDir}/car-park.png`, width: 512, height: 512 },
          },
          render(v, { format }) {
            const name = format as FormatName;
            const L = layoutFor(name);
            const copy = copyFor(name, v);
            const art = fitInside(v.pictogram, { width: L.pictogramBox, height: L.pictogramBox });

            const heading = (
              <Heading
                field={copy.field}
                fit={{ sizes: [...L.fitSizes], maxLines: L.maxLines }}
                style={{
                  fontFamily: family,
                  fontWeight: 700,
                  lineHeight: 1.04,
                  color: token("colors.foreground"),
                }}
              >
                {copy.text}
              </Heading>
            );

            const copyColumn = (
              <Column style={{ width: L.copyColumnWidth }}>
                {heading}
              </Column>
            );

            const pictogram = (
              <Image field="pictogram" src={v.pictogram} alt="" style={art} />
            );

            const arrowEl = arrow(brand, L, v.arrow as ArrowDir);

            const main =
              L.arrangement === "row" ? (
                <Row style={{ gap: L.gap, alignItems: "center" }}>
                  {pictogram}
                  {copyColumn}
                  {arrowEl}
                </Row>
              ) : (
                <Column style={{ gap: L.gap }}>
                  {pictogram}
                  <Row style={{ gap: L.gap, alignItems: "end" }}>
                    {copyColumn}
                    {arrowEl}
                  </Row>
                </Column>
              );

            return (
              <Canvas
                width={L.width}
                height={L.height}
                fonts={FONT_FACES}
                theme={brand.theme}
                lang="en"
                style={{
                  backgroundColor: token("colors.background"),
                  padding: L.padding,
                  fontFamily: family,
                }}
              >
                <Column
                  style={{
                    width: L.width - L.padding * 2,
                    height: L.height - L.padding * 2,
                    justifyContent: "space-between",
                  }}
                >
                  {main}
                  <Text
                    style={{
                      fontFamily: family,
                      fontSize: L.footSize,
                      fontWeight: 500,
                      letterSpacing: L.footSize * 0.12,
                      textTransform: "uppercase",
                      color: token("colors.muted"),
                    }}
                  >
                    {`${v.destination} · ${brand.label} · ${FORMAT_LABEL[name]}`}
                  </Text>
                </Column>
              </Canvas>
            );
          },
        });
      }

      export default signFamily(haldenHouse, "sightline.SignFamily");
      ```

      The default export is made from one sample brand; `signFamily` is the reusable part.

- [ ] **Step 4: Write `templates/sign-family-foundry.tsx`**

      ```tsx
      import { foundryNine } from "../brand";
      import { signFamily } from "./sign-family";

      export default signFamily(foundryNine, "sightline.SignFamilyFoundry");
      ```

- [ ] **Step 5: Run to confirm the refusal is reachable, then the gate**

      Run: `npx hyper-elements check templates/ && echo GATE-PASS`
      Expected: `GATE-PASS`

      This checks each template module with its `example` in **every** format — it is the proof that
      the example fits at 3 m, 12 m and 30 m. If it reports `image/fit` on `near`, the near copy
      column is too narrow for the example: raise `LAYOUT.near.copyColumnWidth` in `src/layout.ts` or
      lower its `fitSizes`, then re-run. Do not shorten the example to make it pass — the example is
      the specimen a filler copies.

- [ ] **Step 6: Commit (kernel-performed — no agent runs this)**
      Message: `feat: the sign-family Canvas template, in two buildings`

---

### Task 7: The refusal fixtures and the refusal test

**Files:**
- Create: `designs/_refusal/car-park.values.json`
- Create: `designs/_refusal/car-park-short.values.json`
- Create: `tests/refusal.test.ts`

**Depends on:** Task 6
**Effort:** high
**Model tier:** top
**Provides:** `designs/_refusal/car-park.values.json`, `designs/_refusal/car-park-short.values.json`
**Requires:** `signFamily`, `sightline.SignFamily`

- [ ] **Step 1: Write the failing test `tests/refusal.test.ts`**

      ```ts
      import { execFileSync } from "node:child_process";
      import { access, rm } from "node:fs/promises";
      import { describe, expect, it } from "vitest";

      const NO_SHORT = "designs/_refusal/car-park.values.json";
      const WITH_SHORT = "designs/_refusal/car-park-short.values.json";
      const OUT = "out/designs/_refusal";

      function run(args: string[]): { code: number; out: string } {
        try {
          const out = execFileSync("npx", ["hyper-elements", ...args], {
            encoding: "utf8",
            stdio: "pipe",
          });
          return { code: 0, out };
        } catch (e) {
          const err = e as { status?: number; stdout?: string; stderr?: string };
          return { code: err.status ?? 1, out: `${err.stdout ?? ""}${err.stderr ?? ""}` };
        }
      }

      type Diag = { code: string; field?: string; message: string; path?: string };

      function diagnostics(jsonLines: string): Diag[] {
        const found: Diag[] = [];
        const walk = (node: unknown): void => {
          if (Array.isArray(node)) {
            node.forEach(walk);
            return;
          }
          if (node && typeof node === "object") {
            const obj = node as Record<string, unknown>;
            if (typeof obj.code === "string") found.push(obj as unknown as Diag);
            Object.values(obj).forEach(walk);
          }
        };
        for (const line of jsonLines.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("{")) continue;
          try {
            walk(JSON.parse(trimmed));
          } catch {
            // the summary line is not JSON
          }
        }
        return found;
      }

      describe("the 30 m refusal", () => {
        it("fails a 30 m sign that has no short form", () => {
          const r = run(["check", NO_SHORT, "--json"]);
          expect(r.code).toBe(1);
          // A rule entry also carries a `code`; the diagnostic is the one that names a field.
          const fit = diagnostics(r.out).find(
            (d) => d.code === "image/fit" && typeof d.field === "string"
          );
          expect(fit, "no image/fit diagnostic with a field was reported").toBeDefined();
          expect(fit?.field).toBe("short");
          expect(fit?.message).toContain("cut about");
        });

        it("writes nothing for a refused design", async () => {
          await rm(OUT, { recursive: true, force: true });
          const r = run(["render", NO_SHORT]);
          expect(r.code).toBe(1);
          for (const format of ["near", "mid", "far"]) {
            await expect(access(`${OUT}/car-park.${format}.png`), format).rejects.toThrow();
          }
        });

        it("passes the same destination once the short form is written", () => {
          const r = run(["check", WITH_SHORT]);
          expect(r.code).toBe(0);
          expect(r.out).toContain("fit short:");
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/refusal.test.ts`
      Expected: FAIL — the fixture files do not exist yet

- [ ] **Step 3: Generate the two fixtures with the CLI**

      The `_` prefix keeps them out of folder-wide renders (`render designs/` skips `_` folders).

      ```bash
      npx hyper-elements design new templates/sign-family.tsx \
        -o designs/_refusal/car-park.values.json \
        --set destination="Car park" \
        --set long="Visitor car park — follow the blue P signs past the north gate and the delivery bay" \
        --set medium="Visitor car park, north gate" \
        --set arrow=right \
        --set pictogram=@assets/pictograms/car-park.png

      npx hyper-elements design new templates/sign-family.tsx \
        -o designs/_refusal/car-park-short.values.json \
        --set destination="Car park" \
        --set long="Visitor car park — follow the blue P signs past the north gate and the delivery bay" \
        --set medium="Visitor car park, north gate" \
        --set short="Visitor car park" \
        --set arrow=right \
        --set pictogram=@assets/pictograms/car-park.png
      ```

      `design new` writes the file even when a *measured* rule is still `not-run`; the refusal is
      decided later by `check`/`render`, which is exactly the behaviour the demo relies on.

- [ ] **Step 4: Run the gate**

      Run: `npx vitest run tests/refusal.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

      If `image/fit` is not reported, the copy column is too wide — a 3:1 canvas fits 82 characters
      on one line at 120 px. Narrow `LAYOUT.far.copyColumnWidth` in `src/layout.ts` and re-run. If the
      diagnostic has no `field`, the `field={copy.field}` binding was dropped from the `Heading`.

- [ ] **Step 5: Commit (kernel-performed — no agent runs this)**
      Message: `feat: prove the 30 m refusal demands content instead of deleting it`

---

### Task 8: The A3 sign schedule

**Files:**
- Create: `templates/sign-sheet.tsx`
- Create: `designs/_schedule/halden-house.values.json`
- Create: `tests/sheet.test.ts`

**Depends on:** Task 2, Task 3, Task 5
**Effort:** medium
**Model tier:** standard
**Provides:** `signSheet`, `sightline.SignSheet`
**Requires:** `assets/fonts/*.woff`, `MM`, `FORMAT_LABEL`, `SignBrand`, `haldenHouse`

- [ ] **Step 1: Write the failing test `tests/sheet.test.ts`**

      ```ts
      import { execFileSync } from "node:child_process";
      import { readFile } from "node:fs/promises";
      import { describe, expect, it } from "vitest";
      import { render } from "@hyper-elements/react";
      import sheet from "../templates/sign-sheet";

      const DESIGN = "designs/_schedule/halden-house.values.json";
      const PDF = "out/designs/_schedule/halden-house.a3.pdf";

      const VALUES = {
        building: "Halden House",
        rows: [
          {
            destination: "Car park",
            long: "Visitor car park — follow the blue P signs past the north gate",
            medium: "Visitor car park, north gate",
            short: "Visitor car park",
          },
        ],
      };

      describe("the sign schedule", () => {
        it("labels itself as design proofs, not print files", async () => {
          const { html } = await render(sheet.design(VALUES, { format: "a3" }));
          expect(html).toContain("Design proofs, not print files.");
        });

        it("renders an A3 PDF", async () => {
          execFileSync("npx", ["hyper-elements", "render", DESIGN], { stdio: "pipe" });
          const bytes = await readFile(PDF);
          expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
          expect(bytes.length).toBeGreaterThan(2_000);
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/sheet.test.ts`
      Expected: FAIL — the template and the design do not exist yet

- [ ] **Step 3: Write `templates/sign-sheet.tsx`**

      A `Document` root has **no `padding`** — it takes `margin`, and spacing goes on a `Column`
      inside. `prop.object(fields, { label })` needs the second argument.

      ```tsx
      import {
        Column,
        Document,
        Heading,
        Table,
        TableCell,
        TableRow,
        Text,
        prop,
      } from "@hyper-elements/react";
      import { template } from "@hyper-elements/react/template";
      import { MM, FORMAT_LABEL } from "../src/formats";
      import type { SignBrand } from "../brand";

      const FONT_FACES = [
        { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-400-normal.woff", weight: 400 },
        { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-600-normal.woff", weight: 600 },
        { family: "IBM Plex Sans", src: "../assets/fonts/ibm-plex-sans-latin-700-normal.woff", weight: 700 },
      ];

      const row = prop.object(
        {
          destination: prop.text({ label: "Destination", required: true, maxLength: 60 }),
          long: prop.text({ label: "Long form (3 m)", required: true, maxLength: 120 }),
          medium: prop.text({ label: "Medium form (12 m)", required: true, maxLength: 60 }),
          short: prop.text({ label: "Short form (30 m)", required: false, maxLength: 30 }),
        },
        { label: "Destination row" }
      );

      export function signSheet(brand: SignBrand) {
        return template({
          id: "sightline.SignSheet",
          version: "1.0.0",
          label: `Sign schedule — ${brand.label}`,
          root: "Document",
          formats: { a3: { size: "A3", orientation: "landscape" } },
          fields: {
            building: prop.text({ label: "Building", required: true, maxLength: 60 }),
            rows: prop.list(row, { label: "Destinations", min: 1, max: 8 }),
          },
          rules: { require: { core: ["document/overflow", "layout/overflow"] } },
          example: {
            building: brand.label,
            rows: [
              {
                destination: "Car park",
                long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
                medium: "Visitor car park, north gate",
                short: "Visitor car park",
              },
              {
                destination: "Toilets",
                long: "Toilets and accessible toilet, through the double doors on your left",
                medium: "Toilets, on your left",
                short: "Toilets",
              },
            ],
          },
          render(v) {
            const sizes = `near ${MM.near.width}×${MM.near.height} · mid ${MM.mid.width}×${MM.mid.height} · far ${MM.far.width}×${MM.far.height} mm`;
            return (
              <Document
                size="A3"
                orientation="landscape"
                fonts={FONT_FACES}
                lang="en"
                margin={40}
                style={{ fontFamily: "IBM Plex Sans" }}
              >
                <Column style={{ gap: 14 }}>
                  <Heading level={1} style={{ fontFamily: "IBM Plex Sans", fontSize: 26, fontWeight: 700 }}>
                    {`Sign schedule — ${v.building}`}
                  </Heading>
                  <Text style={{ fontFamily: "IBM Plex Sans", fontSize: 10, fontWeight: 400 }}>
                    {`Design proofs, not print files. ${sizes}. Character height follows ADA 2010 Standards Table 703.5.5 within its scope; beyond that the ratio in brand.ts is a declared assumption, and six words is a house limit, not a legal one.`}
                  </Text>
                  <Table
                    style={{
                      cellPadding: [6, 8],
                      rowBorder: { width: 1, style: "solid", color: "#DAD3C2" },
                    }}
                  >
                    <TableRow header>
                      <TableCell>Destination</TableCell>
                      <TableCell>{`Long form — ${FORMAT_LABEL.near}`}</TableCell>
                      <TableCell>{`Medium form — ${FORMAT_LABEL.mid}`}</TableCell>
                      <TableCell>{`Short form — ${FORMAT_LABEL.far}`}</TableCell>
                    </TableRow>
                    {v.rows.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell style={{ fontWeight: 600 }}>{r.destination}</TableCell>
                        <TableCell>{r.long}</TableCell>
                        <TableCell>{r.medium}</TableCell>
                        <TableCell>{r.short ?? "— refuses: write the short form"}</TableCell>
                      </TableRow>
                    ))}
                  </Table>
                </Column>
              </Document>
            );
          },
        });
      }
      ```

- [ ] **Step 4: Write the default export and the design**

      Append to `templates/sign-sheet.tsx`:

      ```tsx
      import { haldenHouse } from "../brand";

      export default signSheet(haldenHouse);
      ```

      Create the design with the CLI:

      ```bash
      npx hyper-elements design new templates/sign-sheet.tsx \
        -o designs/_schedule/halden-house.values.json \
        --set building="Halden House" \
        --set 'rows=[{"destination":"Car park","long":"Visitor car park — follow the blue P signs past the north gate and the delivery bay","medium":"Visitor car park, north gate","short":"Visitor car park"},{"destination":"Toilets","long":"Toilets and accessible toilet, through the double doors on your left","medium":"Toilets, on your left","short":"Toilets"}]'
      ```

- [ ] **Step 5: Run the gate**

      Run: `npx vitest run tests/sheet.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

      If `render` reports `style/unknown` on `padding`, the padding is on the `Document` instead of the
      inner `Column`. If it reports `template/spec` on `rows[]`, the `prop.object` is missing its
      `{ label }` second argument.

- [ ] **Step 6: Commit (kernel-performed — no agent runs this)**
      Message: `feat: the A3 sign schedule, as the fabricator handoff`

---

### Task 9: Prove the two buildings render differently

**Files:**
- Create: `tests/brands-render.test.ts`

**Depends on:** Task 5, Task 6
**Effort:** low
**Model tier:** standard
**Provides:** —
**Requires:** `signFamily`, `sightline.SignFamily`, `sightline.SignFamilyFoundry`, `haldenHouse`, `foundryNine`

- [ ] **Step 1: Write `tests/brands-render.test.ts`**

      ```ts
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
      ```

- [ ] **Step 2: Run the gate**

      Run: `npx vitest run tests/brands-render.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

      If `renderImage` throws `image/font`, a family named by the theme has no file in the `fonts`
      list — Barlow Condensed's 400 weight is not shipped, so do not ask for weight 400 in that brand.
      If it throws `image/unsupported` or a resvg error, the pictogram `src` key in the `images` map
      does not match the `src` in the design character-for-character.

- [ ] **Step 3: Commit (kernel-performed — no agent runs this)**
      Message: `test: prove one factory renders two visibly different buildings`
