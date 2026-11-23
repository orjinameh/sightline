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

      A building's signs are designed one at a time. A sign that reads well in a 3 m lobby is copied to the end of a 30 m corridor and becomes unreadable, or someone shortens the copy by hand and the family stops agreeing with itself. Sightline makes the family one artifact: a single directory of destinations is the only input, and one Hyper Elements template renders each destination at three viewing distances, choosing **which copy the sign carries** from the distance. When the copy cannot fit, the template refuses with `image/fit`, names the field and says roughly how much to cut — nothing renders, so nothing is silently deleted. Add the short form and the family re-renders, with the 3 m and 12 m signs untouched.

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
      #   error image/fit ... it takes 2 lines at 120px, its smallest size, and fits 1:
      #     cut about 42 characters (required by sightline.SignFamily)
      #   rule image/fit (far): failed
      #   fit short: no size fits

      npx hyper-elements render designs/_refusal/car-park.values.json
      # exit 1 — nothing is written

      npx hyper-elements check designs/_refusal/car-park-short.values.json
      # exit 0
      #   fit short: 160px (fits at 160, 140, 120)
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

      The copy sits in a bounded column, and that column is the copy budget. A 3:1 sign is wide: at its full width an 82-character long form fits on one line at 120 px and nothing refuses. Bound the column to 3200 px and the same copy needs two lines, which is what `image/fit` measures and reports.

      `image/fit` is the library's measured refusal. It is decided when the image is measured with its fonts, so `check` and `render` decide it — an in-memory `check()` leaves it `not-run`, and a rule that did not run never counts as passed. `render` writes nothing for a design that fails, which is what makes "refuse, never delete" true rather than a slogan.

      Two buildings come from one factory: `signFamily(brand, id)` is called twice, and each brand is an `extendTheme` of a shared base — Halden House in IBM Plex Sans on ivory and deep green with a circled arrow; Foundry Nine in Barlow Condensed on near-black and signal yellow with a chevron. Different ground, type family, type width, grid and arrow — not a recolour.

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
