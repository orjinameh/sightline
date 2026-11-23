# Family Implementation Plan

**Goal:** Turn one directory of destinations into a rendered sign family — values files per building, PNGs per distance, the 3 m / 12 m / 30 m strip, and the `describe()` contract image the README opens with.
**Architecture:** `directory/*.ts` is the only input; a builder writes one values file per destination per building; the CLI renders them; two script-built Canvases compose the strip and the contract view, so every image is produced by Hyper Elements itself.
**Tech Stack:** TypeScript 5.9.3 · Node 24 · React 19.3.1 · `@hyper-elements/react` 0.5.2 · `@hyper-elements/cli` 0.3.3 · `satori` 0.33.5 · `@resvg/resvg-js` 2.6.2 · `vitest` 5.1.1 · `tsx` 4.23.15
**Source spec:** docs/superpowers/specs/2026-11-23-sightline-sign-family-design.md

> **Facts this plan relies on (verified, spec §7).** A values file is `{ version, template: { module, id, version }, formats, values }`; the `sha256` and `assets` keys are optional. `render` writes `out/<design path>/<name>.<format>.png`. A folder whose name starts with `_` is skipped by folder-wide `check`/`render` — that is how the refusal fixtures and the schedule stay out of the family run. `renderImage(element, { fonts, images })` draws images from an `images` map keyed by the exact `src` string.

---

### Task 10: The destination directory

**Files:**
- Create: `src/directory.ts`
- Create: `directory/halden-house.ts`
- Create: `directory/foundry-nine.ts`
- Create: `tests/directory.test.ts`

**Depends on:** Task 1
**Effort:** low
**Model tier:** standard
**Provides:** `PictogramName`, `Arrow`, `Destination`, `Building`, `haldenHouseBuilding`, `foundryNineBuilding`
**Requires:** —

- [ ] **Step 1: Write the failing test `tests/directory.test.ts`**

      ```ts
      import { describe, expect, it } from "vitest";
      import { foundryNineBuilding, haldenHouseBuilding } from "../src/directory";

      const buildings = [haldenHouseBuilding, foundryNineBuilding];

      describe("the directory", () => {
        it("gives each building four destinations with a unique slug", () => {
          for (const b of buildings) {
            expect(b.destinations.length, b.id).toBe(4);
            const slugs = b.destinations.map((d) => d.slug);
            expect(new Set(slugs).size, b.id).toBe(slugs.length);
          }
        });

        it("gives every destination the three forms, and a short one short enough to fit 30 m", () => {
          for (const b of buildings) {
            for (const d of b.destinations) {
              expect(d.long.length, `${b.id}/${d.slug}`).toBeGreaterThan(d.medium.length);
              expect(d.medium.length, `${b.id}/${d.slug}`).toBeGreaterThanOrEqual(d.short.length);
              expect(d.short.length, `${b.id}/${d.slug}`).toBeLessThanOrEqual(30);
              expect(d.short.trim().split(/\s+/).length, `${b.id}/${d.slug}`).toBeLessThanOrEqual(4);
            }
          }
        });

        it("points each building at its own template and pictogram colourway", () => {
          expect(haldenHouseBuilding.templateId).toBe("sightline.SignFamily");
          expect(foundryNineBuilding.templateId).toBe("sightline.SignFamilyFoundry");
          expect(haldenHouseBuilding.pictogramDir).not.toBe(foundryNineBuilding.pictogramDir);
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/directory.test.ts`
      Expected: FAIL — `Failed to resolve import "../src/directory"`

- [ ] **Step 3: Write `src/directory.ts`**

      Paths are stored **repo-root relative**; the builder adds the `../../` prefix for the values
      file's location, so a wrong prefix is impossible to write twice.

      ```ts
      export type PictogramName = "car-park" | "toilets" | "reception" | "lift" | "exit";

      export type Arrow = "left" | "right" | "up" | "down" | "none";

      /**
       * The directory's shape — deliberately NOT `SignValues`. A destination carries a pictogram
       * *name*; `scripts/build-directory.ts` maps it to the `{ src, width, height }` that
       * `SignValues.pictogram` expects. Keeping them apart is what lets one directory feed two
       * colourways, and it keeps the directory free of file paths.
       */
      export type Destination = {
        slug: string;
        destination: string;
        long: string;
        medium: string;
        short: string;
        arrow: Arrow;
        pictogram: PictogramName;
      };

      export type Building = {
        id: string;
        label: string;
        /** Repo-root relative, e.g. "templates/sign-family.tsx". */
        templateModule: string;
        templateId: string;
        /** Repo-root relative, e.g. "assets/pictograms". */
        pictogramDir: string;
        destinations: Destination[];
      };

      export { haldenHouseBuilding } from "../directory/halden-house";
      export { foundryNineBuilding } from "../directory/foundry-nine";
      ```

- [ ] **Step 4: Write `directory/halden-house.ts`**

      ```ts
      import type { Building } from "../src/directory";

      export const haldenHouseBuilding: Building = {
        id: "halden-house",
        label: "Halden House",
        templateModule: "templates/sign-family.tsx",
        templateId: "sightline.SignFamily",
        pictogramDir: "assets/pictograms",
        destinations: [
          {
            slug: "car-park",
            destination: "Car park",
            long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
            medium: "Visitor car park, north gate",
            short: "Visitor car park",
            arrow: "right",
            pictogram: "car-park",
          },
          {
            slug: "toilets",
            destination: "Toilets",
            long: "Toilets and accessible toilet, through the double doors on your left",
            medium: "Toilets, on your left",
            short: "Toilets",
            arrow: "left",
            pictogram: "toilets",
          },
          {
            slug: "reception",
            destination: "Reception",
            long: "Reception and visitor sign-in, at the top of the main stair",
            medium: "Reception, main stair",
            short: "Reception",
            arrow: "up",
            pictogram: "reception",
          },
          {
            slug: "lift",
            destination: "Lifts",
            long: "Lifts to levels one to four, past reception on the right",
            medium: "Lifts, past reception",
            short: "Lifts",
            arrow: "right",
            pictogram: "lift",
          },
        ],
      };
      ```

- [ ] **Step 5: Write `directory/foundry-nine.ts`**

      ```ts
      import type { Building } from "../src/directory";

      export const foundryNineBuilding: Building = {
        id: "foundry-nine",
        label: "Foundry Nine",
        templateModule: "templates/sign-family-foundry.tsx",
        templateId: "sightline.SignFamilyFoundry",
        pictogramDir: "assets/pictograms/light",
        destinations: [
          {
            slug: "car-park",
            destination: "Car park",
            long: "Staff and visitor parking, entered from Foundry Lane at the rear of the building",
            medium: "Parking, Foundry Lane",
            short: "Parking",
            arrow: "right",
            pictogram: "car-park",
          },
          {
            slug: "toilets",
            destination: "Toilets",
            long: "Toilets, changing places and showers, along the north wall of the workshop",
            medium: "Toilets, north wall",
            short: "Toilets",
            arrow: "left",
            pictogram: "toilets",
          },
          {
            slug: "reception",
            destination: "Reception",
            long: "Reception and site induction, first floor above the loading bay",
            medium: "Reception, first floor",
            short: "Reception",
            arrow: "up",
            pictogram: "reception",
          },
          {
            slug: "lift",
            destination: "Lifts",
            long: "Freight and passenger lifts, beyond the loading bay on the left",
            medium: "Lifts, beyond loading",
            short: "Lifts",
            arrow: "left",
            pictogram: "lift",
          },
        ],
      };
      ```

- [ ] **Step 6: Run the gate**

      Run: `npx vitest run tests/directory.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

- [ ] **Step 7: Commit (kernel-performed — no agent runs this)**
      Message: `feat: the destination directory for two buildings`

---

### Task 11: Directory to values files

**Files:**
- Create: `scripts/build-directory.ts`
- Create: `tests/build-directory.test.ts`
- Create: `designs/halden-house/car-park.values.json`
- Create: `designs/halden-house/toilets.values.json`
- Create: `designs/halden-house/reception.values.json`
- Create: `designs/halden-house/lift.values.json`
- Create: `designs/foundry-nine/car-park.values.json`
- Create: `designs/foundry-nine/toilets.values.json`
- Create: `designs/foundry-nine/reception.values.json`
- Create: `designs/foundry-nine/lift.values.json`

**Depends on:** Task 6, Task 10
**Effort:** medium
**Model tier:** standard
**Provides:** `designs/halden-house/<slug>.values.json`, `designs/foundry-nine/<slug>.values.json`
**Requires:** `Building`, `haldenHouseBuilding`, `foundryNineBuilding`

- [ ] **Step 1: Write the failing test `tests/build-directory.test.ts`**

      ```ts
      import { readFile } from "node:fs/promises";
      import { describe, expect, it } from "vitest";
      import { foundryNineBuilding, haldenHouseBuilding } from "../src/directory";

      describe("the generated family", () => {
        it("writes one values file per destination per building", async () => {
          for (const b of [haldenHouseBuilding, foundryNineBuilding]) {
            for (const d of b.destinations) {
              const path = `designs/${b.id}/${d.slug}.values.json`;
              const file = JSON.parse(await readFile(path, "utf8")) as {
                template: { id: string; module: string; version: string };
                formats: string[];
                values: { short?: string; pictogram: { src: string } };
              };
              expect(file.template.id, path).toBe(b.templateId);
              expect(file.template.module, path).toBe(`../../${b.templateModule}`);
              expect(file.formats, path).toEqual(["near", "mid", "far"]);
              expect(file.values.short, path).toBe(d.short);
              expect(file.values.pictogram.src, path).toBe(
                `../../${b.pictogramDir}/${d.pictogram}.png`
              );
            }
          }
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/build-directory.test.ts`
      Expected: FAIL — `ENOENT: no such file or directory, open 'designs/halden-house/car-park.values.json'`

- [ ] **Step 3: Write `scripts/build-directory.ts`**

      ```ts
      import { mkdir, writeFile } from "node:fs/promises";
      import { dirname } from "node:path";
      import { foundryNineBuilding, haldenHouseBuilding } from "../src/directory";
      import type { Building } from "../src/directory";

      const TEMPLATE_VERSION = "1.0.0";

      function valuesFile(b: Building, d: Building["destinations"][number]): unknown {
        return {
          version: 1,
          template: {
            module: `../../${b.templateModule}`,
            id: b.templateId,
            version: TEMPLATE_VERSION,
          },
          formats: ["near", "mid", "far"],
          values: {
            destination: d.destination,
            long: d.long,
            medium: d.medium,
            short: d.short,
            arrow: d.arrow,
            pictogram: {
              src: `../../${b.pictogramDir}/${d.pictogram}.png`,
              width: 512,
              height: 512,
            },
          },
        };
      }

      async function main(): Promise<void> {
        let written = 0;
        for (const b of [haldenHouseBuilding, foundryNineBuilding]) {
          for (const d of b.destinations) {
            const path = `designs/${b.id}/${d.slug}.values.json`;
            await mkdir(dirname(path), { recursive: true });
            await writeFile(path, `${JSON.stringify(valuesFile(b, d), null, 2)}\n`, "utf8");
            written += 1;
          }
        }
        console.log(`build:directory: wrote ${written} values files`);
      }

      await main();
      ```

- [ ] **Step 4: Run the gate**

      Run: `npm run build:directory && npx hyper-elements check designs/ && npx vitest run tests/build-directory.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

      `check designs/` skips the `_refusal/` and `_schedule/` folders, so it validates exactly the
      eight generated designs. If a design reports `template/id`, the `template.id` in the builder does
      not match the module's `id`. If it reports `image/font`, a weight used by the brand is missing
      from `FONT_FACES`.

- [ ] **Step 5: Commit (kernel-performed — no agent runs this)**
      Message: `feat: turn the directory into values files for both buildings`

---

### Task 12: Render every design

**Files:**
- Create: `scripts/render-all.ts`
- Create: `tests/render.test.ts`

**Depends on:** Task 11
**Effort:** medium
**Model tier:** standard
**Provides:** `out/designs/**/*.png`
**Requires:** `designs/halden-house/<slug>.values.json`, `designs/foundry-nine/<slug>.values.json`

- [ ] **Step 1: Write the failing test `tests/render.test.ts`**

      ```ts
      import { readFile } from "node:fs/promises";
      import { describe, expect, it } from "vitest";

      function dimensions(png: Buffer): { width: number; height: number } {
        return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
      }

      describe("the rendered family", () => {
        it("renders each distance at the size its format declares", async () => {
          const expected = {
            near: { width: 1772, height: 1181 },
            mid: { width: 3543, height: 1772 },
            far: { width: 5315, height: 1772 },
          } as const;

          for (const format of ["near", "mid", "far"] as const) {
            const png = await readFile(`out/designs/halden-house/car-park.${format}.png`);
            expect(dimensions(png), format).toEqual(expected[format]);
          }
        });

        it("renders both buildings", async () => {
          const png = await readFile("out/designs/foundry-nine/car-park.far.png");
          expect(dimensions(png)).toEqual({ width: 5315, height: 1772 });
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/render.test.ts`
      Expected: FAIL — `ENOENT: no such file or directory, open 'out/designs/halden-house/car-park.near.png'`

- [ ] **Step 3: Write `scripts/render-all.ts`**

      ```ts
      import { execFileSync } from "node:child_process";

      execFileSync("npx", ["hyper-elements", "render", "designs/", "--out", "out"], {
        stdio: "inherit",
      });

      console.log("render:designs: wrote out/designs/");
      ```

- [ ] **Step 4: Run the gate**

      Run: `npm run render:designs && npx vitest run tests/render.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

      If the far PNG is a different size, `DPI` in `src/formats.ts` was changed — 150 DPI is the proof
      resolution and the refusal test is calibrated to it.

- [ ] **Step 5: Commit (kernel-performed — no agent runs this)**
      Message: `feat: render every destination at all three distances`

---

### Task 13: The 3 m / 12 m / 30 m strip

**Files:**
- Create: `scripts/strip.tsx`
- Create: `tests/strip.test.ts`
- Create: `docs/images/strip.png`

**Depends on:** Task 12
**Effort:** medium
**Model tier:** standard
**Provides:** `docs/images/strip.png`
**Requires:** `out/designs/**/*.png`

- [ ] **Step 1: Write the failing test `tests/strip.test.ts`**

      ```ts
      import { readFile } from "node:fs/promises";
      import { describe, expect, it } from "vitest";

      describe("the strip", () => {
        it("puts the three distances at one scale in a single image", async () => {
          const png = await readFile("docs/images/strip.png");
          expect(png.readUInt32BE(16)).toBe(3840);
          expect(png.readUInt32BE(20)).toBe(800);
          expect(png.length).toBeGreaterThan(50_000);
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/strip.test.ts`
      Expected: FAIL — `ENOENT: no such file or directory, open 'docs/images/strip.png'`

- [ ] **Step 3: Write `scripts/strip.tsx`**

      A common scale is the whole point: the far sign is three times the near sign's width, and the
      copy — not the type size alone — is what changed.

      ```tsx
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
      ```

- [ ] **Step 4: Run the gate**

      Run: `npm run render:designs && npm run strip && npx vitest run tests/strip.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

      The gate renders first on purpose: `out/` is gitignored, so a stateless executor's worktree has
      no PNGs to compose. If `renderImage` reports `image/font`, a family in `FONTS` has no file. If
      the image comes out blank, an `images` key does not match its `src` exactly — both are `p.file`.

- [ ] **Step 5: Commit (kernel-performed — no agent runs this)**
      Message: `feat: the 3 m / 12 m / 30 m strip at one scale`

---

### Task 14: The `describe()` contract image

**Files:**
- Create: `scripts/contract-image.tsx`
- Create: `tests/contract.test.ts`
- Create: `docs/contract.json`
- Create: `docs/images/contract.png`

**Depends on:** Task 3, Task 6
**Effort:** medium
**Model tier:** standard
**Provides:** `docs/contract.json`, `docs/images/contract.png`
**Requires:** `signFamily`, `sightline.SignFamily`, `FORMATS`, `MM`, `FORMAT_LABEL`, `FormatName`

- [ ] **Step 1: Write the failing test `tests/contract.test.ts`**

      ```ts
      import { readFile } from "node:fs/promises";
      import { describe, expect, it } from "vitest";

      describe("the contract view", () => {
        it("commits the real describe() output", async () => {
          const d = JSON.parse(await readFile("docs/contract.json", "utf8")) as {
            id: string;
            formats: Record<string, unknown>;
            fields: Array<{ path: string }>;
            rules: { core: Array<{ code: string; stage: string }> };
          };
          expect(d.id).toBe("sightline.SignFamily");
          expect(Object.keys(d.formats)).toEqual(["near", "mid", "far"]);
          expect(d.fields).toHaveLength(6);
          expect(d.rules.core.map((r) => r.code)).toContain("image/fit");
          expect(d.rules.core.find((r) => r.code === "image/fit")?.stage).toBe("measured");
        });

        it("draws that contract as the README's first image", async () => {
          const png = await readFile("docs/images/contract.png");
          expect(png.readUInt32BE(16)).toBe(2000);
          expect(png.readUInt32BE(20)).toBe(1400);
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/contract.test.ts`
      Expected: FAIL — `ENOENT: no such file or directory, open 'docs/contract.json'`

- [ ] **Step 3: Write `scripts/contract-image.tsx`**

      ```tsx
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
        if (field.schema.maxLength !== undefined) parts.push(`≤ ${field.schema.maxLength} chars`);
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
            <Column style={{ gap: 28 }}>
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
      ```

- [ ] **Step 4: Run the gate**

      Run: `npm run contract && npx vitest run tests/contract.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

      If the rows overflow the canvas, `canvas/overflow` is only an estimate — check the image. If
      `describe()` has no `fit` on `short`, the `fit` prop was put on the `Text` wrapper instead of the
      `Heading` that carries `field={copy.field}`.

- [ ] **Step 5: Commit (kernel-performed — no agent runs this)**
      Message: `feat: draw the describe() contract as the README's first image`

---

### Task 15: The one-command demo

**Files:**
- Create: `tests/demo.test.ts`

**Depends on:** Task 12, Task 13, Task 14
**Effort:** low
**Model tier:** standard
**Provides:** —
**Requires:** `out/designs/**/*.png`, `docs/images/strip.png`, `docs/contract.json`, `docs/images/contract.png`

- [ ] **Step 1: Write `tests/demo.test.ts`**

      ```ts
      import { execFileSync } from "node:child_process";
      import { readFile } from "node:fs/promises";
      import { describe, expect, it } from "vitest";

      function size(png: Buffer): { w: number; h: number } {
        return { w: png.readUInt32BE(16), h: png.readUInt32BE(20) };
      }

      describe("the demo", () => {
        it("reproduces every image in one command", async () => {
          // No directory deletion: this suite runs alongside the render and strip tests, and they
          // share out/ and docs/images. Asserting real dimensions is what catches a blank render.
          execFileSync("npm", ["run", "demo"], { stdio: "pipe" });

          expect(size(await readFile("docs/images/strip.png"))).toEqual({ w: 3840, h: 800 });
          expect(size(await readFile("docs/images/contract.png"))).toEqual({ w: 2000, h: 1400 });

          const described = JSON.parse(await readFile("docs/contract.json", "utf8")) as {
            formats: Record<string, unknown>;
          };
          expect(Object.keys(described.formats)).toEqual(["near", "mid", "far"]);

          const expected = {
            "out/designs/halden-house/car-park.near.png": { w: 1772, h: 1181 },
            "out/designs/halden-house/car-park.mid.png": { w: 3543, h: 1772 },
            "out/designs/halden-house/car-park.far.png": { w: 5315, h: 1772 },
            "out/designs/foundry-nine/car-park.far.png": { w: 5315, h: 1772 },
          } as const;

          for (const [path, dims] of Object.entries(expected)) {
            expect(size(await readFile(path)), path).toEqual(dims);
          }
        });
      });
      ```

- [ ] **Step 2: Run the gate**

      Run: `npx vitest run tests/demo.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

      If it fails on a missing output, run `npm run demo` directly and read which step stopped — the
      chain is `assets → build:directory → render:designs → strip → contract`.

- [ ] **Step 3: Commit (kernel-performed — no agent runs this)**
      Message: `test: prove one command reproduces every image`
