# Docs Implementation Plan

**Goal:** A README that opens with the `describe()` contract — not a pretty sign — states the print and compliance limits honestly, and passes a mechanical conformance check.
**Architecture:** One ordinary task writes `README.md` to schema R3-cli-tool plus a checker script that enforces the stamp, the locked heading order, the first-image rule, the required fragments and the three forbidden strings.
**Tech Stack:** TypeScript 5.9.3 · Node 24 · `@hyper-elements/react` 0.5.2 · `@hyper-elements/cli` 0.3.3
**Source spec:** docs/superpowers/specs/2026-11-23-sightline-sign-family-design.md

---

### Task 16: The README

**Files:**
- Modify: `README.md`
- Create: `scripts/check-readme.mjs`

**Depends on:** Task 7, Task 9, Task 13, Task 14, Task 15
**Effort:** medium
**Model tier:** standard
**Provides:** `README.md`, `scripts/check-readme.mjs`
**Requires:** `designs/_refusal/car-park.values.json`, `designs/_refusal/car-park-short.values.json`, `docs/images/strip.png`, `docs/contract.json`, `docs/images/contract.png`

- [ ] **Step 1: Write the failing check `scripts/check-readme.mjs`**

      Schema **R3-cli-tool v1**, no event overlay: the event's three README requirements map onto
      `## Demo` (preview media), `## Quickstart` (setup/reproduce) and `### Hyper Elements implementation`
      inside `## How it works` (implementation). Adding duplicate `##` headings for them would break
      the "easy to understand" criterion the event also judges.

      ```js
      import { readFileSync } from "node:fs";

      const STAMP = "<!-- readme-schema: R3-cli-tool v1 -->";

      const WANT = [
        "# Sightline",
        "## Demo",
        "## What it does",
        "## Quickstart",
        "## Built at Hyper Elements Template Challenge",
        "## Install",
        "## Usage",
        "## Commands / API reference",
        "## How it works",
        "## Roadmap",
        "## License",
      ];

      const FORBIDDEN = ["print-ready", "ADA compliant at 30 m", "the legal maximum is six words"];

      const REQUIRED = [
        "These are design proofs, not print files.",
        "declared assumption",
        "house limit",
        "image/fit",
        "npx hyper-elements describe",
      ];

      const text = readFileSync("README.md", "utf8");
      const lines = text.split(/\r?\n/);

      const fail = (message) => {
        console.log(`FAIL: ${message}`);
        process.exit(1);
      };

      if (lines[0] !== STAMP) fail(`line 1 is not the schema stamp: ${JSON.stringify(lines[0])}`);

      let inFence = false;
      const got = [];
      for (const line of lines) {
        if (line.startsWith("```")) {
          inFence = !inFence;
          continue;
        }
        if (!inFence && /^#{1,2} /.test(line)) got.push(line);
      }

      if (got.length !== WANT.length) {
        fail(`expected ${WANT.length} headings, found ${got.length}: ${JSON.stringify(got)}`);
      }
      for (let i = 0; i < WANT.length; i++) {
        if (got[i] !== WANT[i]) {
          fail(`heading ${i + 1}: expected ${JSON.stringify(WANT[i])}, found ${JSON.stringify(got[i])}`);
        }
      }

      const lower = text.toLowerCase();
      for (const phrase of FORBIDDEN) {
        if (lower.includes(phrase.toLowerCase())) {
          fail(`forbidden string present: ${JSON.stringify(phrase)}`);
        }
      }

      for (const fragment of REQUIRED) {
        if (!text.includes(fragment)) fail(`required fragment missing: ${JSON.stringify(fragment)}`);
      }

      const firstImage = text.match(/!\[[^\]]*\]\(([^)\s]+)/);
      if (!firstImage) fail("no image found");
      if (!firstImage[1].endsWith("docs/images/contract.png")) {
        fail(`the first image must be docs/images/contract.png, found ${firstImage[1]}`);
      }

      console.log("PASS");
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `node scripts/check-readme.mjs`
      Expected: FAIL — `line 1 is not the schema stamp`

- [ ] **Step 3: Write `README.md`**

      Every heading below is literal and in this order; the check is case-sensitive.

      ````markdown
      <!-- readme-schema: R3-cli-tool v1 -->

      # Sightline

      A wayfinding sign family where one directory of destinations renders at 3 m, 12 m and 30 m — and the distance changes the copy, not just the type size.

      ## Demo

      ![The contract an agent fills: sightline.SignFamily, three formats, six fields, four measured rules](docs/images/contract.png)

      ![The same destination at 3 m, 12 m and 30 m, at one scale](docs/images/strip.png)

      TBD-post-build:demo media — a short GIF of the 30 m refusal followed by the strip

      ## What it does

      A building's signs are designed one at a time. A sign that reads well in a 3 m lobby is copied to the end of a 30 m corridor and becomes unreadable, or someone shortens the copy by hand and the family stops agreeing with itself. Sightline makes the family one artifact: a single directory of destinations is the only input, and one Hyper Elements template renders each destination at three viewing distances, choosing **which copy the sign carries** from the distance. When the copy cannot fit, the template refuses with `image/fit`, names the field and says roughly how much to cut — the refused sign is not drawn, so nothing is silently deleted. Add the short form and the family re-renders, with the 3 m and 12 m signs untouched.

      ## Quickstart

      ```bash
      npm install
      npm run demo
      ```

      That regenerates the contract view and the strip in this README, plus the sign PNGs under `out/`. The A3 sign schedule is its own render:

      ```bash
      npx hyper-elements render designs/_schedule/halden-house.values.json
      ```

      The money shot is a refusal. `designs/_refusal/car-park.values.json` is a 30 m sign with no short form:

      ```bash
      npx hyper-elements check designs/_refusal/car-park.values.json
      # exit 1
      #   error image/fit ... it takes 4 lines at 280px, its smallest size, and fits 1:
      #     cut about 63 characters (required by sightline.SignFamily)
      #   rule image/fit (far): failed
      #   fit short: no size fits

      npx hyper-elements render designs/_refusal/car-park.values.json
      # exit 1 — the 30 m PNG is not written (the 3 m and 12 m PNGs are)

      npx hyper-elements check designs/_refusal/car-park-short.values.json
      # exit 0
      #   fit short: 400px (fits at 400, 340, 280)
      ```

      The two fixtures are committed as they are so the test suite can assert both outcomes. To make the edit yourself, work on a copy:

      ```bash
      cp designs/_refusal/car-park.values.json designs/_refusal/car-park-demo.values.json
      npx hyper-elements design set designs/_refusal/car-park-demo.values.json short="Visitor car park"
      npx hyper-elements check designs/_refusal/car-park-demo.values.json
      # exit 0
      rm designs/_refusal/car-park-demo.values.json
      ```

      ## Built at Hyper Elements Template Challenge

      Built during the challenge window (16–29 November 2026) for the Hyper Elements Template Challenge by Unlayer. One pool, no categories. Team: solo builder with AI agents. The template surface used here — `formats`, `fit`, `field.image` limits, `require.core`, `extendTheme`, `describe()`, values files and `renderPdf()` — is the v0.5 system the challenge shipped to elicit.

      ## Install

      Node 24 and npm. Then:

      ```bash
      npm install
      ```

      Fonts and pictograms are committed under `assets/`, so rendering fetches nothing: `renderImage()` and `renderPdf()` take bytes, never URLs.

      ## Usage

      Read the contract before filling anything:

      ```bash
      npx hyper-elements describe templates/sign-family.tsx --json
      ```

      Make a sign from the directory, or edit one value:

      ```bash
      npm run build:directory
      npx hyper-elements design set designs/halden-house/car-park.values.json short="Visitor car park"
      npx hyper-elements render designs/halden-house/car-park.values.json
      ```

      `render` writes one file per format — `car-park.near.png`, `car-park.mid.png`, `car-park.far.png`.

      ## Commands / API reference

      | Command | What it does |
      |---|---|
      | `npx hyper-elements describe templates/sign-family.tsx --json` | Formats, every field with its limits, each image's region per format, and the rules |
      | `npx hyper-elements design new templates/sign-family.tsx -o designs/x.values.json` | Writes a values file once the template accepts it |
      | `npx hyper-elements design set designs/x.values.json short="…"` | Changes one value, checked by the template |
      | `npx hyper-elements check designs/` | Values, images, fitted text, then each format |
      | `npx hyper-elements render designs/` | The same checks, then one PNG per format |
      | `npx hyper-elements check designs/ --require-template sightline.SignFamily` | Fails any design the template did not check |

      The template opens six fields — `destination`, `long` (3 m), `medium` (12 m), `short` (30 m), `arrow`, `pictogram` — at three formats, and requires four measured rules: `canvas/overflow`, `image/overflow`, `image/glyph` and `image/fit`.

      ## How it works

      The distance chooses the copy, and the format chooses the distance:

      | Format | Viewing distance | Copy it carries | Size |
      |---|---|---|---|
      | `near` | 3 m | the long form | 300 × 200 mm |
      | `mid` | 12 m | the medium form | 600 × 300 mm |
      | `far` | 30 m | the short form — or the long form, and then it refuses | 900 × 300 mm |

      The copy sits in a bounded column, and that column is the copy budget. A 3:1 sign is wide: at its full width an 82-character long form fits on one line at 120 px and nothing refuses. Bound the column to 3200 px and the same copy needs four lines at the smallest size, which is what `image/fit` measures and reports.

      `image/fit` is the library's measured refusal. It is decided when the image is measured with its fonts, so `check` and `render` decide it — an in-memory `check()` leaves it `not-run`, and a rule that did not run never counts as passed. `render` never writes the format that fails, which is what makes "refuse, never delete" true rather than a slogan.

      Two buildings come from one factory: `signFamily(brand, id)` is called twice, and each brand is an `extendTheme` of a shared base — Halden House in IBM Plex Sans on ivory and deep green with a circled arrow; Foundry Nine in Barlow Condensed on near-black and signal yellow with a chevron. Different ground, type family, type width, grid and arrow — not a recolour.

      ![Foundry Nine, the same destination in a second building: near-black ground, white Barlow Condensed, a yellow chevron](docs/images/signs/foundry-nine/car-park.far.png)

      All 24 renders — 8 destinations × 3 distances × 2 buildings — are committed under [`docs/images/signs/`](docs/images/signs).

      ### Hyper Elements implementation

      The template is the product, and the v0.5 template surface is what makes it a product rather than a picture:

      - **`formats`** — three named Canvas sizes, and `render` builds each one, so `template/format` checks that what was drawn is the size the format declares.
      - **`fit` and `image/fit`** — fitted text in a Canvas, measured with real fonts, refusing with the field name and roughly how much to cut.
      - **`field.image` limits** — `aspect`, `minWidth`, `accepts` and `transparent`, checked against the file.
      - **`require.core`** — four measured rules on every design, with `passed` / `failed` / `not-run`.
      - **`extendTheme`** — two buildings from one base theme.
      - **`describe()`** — the contract an agent fills, drawn as this README's first image from `docs/contract.json`.
      - **Values files** — the designs are data, so nothing runs before the template checks it.
      - **`renderPdf()`** — the A3 sign schedule, as the fabricator handoff.

      **These are design proofs, not print files.** Each sign is rendered by Hyper Elements at its own scale so the type size and the copy budget can be checked; send the PDF and the sign schedule to your fabricator for substrate, bleed and colour. Character height follows ADA 2010 Standards Table 703.5.5 within its scope (characters 40–120 in above the floor). Beyond that distance the legibility ratio in `brand.ts` is a declared assumption you should replace with your fabricator's — it is not a standard, and six words is our house limit, not a legal one.

      ## Roadmap

      - The three formats are the family's three **viewing-distance roles**, rendered at model proof sizes (300 × 200, 600 × 300 and 900 × 300 mm at 150 DPI). They are not production sizes.
      - The legibility ratio in `brand.ts` is a **declared assumption**, cited from the standard only within its scope; replace it with your fabricator's.
      - The word budget is a **house limit** in `brand.ts`, never a rule: `require.core` is a closed set of seven codes, so the budget is enforced by fit, not by a word count.
      - No print claim, no bleed, no CMYK, no substrate. The A3 document is a sign schedule.
      - Next: a `migrate` entry when the field set changes, and an image-field slot for a second pictogram.

      ## License

      MIT. Fonts are OFL (IBM Plex Sans, IBM Plex Mono, Barlow Condensed). The pictograms are drawn in this repository.
      ````

- [ ] **Step 4: Run the gate**

      Run: `node scripts/check-readme.mjs`
      Expected: `PASS`

      If it reports a heading mismatch, the offending heading is printed with its index — the list is
      case-sensitive and order-locked. If it reports the first image, the `## Demo` section must open
      with `docs/images/contract.png`; the strip follows it.

- [ ] **Step 5: Commit (kernel-performed — no agent runs this)**
      Message: `docs: the README, opening with the contract and honest about its limits`

---

### Task 17: The preview page

**Files:**
- Create: `docs/index.html`
- Create: `vercel.json`
- Create: `tests/pages.test.ts`

**Depends on:** Task 13, Task 14
**Effort:** low
**Model tier:** standard
**Provides:** `docs/index.html`, `vercel.json`
**Requires:** `docs/images/strip.png`, `docs/contract.json`, `docs/images/contract.png`

- [ ] **Step 1: Write the failing test `tests/pages.test.ts`**

      ```ts
      import { readFile } from "node:fs/promises";
      import { describe, expect, it } from "vitest";

      const FORBIDDEN = ["print-ready", "ADA compliant at 30 m", "the legal maximum is six words"];

      describe("the preview page", () => {
        it("opens with the contract, and every path is relative to docs/", async () => {
          const html = await readFile("docs/index.html", "utf8");
          expect(html).toContain("<title>Sightline</title>");

          const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
          expect(imgs[0]).toBe("images/contract.png");
          expect(imgs).toContain("images/strip.png");
          expect(imgs.some((src) => src.includes("signs/foundry-nine"))).toBe(true);

          for (const phrase of FORBIDDEN) {
            expect(html.toLowerCase(), phrase).not.toContain(phrase.toLowerCase());
          }
        });

        it("can be deployed to Vercel as a static site", async () => {
          const cfg = JSON.parse(await readFile("vercel.json", "utf8")) as {
            outputDirectory?: string;
          };
          expect(cfg.outputDirectory).toBe("docs");
        });
      });
      ```

- [ ] **Step 2: Run to confirm it fails**

      Run: `npx vitest run tests/pages.test.ts`
      Expected: FAIL — `ENOENT: no such file or directory, open 'docs/index.html'`

- [ ] **Step 3: Write `docs/index.html`**

      Static, no JavaScript, no build step. Image paths are relative to `docs/` because that folder is
      the site root on GitHub Pages *and* the Vercel output directory.

      ```html
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Sightline</title>
          <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%231f4d3f'/%3E%3Cpath d='M24 48V16h10a10 10 0 0 1 0 20H24' fill='none' stroke='%23ffffff' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E" />
          <style>
            :root { --ink: #14201c; --muted: #6b6a5f; --rule: #dad3c2; --ground: #f4f1ea; --green: #1f4d3f; }
            * { box-sizing: border-box; }
            body { margin: 0; background: var(--ground); color: var(--ink);
                   font: 16px/1.6 "IBM Plex Sans", -apple-system, Segoe UI, Roboto, sans-serif; }
            main { max-width: 1100px; margin: 0 auto; padding: 48px 24px 96px; }
            h1 { font-size: 44px; line-height: 1.05; margin: 0 0 8px; letter-spacing: -0.02em; }
            h2 { font-size: 22px; margin: 56px 0 12px; }
            p.lede { font-size: 19px; color: var(--muted); margin: 0 0 8px; max-width: 62ch; }
            code, pre { font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace; }
            pre { background: #fff; border: 1px solid var(--rule); border-radius: 10px;
                  padding: 16px 18px; overflow-x: auto; font-size: 14px; line-height: 1.55; }
            img { width: 100%; height: auto; display: block; border: 1px solid var(--rule);
                  border-radius: 10px; background: #fff; }
            figure { margin: 0; }
            figcaption { font-size: 14px; color: var(--muted); margin-top: 8px; }
            .grid { display: grid; gap: 20px; grid-template-columns: 1fr; }
            @media (min-width: 720px) { .grid.two { grid-template-columns: 1fr 1fr; } }
            .pill { display: inline-block; font-family: "IBM Plex Mono", monospace; font-size: 13px;
                    background: var(--green); color: #fff; border-radius: 999px; padding: 4px 12px; margin-right: 8px; }
            footer { margin-top: 64px; padding-top: 20px; border-top: 1px solid var(--rule);
                     font-size: 14px; color: var(--muted); }
            a { color: var(--green); }
          </style>
        </head>
        <body>
          <main>
            <h1>Sightline</h1>
            <p class="lede">
              A wayfinding sign family where one directory of destinations renders at 3 m, 12 m and 30 m
              — and the distance changes the copy, not just the type size.
            </p>
            <p class="lede">
              When the copy cannot fit at a distance, the template refuses with <code>image/fit</code>
              instead of silently shrinking or truncating it.
            </p>

            <h2>The contract an agent fills</h2>
            <figure>
              <img src="images/contract.png" alt="The describe() output for sightline.SignFamily: three formats, six fields, four measured rules" />
              <figcaption>
                Drawn from <a href="contract.json">contract.json</a> — the output of
                <code>npx hyper-elements describe templates/sign-family.tsx --json</code>.
              </figcaption>
            </figure>

            <h2>One destination, three distances</h2>
            <figure>
              <img src="images/strip.png" alt="The same destination at 3 m, 12 m and 30 m, at one scale" />
              <figcaption>The long form at 3 m, the medium form at 12 m, the short form at 30 m — one directory, one value set.</figcaption>
            </figure>

            <h2>The refusal that demands content</h2>
            <p class="lede">
              This is a 30 m sign with no short form. The template refuses, names the field and says
              roughly how much to cut. Nothing is drawn truncated.
            </p>
            <pre>$ npx hyper-elements check designs/_refusal/car-park.values.json
      error image/fit ... it takes 4 lines at 280px, its smallest size, and fits 1:
        cut about 63 characters (required by sightline.SignFamily)
      rule image/fit (far): failed
      fit short: no size fits
      # exit 1</pre>
            <p class="lede">
              Write the four-word short form and the same destination renders: <code>fit short: 400px
              (fits at 400, 340, 280)</code>, exit 0.
            </p>

            <h2>Two buildings from one template</h2>
            <div class="grid two">
              <figure>
                <img src="images/signs/halden-house/car-park.far.png" alt="Halden House: ivory ground, IBM Plex Sans, deep green circled arrow" />
                <figcaption>Halden House — editorial: ivory, IBM Plex Sans, circled arrow.</figcaption>
              </figure>
              <figure>
                <img src="images/signs/foundry-nine/car-park.far.png" alt="Foundry Nine: near-black ground, white Barlow Condensed, yellow chevron" />
                <figcaption>Foundry Nine — industrial: near-black, Barlow Condensed, yellow chevron.</figcaption>
              </figure>
            </div>

            <h2>The rules that run</h2>
            <p>
              <span class="pill">canvas/overflow</span>
              <span class="pill">image/overflow</span>
              <span class="pill">image/glyph</span>
              <span class="pill">image/fit</span>
            </p>
            <p class="lede">
              All four are required on every design, and each reports passed, failed or not-run. A rule
              that did not run never counts as passed.
            </p>

            <footer>
              These are design proofs, not print files. The legibility ratio in <code>brand.ts</code> is a
              declared assumption, and six words is a house limit, not a legal one.
              Source: <a href="https://github.com/orjinameh/sightline">github.com/orjinameh/sightline</a>.
            </footer>
          </main>
        </body>
      </html>
      ```

- [ ] **Step 4: Write `vercel.json`**

      One config so the same folder deploys to Vercel as a static site, with no build step:

      ```json
      {
        "$schema": "https://openapi.vercel.sh/vercel.json",
        "outputDirectory": "docs",
        "cleanUrls": true
      }
      ```

- [ ] **Step 5: Run the gate**

      Run: `npx vitest run tests/pages.test.ts && echo GATE-PASS`
      Expected: `GATE-PASS`

      If it reports the first image, `docs/index.html` must open with `images/contract.png` (relative to
      `docs/`, because that folder is the site root). If it reports a forbidden string, the page copied
      wording from a draft instead of the README's approved sentence.

- [ ] **Step 6: Commit (kernel-performed — no agent runs this)**
      Message: `feat: a static preview page that deploys to Pages or Vercel`
