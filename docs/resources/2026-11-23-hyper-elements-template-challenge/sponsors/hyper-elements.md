# Sponsor — Hyper Elements (by Unlayer)

Fetched 2026-11-23. This is the **only** sponsor: the event's subject, its prize-giver, and its judging body.

- Repo: https://github.com/hyper-elements/hyper-elements — MIT, **501 stars**, default branch `main`, last push
  **2026-11-22T23:29Z**, created 2025-08-25. Topics include `react-email`, `email-templates`, `nextjs`, `typescript`.
- Site: https://www.hyperelements.dev · Docs: https://www.hyperelements.dev/docs · Guide (in-package):
  `packages/react/GUIDE.md` · Full-text corpus: https://www.hyperelements.dev/llms-full.txt (vendored at
  `raw/llms-full.txt`, 543 KB, every docs page with its source URL).
- Latest release tag: **v0.5.2** (`v0.5.2, v0.5.1, v0.5.0, v0.4.8 …`).
- Self-description, verbatim: *"React components for emails, web pages, PDFs and images, plus a local JavaScript library
  and CLI to check existing HTML emails and preview Outlook, Gmail and Apple Mail. No React required for HTML email testing."*

## What the sponsor actually rewards

Read from the criteria + the FAQ, not from marketing copy:

1. A **template** (not an app, not a demo) that a developer could take and use — FAQ #5/#7 make "template" the unit and
   "meaningfully used" the bar.
2. **Breadth of the library used correctly**, especially the parts the gallery itself is built on (see below).
3. **Design quality** judged visually against their own 30-template gallery — the bar is that gallery, not "a nice email".
4. Something they can **place in the gallery and post about** — i.e. on-brand, screenshot-ready, with a live/reproducible
   artifact.

## The SDK, in the shape the architect needs

### Packages and pinned versions (npm, fetched 2026-11-23)

| Package | Latest | What it is |
|---|---|---|
| `@hyper-elements/react` | **0.5.2** | Elements, `render()`, `validate()`, `outline()`, `formatDiagnostics()`, `defineElement()`, `prop`, `ElementsError` |
| `@hyper-elements/react/template` | (same package, subpath) | `template()`, `field`, `fitInside`, `captureFragment` — the template system |
| `@hyper-elements/react/pdf` | (subpath) | `renderPdf()` — Document → PDF via react-pdf, no browser |
| `@hyper-elements/react/image` | (subpath) | `renderImage()` — Canvas → PNG/SVG via Satori + resvg |
| `@hyper-elements/react/builder` | (subpath) | `toDesign()` / `fromDesign()` — Unlayer builder design JSON |
| `@hyper-elements/react/inspect` | (subpath) | element inspection |
| `@hyper-elements/cli` | **0.3.3** | `npx hyper-elements` — `check`, `render`, `preview`, `dev`, `describe`, `design`, `template extract` |
| `@hyper-elements/email-clients` | **0.5.3** | `emailClients()` validate plugin + `renderInEmailClients()` emulator (19 client variants) |
| `@hyper-elements/lint` | **0.1.11** | `lint()` validate plugin + `lintHtml()` for any HTML email |
| `@hyper-elements/migrate` | **0.4.3** | React Email → Hyper Elements codemod |

`@hyper-elements/react` peer deps (exact): `react: ">=18"`, `react-dom: ">=18"`, `satori: "^0.33.5"`,
`@resvg/resvg-js: "^2.6.2"`, `@react-pdf/renderer: "^4.9.0"`. No runtime `dependencies` — everything is peer/optional,
so **install only the engines the chosen roots need** (`satori` + `@resvg/resvg-js` for Canvas, `@react-pdf/renderer`
for Document).

### Entry-point signatures (verbatim from docs)

```tsx
// core
const { html, text, diagnostics } = await render(element, options?);   // Email → html+text; Page → html; throws ElementsError
validate(element, { plugins: [lint(), await emailClients()] });        // no render; returns diagnostics
outline(element);                                                     // laid-out design as text: block, width, text
formatDiagnostics(diagnostics);                                       // human-readable, each with what to change
defineElement({ ... })  // custom element; props declared with prop.text/number/boolean/color/choice/...

// subpaths
const { image, width, height, diagnostics } = await renderImage(canvas, { fonts, images, format, scale });
const pdf = await renderPdf(document, { fonts, images });             // Node only (refuses on Bun)

// template
template({ id, version, label, guidance, root, formats, fields, rules, example, render(values, { format }), migrate })
```

`render()` returns `{ html, text }` for Email and `{ html }` for Page; a Document's print HTML comes from `render()`
and its PDF from `renderPdf()`; a Canvas is only ever written by `renderImage()`.

### The four roots — what each can check (verbatim table from /docs/templates)

| Part | Email | Page | Document | Canvas |
|---|---|---|---|---|
| Field | Yes | Yes | Yes | Yes |
| Image field | Yes. Its shape, size and type are checked. Its file is read only where it sits beside the design, not at a URL | Yes, as in an Email | Yes. The command line reads its file | Yes, and measured where it's drawn: an image that would be upscaled is refused |
| Format | Not needed: one width, which phone styles adapt | Not needed: it fits the window | Page sizes: A4, Letter | Image sizes: square, landscape |
| Slot, blocks | Yes | Yes | Yes | Yes |
| Rules | Links, layout overflow, and lint's rules for an email: an unsubscribe link, preview text, contrast, alternate text | Links, layout overflow, and lint's rules for a page: a title, headings in order, contrast, alternate text | Links, layout and page overflow | Links, and what measuring decides: fitted text, overflow, a font for every character |

### Element inventory (from `packages/react/GUIDE.md`, regenerated from the element definitions)

Roots `Email · Page · Document · Canvas`. Layout `Section · Row · Column · Grid · Layer`. Blocks
`Text · Heading · Button · Image · Divider · List · Table · Video · Social · Menu · Html · Svg`. Inline
`Span · Link · LineBreak · MergeTag · PageNumber`. Parts `Document.Page · PageBreak · PageHeader · PageFooter ·
ListItem · TableRow · TableCell`. Shapes `Rect · Circle · Ellipse · Line · Polygon · Path`.
`Svg` is **not** allowed in an Email (shape-safe: use `Html` or an image); `Svg`/shapes are what a Canvas or Page gets.

### Integration model — three branches (choose one, the architect must name it)

| Branch | Codegen / shape | When it's right |
|---|---|---|
| **A. Template-first (recommended)** | `template()` module(s) in `templates/`, designs as `.values.json` or TSX with the template as root, driven by `npx hyper-elements design new / check / render` | Matches the gallery's own architecture; maximizes `Use of Hyper Elements` + `Practical value`; gives a CI story (`--require-template`) |
| B. Design-first | plain React components, `render()` per root, no `template()` | Fastest; what ~85 of 89 submissions do; leaves the template surface unused |
| C. App-first | Next.js app whose server routes call `render()`/`renderImage()` | Needed only if the concept is interactive; still embed a `template()` inside so the artifact is reusable |

**Next.js specifics (verbatim, /docs/guides/nextjs):**
- Runs on the server; *"No client bundle, no extra build step, and for emails, pages and PDFs no entry in
  `next.config.ts`"*. Images need `serverExternalPackages: ["@resvg/resvg-js", "satori"]`.
- Route handler: `export async function GET() { const { html } = await render(React.createElement(X, props)); return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }); }`
- Server Component: await `render()`, pass **strings** to a client component.
- **Edge runtime does not work**: *"Next.js 14 can't bundle Elements for the edge runtime. For emails, the Node.js runtime is the safe default on every version."*
- Prerendering is safe: *"Hyper Elements reads neither [random numbers nor the current date]. A render never leaks into the next one, and the same input always gives the same output."* — so `opengraph-image.tsx` + `generateStaticParams` prerenders at build.
- Tested: Next 14/React 18, Next 15 (Turbopack)/React 19, Next 16 + Cache Components.

### Gotchas (each one is a real failure mode — from GUIDE.md "Common mistakes" + docs)

1. **Styles are never props.** `<Email backgroundColor="#fff">` ✗ → `<Email style={{ backgroundColor: "#fff" }}>` ✓.
2. **A root's width is a prop, and a root has no padding.** `<Email width={600}>` ✓; padding goes on a `Column`/`Section` inside.
3. **There are no margins.** `marginBottom` is a diagnostic; space between blocks is the parent's `gap`.
4. **`Image src` needs `{ src, width, height }`** — the *file's* pixel size. Without it Outlook draws the file at its own size.
5. **Images must be public `https` URLs** (or `data:` — but **Gmail drops `data:` in an Email**). `example.com`/guessed paths = broken image. Use `https://placehold.co/1200x600/png?text=…` as a loading placeholder.
6. **No raw HTML.** Text is elements (`Heading`, `Text`, `Span`, `Link`, `LineBreak`, `MergeTag`); no `<b>`, `<br>`, `html` prop. Escape hatch is the `Html` element (unchecked, unescaped — and a Canvas/PDF draws only its plain text).
7. **One breakpoint only: phones.** `style={{ mobile: {…}, hover: {…} }}` — not `md:`, not `_hover`.
8. **`Menu` items are `{ text, href }`**, `Social` icons `{ name, href }` — not `link`.
9. **No text measurement.** *"The layout gives every box a width without measuring its words, so a box can get less room than its content needs"* → use `fit={{ maxLines, sizes }}` in a Canvas, and verify with `outline`/`check`.
10. **Fonts for PDF/Image must be TTF, OTF or WOFF — not WOFF2** (Google Fonts' default). Nothing is fetched by `renderPdf`/`renderImage`: pass `fonts` and `images` as bytes.
11. **A Document's PDF is Node-only** (`cli/bun` on Bun).
12. **Email size vs Gmail's limit** is only checked with `check --rendered`.
13. **`validate()` doesn't fail a build** — lint and email-client findings are warnings/notes; exit codes move only with `--max-warnings`.
14. **Theme body text belongs in the theme**, not on `Text` — *"a style on `Text` misses table cells"*. Use `colors.foreground`, `fonts.body`, `fontSizes.body`, `lineHeights.body`.
15. **`token()` in a design, `"{colors.x}"` only inside a theme.**

### CLI surface (verbatim command table, /docs/cli/reference)

`render <files|folders…>` · `check <files|folders…>` · `outline <file>` · `preview <files…>` · `dev <files…>` ·
`inspect <files…>` · `describe [Element | template.tsx]` · `design new <template> -o <name.values.json>` ·
`design set <name.values.json> <field=value>…` · `template extract <design> --id … --field … -o <file>` · `migrate …`

Options that matter for this build: `--json` (one JSON line per design + a summary line) · `--out` · `--base` ·
`--format png|svg` · `--scale n` · `--stdout` · `--pretty` · `--html` · `--clients a,b` · `--no-lint` ·
`--max-warnings n` · `--rendered` · `--public <dir>` · `--refresh/--offline` · `--template-format <name>` ·
`--require-template [id]` · `--props file.json`.

Exit codes: `0` clean · `1` a design has errors / values refused / engine missing / `--max-warnings` passed ·
`2` couldn't run (usage, templates from Elements < 0.5, no designs found, Elements missing, PDF on Bun).

### The email-client emulator (19 variants, 97–99% modelled accuracy)

IDs: `outlook` (97%), `outlook-com`, `outlook-com.mac`, `outlook-mac`, `outlook-mac.dark`, `gmail`, `gmail.mac`,
`gmail-app`, `gmail-app-other`, `gmail-app.iphone`, `apple-mail`, `apple-mail.dark`, `apple-mail.iphone`,
`apple-mail.iphone.dark`, `yahoo`, `yahoo.mac`, `yahoo.dark`, `yahoo.mac.dark`, `aol`, `aol.mac`.
Classic Outlook is drawn with **Word's** rules. Runs anywhere (no Windows/Office), in milliseconds, deterministic —
`npx hyper-elements preview emails/ --findings --screenshots` produces per-client findings + PNGs. It is a
ready-made, credible artifact for the README and the demo video ("the same email, as 19 clients draw it") — but note
**36 of the 89 live submissions already cite this package**, so it is proof, not differentiation (`prior-art.md` §3).

### Feasibility notes for the architect (hard facts that constrain the plan)

- **Stack:** Node ≥ 18 (React ≥ 18 peer); the event's own CI-tested Next versions are 14/15/16. The user's stack
  (TS/React/Next.js) is a first-class supported path — use App Router + `serverExternalPackages` for the image engines.
- **No network at render time.** Every asset (fonts, images for PDF/Canvas) is bytes-in. Plan an `assets/` folder and a
  script that downloads + caches them; `--offline` then makes the build hermetic and reproducible for the judges.
- **Determinism is guaranteed** by the library (no clock, no RNG in render) — so `check`/`render` output is
  byte-stable, which makes the README's screenshots reproducible and the demo video recordable.
- **CLI is the verification harness.** `npx hyper-elements check <templates|designs> --max-warnings 0` is a real gate;
  wire it as the repo's `npm test`. `--require-template` proves the artifact is template-driven.
- **The gallery is the acceptance test.** If the deliverable's file layout mirrors
  `templates/<kind>/<slug>/template.tsx` + `designs/*.tsx` + a `brand.ts`, the maintainer can merge it; that is a
  structural advantage no scoring argument can substitute for.
- **Risk:** v0.5.x is young (0.x semver). Pin exact versions in `package.json` (`0.5.2`, `0.3.3`, …) — the docs say a
  values file records the template version, and `template/changed` fires if a template is edited under its version.

## Doc links (canonical, all fetched 2026-11-23)

- Introduction · Quickstart · Designs · Layout · Styles · Rendering · Themes · Custom elements · Command line
- Outputs: Email · Page · PDF · Image
- Templates: overview · examples · **values/fields/images/formats** · **slots/blocks** · **rules/checks/diagnostics** · CLI
- Diagnostics · Email client emulator · Lint · Theme reference · CLI reference
- Guides: Sending email · **Next.js** · AI agents · Agent benchmark · Visual editing
- Migrate: from React Email · from Unlayer Elements
- Blog walkthroughs: OG images for every page in Next.js · check HTML emails in GitHub Actions · OG images in Node.js
  with local fonts · PDF invoices in Node.js without headless Chrome · build & validate React emails with Claude Code

Deep template surface → `sponsors/hyper-elements/template-api.md`. Full corpus → `raw/llms-full.txt`.
