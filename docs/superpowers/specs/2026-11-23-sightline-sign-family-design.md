# Sightline — a wayfinding sign family where distance chooses the copy

**Status:** approved by the user, 2026-11-23 · **Architect seat:** top / xhigh (ran below binding — logged)
**Event:** Hyper Elements Template Challenge (Unlayer) · **Deadline:** 2026-11-29 23:59 UTC
**Track:** the single pool (no categories; five winners × $100)
**Repo:** `orjinameh/sightline` (public at submission) · canonical checkout until then:
`/workspaces/build-systems/hyper-elements-template-challenge-2026`
**Stack:** TypeScript · React 19 · Node 24 · `@hyper-elements/react` 0.5.2 · `@hyper-elements/cli` 0.3.3
**Source brief:** `docs/idea-forge/2026-11-23-sightline-brief.md`

---

## 1. Problem

A building's signs are designed one at a time. A sign that reads well in a 3 m lobby is copied to the
end of a 30 m corridor and becomes unreadable; or someone shortens the copy by hand and the family
stops agreeing with itself. The failure is not a bad sign — it is a **family that disagrees with
itself**, because every distance was solved separately.

## 2. Solution

One Hyper Elements `Canvas` template renders a sign at three viewing distances. A **directory** of
destinations is the only input. The distance chooses **which copy the sign carries** — not just the
type size. The text is fitted to a bounded copy box, and when copy cannot fit at the distance the
template **refuses** with `image/fit`, naming the field and roughly how much to cut; nothing renders,
so nothing is silently deleted.

The refusal is not a metaphor. It is the library's measured diagnostic, and this build proves it
end-to-end before writing a line of product code (§7).

## 3. Scope

### In scope

- `templates/sign-family.tsx` — a brand-parameterized `Canvas` template, id `sightline.SignFamily`,
  three named formats, six fields, four measured rules.
- A second building (`templates/sign-family-foundry.tsx`, id `sightline.SignFamilyFoundry`) made by
  `extendTheme` — visibly different type, palette and grid, proving reuse rather than a one-off.
- `directory/` — the destination data; a script turns it into values files (the agent-fillable form).
- `designs/` — values files per building, plus the two **refusal fixtures** (fails / passes).
- `scripts/` — directory → values, values → PNGs, the 3 m/12 m/30 m strip, the `describe()` contract image.
- `templates/sign-sheet.tsx` — a `Document` A3 **sign schedule** (the fabricator handoff the README
  promises): a table of destinations against their three distances, rendered with `renderPdf()`.
- `README.md` — schema R3, whose **first image is the `describe()` contract view**.
- `docs/gates/submission-draft.md` — the Discussion form, pre-answered.

### Out of scope (explicit, from the brief — do not drift)

- **No ADA compliance claim at 30 m.** Table 703.5.5 is cited only within its scope (characters
  40–120 in above the floor). Beyond that the ratio is a **declared assumption**.
- **No "legal maximum is six words."** The word budget is a labelled house limit.
- **No print-ready claim.** Design proofs, not print files. No bleed, CMYK, substrate or fabrication.
- **No sign-shop calculator.** No distance→point-size computation. `legibility.ratio` is
  documentation; the template never derives a size from it.
- **No silent deletion.** Refuse; never truncate.
- **No live data, deployment, chain or paid asset.** Committed directory, OFL fonts, local pictograms.
- **No `require.lint`** — lint does not run on a Canvas (`template/rule-unavailable`).
- **No four-artifact kit** (email + page + PDF + social card).
- **No README event-overlay headings** — see §6.4.

## 4. Architecture

```
brand.ts                    base theme; haldenHouse / foundryNine via extendTheme; legibility assumption
src/formats.ts              the three formats, in mm and px (one DPI constant)
src/copy.ts                 copy-by-distance: format -> field -> text (pure, no JSX)
src/layout.ts               per-format geometry: copy box, type scale, pictogram box, arrow box
templates/sign-family.tsx   signFamily(brand, id) + default export (Halden House)
templates/sign-family-foundry.tsx  signFamily(foundryNine, ...)
templates/sign-sheet.tsx    Document A3 scale drawing + schedule
directory/*.ts              Destination[] per building
designs/**/*.values.json    generated family + the refusal fixtures
assets/fonts/*.woff         IBM Plex Sans / Barlow Condensed / IBM Plex Mono (OFL, committed)
assets/pictograms/*.png     512x512 RGBA, generated from inline SVG by a script
scripts/*.ts(x)             build-directory, render-all, strip, contract-image
docs/images/*.png           contract.png (README's first image), strip.png, signs/*
```

**The copy-by-distance mechanism.** `copy.ts` maps format → field, with one deliberate fallback:

| format | distance | field | fallback |
|---|---|---|---|
| `near` | 3 m | `long` | — |
| `mid` | 12 m | `medium` | — |
| `far` | 30 m | `short` | `long` when `short` is empty → **this is the refusal** |

`short` is optional. An author who omits it gets a `far` sign carrying the long form, which cannot
fit one line in the far copy box at its smallest size — so the template refuses and demands the
short form. The author supplies it; the family re-renders; `near` and `mid` are untouched.

**The copy box is the copy budget.** This is the load-bearing design fact (§7.3): a 3:1 sign 5315 px
wide fits 82 characters on one line at 120 px, so `maxLines: 1` alone refuses nothing. The copy
therefore sits in a declared column — 3200 px at `far` — and *that* width, not the canvas, is what
"cannot fit" means. The word budget is a consequence of the box, not a rule bolted on.

**The contract** (verbatim shape; the brief's keys, unchanged):

```tsx
export default template({
  id: "sightline.SignFamily",
  version: "1.0.0",
  label: "Wayfinding sign family",
  root: "Canvas",
  formats: {
    near: { width: 1772, height: 1181, scale: 1 },  // 300x200 mm  @150 DPI, 3 m
    mid:  { width: 3543, height: 1772, scale: 1 },  // 600x300 mm  @150 DPI, 12 m
    far:  { width: 5315, height: 1772, scale: 1 },  // 900x300 mm  @150 DPI, 30 m
  },
  fields: {
    destination: prop.text({ label: "Destination", required: true, maxLength: 60 }),
    long:        prop.text({ label: "Long form (3 m)", required: true, maxLength: 120 }),
    medium:      prop.text({ label: "Medium form (12 m)", required: true, maxLength: 60 }),
    short:       prop.text({ label: "Short form (30 m)", required: false, maxLength: 30 }),
    arrow:       prop.choice(["left", "right", "up", "down", "none"], { label: "Arrow", default: "right" }),
    pictogram:   field.image({
      label: "Pictogram", required: true, fit: "contain",
      aspect: { min: 0.8, max: 1.2 }, minWidth: 512,
      accepts: ["svg", "png"], transparent: "required",
    }),
  },
  rules: { require: { core: ["canvas/overflow", "image/overflow", "image/glyph", "image/fit"] } },
  example: { /* every required field; long/medium/short set; a 512x512 pictogram */ },
  render(v, { format }) { /* layoutFor(format) picks the copy and the type scale */ },
});
```

**Two buildings.** `base` is a shared `defineTheme`; `haldenHouse` and `foundryNine` are
`extendTheme(base, …)`. Halden House is editorial (ivory `#F4F1EA`, ink `#14201C`, deep green
`#1F4D3F`, IBM Plex Sans, arrow in a filled circle). Foundry Nine is industrial (near-black
`#0B0B0C`, signal yellow `#F5D90A`, Barlow Condensed, chevron arrow, full-height left rail). They
differ in ground, type family, type width, grid and arrow treatment — not a recolour.

**The schedule.** `sign-sheet.tsx` is a `Document`, `formats: { a3: { size: "A3", orientation:
"landscape" } }`, whose values are the building and a list of destinations; it renders a table of
destination × distance × copy, under the line *"Design proofs, not print files."* It is a schedule,
not a scale drawing — a 900×300 mm sign cannot be drawn 1:1 on A3 — so it never makes a claim it
cannot keep. Verified: `prop.list(prop.object(…, { label }))` validates and `renderPdf()` returns a
`%PDF-` file.

## 5. The demo (exact commands and expected output)

```bash
# 1. The contract an agent fills (README's first image is drawn from this file)
npx hyper-elements describe templates/sign-family.tsx --json > docs/contract.json

# 2. THE REFUSAL — the 30 m sign has no short form
npx hyper-elements check designs/_refusal/car-park.values.json
#   exit 1
#   error image/fit at root.children[0].children[1]: This Heading doesn't fit: it takes 2 lines
#     at 120px, its smallest size, and fits 1: cut about 42 characters (required by sightline.SignFamily)
#     Fix: Shorten the text, or give the template a smaller size
#   rule image/fit (far): failed
#   fit short: no size fits

npx hyper-elements render designs/_refusal/car-park.values.json
#   exit 1 — nothing is written. No silent deletion.

# 3. The author writes the short form (four words), and the family agrees
npx hyper-elements design set designs/_refusal/car-park.values.json short="Visitor car park"
npx hyper-elements check designs/_refusal/car-park.values.json
#   exit 0 — fit short: 160px (fits at 160, 140, 120)

npx hyper-elements render designs/halden-house/car-park.values.json
#   exit 0
#   out/designs/halden-house/car-park.near.png   1772x1181   (long form)
#   out/designs/halden-house/car-park.mid.png    3543x1772   (medium form)
#   out/designs/halden-house/car-park.far.png    5315x1772   (short form)

# 4. The strip
npm run demo    # directory -> values -> PNGs -> docs/images/strip.png + contract.png
```

The refusal carries `"field": "short"` in `check --json` — machine-readable, so the demo can print
the diagnostic object itself rather than describing it.

## 6. Design decisions

| # | Question | Decision | Source |
|---|---|---|---|
| 6.1 | Which root? | `Canvas` — `fit` and `image/fit` exist only in a Canvas | pack `template-api.md`; verified §7 |
| 6.2 | Fallback if the far format will not render? | **DPI ladder, not a root change** (150→100→72 DPI, same mm). A `Document` cannot carry `image/fit`, so the brief's Document fallback would have destroyed the money shot | derived; §7.1–7.2 |
| 6.3 | Is the A3 sheet the fallback? | **No — a complementary sign schedule.** A 900×300 mm sign cannot be 1:1 on A3 (420×297 mm), and a `Document` cannot carry `image/fit`, so the sheet is a table of destinations × distances, not a scale drawing and not a substitute for the Canvas | derived; verified §7.5 |
| 6.4 | README schema + event overlay? | **R3-cli-tool, no overlay.** The event's three README requirements map onto `## Demo` (preview), `## Quickstart` (setup), and `### Hyper Elements implementation` inside `## How it works` — the event's own label, at a free sub-level. Duplicate `##` headings would hurt Overall execution | `readme-schemas.md`; `event.md` §README |
| 6.5 | Where does the word budget live? | `brand.ts` → `legibility.houseWordLimit`, guidance only. `require.core` is a closed set of seven codes with no custom predicate, so "six words" can never be a rule. The character-count refusal is what actually enforces it | pack `template-api.md`; brief §Out of scope |
| 6.6 | Designs as TSX or values files? | **Values files** — data, nothing runs, agent-fillable, and `design set short=…` is literally the demo's edit | brief §CLI loop; pack `skill-brand-templates.md` |
| 6.7 | Which fonts? | IBM Plex Sans (A) + Barlow Condensed (B) + IBM Plex Mono (contract view), via `@fontsource/*` **`.woff`** (WOFF2 is not drawable) | verified §7.4 |
| 6.8 | Where does the building name live? | In the brand (locked), not a field — the six fields stay exactly the brief's | brief §Template shape |
| 6.9 | One template id or two? | Two modules, two ids, one `signFamily(brand, id)` factory — the factory is the reuse proof | derived from `template/id` semantics |

## 7. Pre-build verification (facts, measured on 2026-11-23)

These were run before planning, in a throwaway directory, against the real packages
(`@hyper-elements/react@0.5.2`, `@hyper-elements/cli@0.3.3`, `satori`, `@resvg/resvg-js`, Node
24.22.2). They retire the project's four biggest risks and are the reason this plan has no spike
tasks: the spikes are already answered.

### 7.1 The far 900×300 mm render works

`renderImage` of a `Canvas` at **5315×1772** (900×300 mm @150 DPI) with fitted text and four WOFF
weights: **429 ms**, 57 KB PNG, exact dimensions. The brief's "verify in the first hour" condition
is **cleared before the build starts**. Guard: the template task's gate checks the far format, and
the render task asserts 5315×1772 on the output.

### 7.2 A `Document` cannot carry the refusal

`fit={{ sizes, maxLines }}` is Canvas-only. `template.check()` reports `image/fit` as `not-run`
(measured stage); the CLI and `renderImage()` decide it. So the brief's Document fallback would have
removed the only mechanism the money shot depends on. Hence §6.2: fall back on DPI, never on root.

### 7.3 The refusal fires on `check`, and the copy box is what makes it reachable

With the copy in a 3200 px column and `short` absent:

```
error image/fit at root.children[0].children[1]: This Heading doesn't fit: it takes 2 lines at
  120px, its smallest size, and fits 1: cut about 42 characters (required by spike.SignCli)
  Fix: Shorten the text, or give the template a smaller size
rule image/fit (far): failed
fit short: no size fits
```

`check --json` adds `"field": "short"`. `render` on the same design **exits 1 and writes nothing**.
With `short: "Visitor car park"`: `check` exits 0 and prints `fit short: 160px (fits at 160, 140,
120)`; `render` writes the 5315×1772 PNG.

At full canvas width the same 82-character long form **fit on one line and nothing refused** — which
is why §4 bounds the copy column.

### 7.4 API facts that would otherwise burn retries (all confirmed by the library itself)

1. A `Canvas`'s `fonts` prop takes **file paths / `data:` / http(s) URLs — never `Buffer`s**. Bytes
   go only to `renderImage`'s `options.fonts`. Passing bytes to the element is `prop/invalid`.
2. `fit` **sets its own font size**: setting `style.fontSize` beside it is `style/fit`.
3. Every weight used must have a file, or `image/font-weight` is an **error**, not a warning.
4. The element's `fontFamily` (or the theme's `fonts.body`) must name a family whose file is given,
   or `image/font` is an error — the default stack is `Arial, Helvetica, sans-serif`.
5. `package.json` → `"hyperElements": { "templates": ["templates/**"] }` removes
   `cli/template-untrusted`.
6. Editing a template under the same version raises `template/changed`; bump `version` on change.
7. `@fontsource/*` ships real **`.woff`** (magic `wOFF`, verified) — drawable. Google's
   `ofl/ibmplexsans/` static TTFs 404; only a variable font exists there, so fontsource is the path.
8. `describe --json` carries `formats`, per-field `schema`, `rules[].stage` (`read`/`measured`),
   per-field `fit`, `valuesSchema` and `fixed` — everything the contract image needs.
9. A `Canvas` has **no `flexDirection`** — children stack; horizontal layout needs a `Row`
   (`style/unknown` otherwise).
10. A `Document` root has **no `padding`** — it takes `margin`, and spacing goes on a `Column` inside.
11. `prop.object(fields, { label })` needs the **second argument**; without it `prop.list` rejects it
    with `template/spec`. With it, a list-of-objects validates.
12. `renderImage(element, { fonts, images })` draws an image whose bytes are in the `images` map,
    keyed by the same `src` string the design uses — so the strip and contract images are built as
    Canvases, with no separate SVG/PNG compositing step.

### 7.5 The schedule and the images

`prop.list(prop.object({…}, { label: "Destination row" }))` validates (`valid: true`), and
`renderPdf` returns a **`%PDF-`** file (8.5 KB for a two-row A3 schedule). `renderImage` with an
`images` map keyed by `src` returns 1200×420 with zero diagnostics. So every artifact in §5 is
produced by the library itself — no external compositing tool, no browser.

## 8. Judging map

| Criterion | What the judge sees |
|---|---|
| **Originality** | 0/89 submissions are a sign family; no product turns a directory into a family where distance changes the copy. A 3:1 refusal that *demands* content is not a calculator |
| **Design quality** | Two gallery-grade systems (editorial ivory/green; industrial black/signal), a common-scale 3 m/12 m/30 m strip as the hero, consistent pictogram grid |
| **Practical value** | `signFamily(brand)` + a typed directory → a coherent family; values files are agent-fillable; `describe` publishes the contract; `--require-template` makes it CI-enforceable |
| **Use of Hyper Elements** | `formats` at three named Canvas sizes, `fit` + measured `image/fit`, `field.image` limits, `require.core`, `extendTheme`, `describe()`, values files, `renderPdf` — the v0.5 template surface, which 86/89 entries do not use |
| **Overall execution** | `npm run demo` reproduces every image; `check` is the gate; the README's first image is the contract, not a pretty sign; honest print/compliance wording, mechanically checked |

## 9. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | Far render memory/time | **Retired** — 5315×1772 in 429 ms (§7.1). DPI ladder kept as the only fallback |
| R2 | Fonts unavailable / WOFF2-only | `@fontsource/*` `.woff`, committed to `assets/fonts/`; asset test asserts `wOFF` magic + every weight used |
| R3 | `transparent: "required"` fails on generated PNGs | Pictograms rendered by resvg with no background; asset test asserts `sniffImage().alpha === true` |
| R4 | Refusal unreachable because the copy fits | Copy column bounded per format; refusal test asserts exit 1 + `image/fit` + `field: "short"` |
| R5 | `describe()` shape differs from docs | Verified (§7.4.8); contract script consumes the real shape and commits `docs/contract.json` |
| R6 | Design quality variance (the highest-variance criterion) | Two specified systems with fixed palettes/type/grid; the strip is the acceptance image |
| R7 | Forbidden print/compliance strings leak into the README | `scripts/check-readme.mjs` fails on `print-ready`, `ADA compliant at 30 m`, `the legal maximum is six words` |
| R8 | Architect ran below the top-tier binding | Plan set written to be explicit rather than implicit: every task pastes its upstream signatures and carries one exact gate. Logged in the tollgate report |

## 10. Acceptance criteria

1. `npx hyper-elements check templates/` exits 0 — the example fits at **all three** formats.
2. The refusal fixture exits 1 with `image/fit` and `"field": "short"`; `render` on it writes nothing.
3. The same destination with a short form exits 0 and renders **1772×1181 / 3543×1772 / 5315×1772**.
4. `describe --json` lists three formats, six fields, the four measured rules, and each image's
   region per format.
5. **The README's first image is `docs/images/contract.png`** — the `describe()` view, not a sign.
   Mechanically checked by `scripts/check-readme.mjs`.
6. The word budget is a **declared assumption in `brand.ts`** (`legibility.houseWordLimit`), never a
   rule; no custom predicate is invented.
7. The README contains none of the three forbidden strings, and cites the standard **within its
   scope** and the assumption **beyond it**.
8. Two buildings render from one factory and are visibly different in type, palette and grid.
9. `npm run demo` reproduces every committed image from a clean checkout.
10. The far format is a Canvas at 150 DPI; the A3 document is a **sign schedule**, labelled "Design
    proofs, not print files." — never a 1:1 claim.
