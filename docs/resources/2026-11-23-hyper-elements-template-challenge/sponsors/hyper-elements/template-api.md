# Hyper Elements — the `template()` surface (the under-used half of the library)

Fetched 2026-11-23. Sources: `/docs/templates`, `/docs/templates/fields`, `/docs/templates/slots`,
`/docs/templates/rules`, `/docs/templates/cli`, plus the repo's `skills/brand-templates/SKILL.md` and
`skills/brand-templates/example.tsx` (both vendored under `raw/`).

**Why this file exists:** the event asks for a *template*, and 87 of 89 live submissions never touch this API
(measured — see `prior-art.md` §White space). This is where `Use of Hyper Elements` is won or lost.

## What a template is (verbatim)

> A template is written once, by your team: the brand's parts are locked, and a few parts are left open. People and
> agents make designs from it by filling the open parts, and the template checks each one before anything is drawn.

- **Locked parts** — the template's: logo, layout per format, colors, fonts. *"No value can change them."*
- **Open parts** — what a design gives: **fields** (typed values), **image fields**, **formats** (named sizes),
  **blocks** (approved section types as data), **slots** (JSX within limits).
- **Rules over the result** — checked on the finished design.
- A **design** is one finished piece: *"Any Email, Page, Document or Canvas is a design. One made from a template is checked by it."*

## `template()` — every key (verbatim table)

| Key | What it is |
|-----|------------|
| `id` | A namespace, a dot and a capitalized name: `acme.LaunchGraphic` |
| `version` | Semver. A values file records the version it was made with. Raise it when the template changes: an older file is read again, and migrated across a major version |
| `label`, `guidance` | Its name for people, and advice in plain English for whoever fills it. Guidance is never enforced: it's listed for a person to judge |
| `root` | What it makes: `"Email"`, `"Page"`, `"Document"` or `"Canvas"` |
| `formats` | Its named sizes, for a Canvas or a Document |
| `fields` | What's open: values and images, blocks and slots |
| `rules` | What must hold on the finished design |
| `example` | A full set of values. **Required**: it's checked with the template, and it's what whoever fills the template is shown |
| `render(values, { format })` | Builds the design from the values. Whatever it writes that isn't a field is locked |
| `migrate` | For each major version, how an older values file's values become this one's |

`formats` are a Canvas's `{ width, height, scale }` or a Document's `{ size, orientation }`. **`render` builds each
one** and gets the format's name — the size is declared *and* written in `render` on purpose, so the template checks
that what `render` built matches its declared format (`template/format`).

## Fields — the full helper set (verbatim table)

```tsx
import { prop } from "@hyper-elements/react";
import { field, template } from "@hyper-elements/react/template";
```

| Field | Its value | Its own options |
|-------|-----------|-----------------|
| `prop.text()` | Text | `maxLength`; `pattern`, a regular expression's source, matched with the `u` flag |
| `prop.date()` | A date, `YYYY-MM-DD` | |
| `prop.number()` | A number | `min`, `max` |
| `prop.choice(options)` | One of the options | |
| `prop.link()` | A URL | |
| `prop.list(item, { min, max })` | A list of one kind of item | Not given, it's `[]`, and its `min` applies to that too |
| `prop.object(fields)` | An object of named fields | Optional and not given, it's `undefined` |
| `prop.blocks(types, { min, max })` | A list of blocks, each one of the types | see blocks |
| `field.image(limits)` | An image, `{ src, width, height }` | see image limits |
| `field.slot(options)` | JSX someone writes | see slots |

Every field also takes `label`, `required` (*"required only with `required: true`"*), `default`, `guidance`.
A field **cannot** be named `format`, `key`, `ref` or `children` (`template/field-name`).
Lists and objects compose; an image inside a list keeps its limits at `stories[1].image`.

### Image limits (verbatim table — the anti-broken-image machinery)

| Limit | It asks | Checked against | Where it fails |
|-------|---------|-----------------|----------------|
| `aspect: { min, max }` | Its width over its height | The size given | `template/asset-aspect` |
| `minWidth`, `minHeight` | Its smallest size in px | The size given | `template/asset-pixels` |
| `accepts` | Its type: `png`, `jpeg`, `gif`, `svg`, `webp` | Its name's extension, then its file | `template/asset-type` |
| `transparent` | `"required"` or `"forbidden"` | Its file | `template/asset-alpha` |
| `fit: "contain"` | Shown whole, at its own aspect | Where it's drawn | `template/asset-distorted`, `template/asset-cropped` |
| `fit: "cover"` | Cropped from the center to fill its region | Where it's drawn | |
| `maxCrop` | The most a `cover` image loses from either side, as a share (`0.6` is 60%) | Where it's drawn | `template/asset-cropped` |

`fit` draws nothing — *"It says how the template must show the picture, and the check holds the template to it."*
`contain` pairs with `fitInside(img, { width, height })`; `cover` pairs with a `Layer` whose first child is the `Image`.

### Bindings — `field="…"`

`<Heading field="headline">`, `<ListItem field={`features[${i}]`}>`, `<Image field="stories[1].image" …>`.
Optional for text (it makes diagnostics name the *field* rather than a node path); **required for an image with
limits** and **required on the one element hosting a slot** (`template/slot-host`).
Failure codes: `template/unknown-binding`, `template/unbound` (warning), `field/dropped`.

## Slots — JSX inside limits

```tsx
body: field.slot({
  label: "Body",
  required: true,
  allow: [Column, Heading, Text, Button, Link],
  styles: "none",                                  // "none" | "theme" (default) | "free"
  count: { Button: { min: 1, max: 2 } },
  guidance: "One to three short sections, each a Heading and a Text.",
}),
```

| Option | It sets | Refused as |
|---|---|---|
| `allow: [Column, Heading, …]` | The elements the content may use, given as the elements themselves | `template/slot-element` |
| `allow: "all"` | Every built-in the root may hold, but roots and `Html`; `deny: [Table, Video]` removes; `["all", ProductCard]` adds a custom element | `template/slot-element` |
| `count: { Button: { min: 1, max: 2 } }` | How many of a type | `template/slot-count` |
| `styles: "none"` | No style of its own; the theme's look only | `template/slot-style` |
| `styles: "theme"` (default) | Styles freely, but every brand value is a `token()` | `template/slot-style` |
| `styles: "free"` | Any style | — |

Other slot rules, verbatim highlights:
- *"Content never sets `attrs` (`template/slot-attrs`), or, under `"none"` and `"theme"`, `tokens` or `theme` (`template/slot-tokens`). A `field` inside it is its own (`template/slot-field`)."*
- *"A built-in is allowed by its type, a custom element by its definition. Content that defines its own `acme.ProductCard` is refused ("not the template's"), and its render never runs."*
- *"The template never sees the content"* — the render runs with a mark in the slot's place, so locked parts can't depend on it. Exactly one element hosts it (`template/slot-host`).
- Content must be legal children of the host: a `Section` can't hold a `Section`; several elements go in a `Column` or a fragment, not an array.

## Blocks — approved sections as data

`prop.blocks(types, { min, max })` — each item names its type and fills that type's values; **the look is the
template's**. This is the strongest "practical value" primitive: a newsletter/digest whose section mix varies but whose
design can't drift. Zero of 89 submissions use it.

## Rules — what must hold on the finished design

```tsx
rules: {
  plugins: { lint: lint({ kind: "marketing" }) },
  require: {
    lint: ["unsubscribe", "preview-text", "contrast", "link-text", "lang"],
    core: ["layout/overflow"],
  },
  links: { domains: ["acme.com", "*.acme.com"], params: { utm_source: "newsletter" }, schemes: ["mailto"] },
  images: { domains: ["cdn.acme.com"] },
  root: { lang: true },
},
```

| Rule | It requires | Where it fails |
|------|-------------|----------------|
| `require.lint` | Lint's rules, by id — a finding becomes an **error**, marked "(required by …)" | the lint rule's own code |
| `require.core` | Elements' own checks, by code | that code |
| `links.domains` | Every http(s) link's host (`acme.com`, `*.acme.com`) | `template/link-domain` |
| `links.params` | A query parameter on every link | `template/link-param` |
| `links.schemes` | Other schemes allowed (`mailto`); a relative link is refused | `template/link-scheme`, `template/link-relative` |
| `images.domains` | Every image's host; with it, any other host / `data:` / relative is refused | `template/image-domain` |
| `root` | Root props that must be set (`lang`, `previewText`) | `template/root-prop` |

Each required rule ends `passed`, `failed` or `not-run` — **"One that didn't run never counts as passed."**

`require.core` accepts: `layout/overflow`, `layout/shrunk`, `document/overflow`, `canvas/overflow`, `image/overflow`,
`image/glyph`, `image/fit`. The Canvas ones are decided **when the image is measured** — `check()` leaves them
`not-run` and `renderImage()` decides them as it draws. That is what stops a Canvas passing on values alone.

`lint()` is from `@hyper-elements/lint`; `kind: "marketing"` is required for the `unsubscribe` rule to exist.
A required rule lint doesn't have, or that's off, or that doesn't run on the root → `template/rule-unavailable`
(at template definition, before any design). Lint itself throwing → `template/rule-not-run` (an error).

## `check()` — the template's own method

```ts
const checked = launch.check(values, { format: "square" });  // never throws
// → { valid, values, diagnostics, review, rules, snapshots, template }
```

| Returns | What it is |
|---|---|
| `valid` | Whether nothing is an error |
| `values` | The values as read: defaults filled in |
| `diagnostics` | Each with `code`, `path`, `message` |
| `review` | Each field's `guidance` + the template's own — for a person to judge. **Never an error** |
| `rules` | Each required rule: `passed` / `failed` / `not-run` |
| `snapshots` | The checked design by format name (`default` for one size), where valid |
| `template` | Its `id` and `version` |

It checks in two steps: **(1) the values** by their fields (unknown fields, missing required, refused values, list
counts, image size/name); **(2) the design it builds in each format** — `validate()`'s checks plus what only the
template knows: root and format size, bindings, how each bound image is shown, slot content against its limits, and the
rules. *"The second step catches the template's own mistakes, not only bad values."*

## Values files — the artifact that proves it's a template

```bash
npx hyper-elements design new templates/launch.tsx -o designs/orbit.values.json \
  --values brief.json --set artwork=@art/waves.png --source artwork=source.json
npx hyper-elements design set designs/orbit.values.json launchDate=2026-12-10
npx hyper-elements check  designs/orbit.values.json
npx hyper-elements render designs/orbit.values.json
```

| You give | It's read as |
|---|---|
| `--values brief.json` | The values to start from |
| `--set field=value` | JSON where it parses, else text; nested by path: `customer.name=…`, `lines[2].price=30`, `features[0]=…` |
| `field=@path/to/image.png` | An image file: size read from it, hash recorded in `assets` |
| `field=@path/to/body.tsx` | A slot's content, stored as its module |
| `--source field=source.json` | Provenance for an image: `{ kind: "supplied" | "generated" | "stock" }` + provider/model/prompt/license |
| `--draft` | Writes even with values missing (`"draft": true`, plus `missing`) — a draft is never rendered (`cli/draft`) |

- A value the template refuses **exits 1 and leaves the file untouched**.
- `design new` lists every format; remove one from the file's `formats` to render fewer.
- `design set` first migrates the file to the template's current version — *"So a set can repair a file whose values the template refuses."*
- A slot in JSON is `{ "module": "./_slots/june.body.tsx" }` or `{ "fragment": … }` (from `captureFragment()`).
  `toValuesFile()` stores a slot's JSX as its fragment. Unloaded module → `template/slot-unloaded`.

## CLI loop for templates

| Command | What it does |
|---|---|
| `describe templates/x.tsx` | Formats, every field (kind, required, guidance), slot `allow` lists, image regions + required pixels, rules. `--json` for all of it |
| `design new` / `design set` | Make / mutate a values file |
| `check <design>` | Values → images vs files → fitted text → each format |
| `render <design>` | Same checks, then one file per format (`<name>.<format>.<ext>`) |
| `check <template>` | Checks the template module with its `example` in every format — *"a template's CI"* |
| `template extract <design> --id … --field … -o <template>` | Writes a template from an approved design (a computed value is reported and nothing is written) |

Flags: `--template-format <name>`, `--require-template [id]` (*"Fails every input that isn't a design a template
checked, or is one of another template"*), `--scale`, `--format svg|png`, `--props`, `--json`.
`check --json` adds `fits`, `regions` (each image's box and the pixels it needs), `rules`, `review`.
Trusted templates are listed in `package.json`: `"hyperElements": { "templates": ["templates/**"] }`.

## How the official gallery is built (copy this shape)

From the repo's `templates/README.md` (verbatim):

> Each is a template (`template()` from `@hyper-elements/react/template`): what stays the same is locked, and what
> changes is a field, with the limits and rules every design made from it is checked against. **None of them carries a
> brand: each is made from one (`newsletter(brand)`), which gives it its colors, fonts, logo, company details and the
> domains its links may go to.**

```
emails/newsletter/
  template.tsx          newsletter(brand) makes the template; its default export is made from a sample brand
  designs/*.tsx         designs made from it: <Newsletter subject="…" body={…} />
```

- **30 templates**: 17 emails, 1 page, 7 PDFs, 5 images — across **15 sample brands** (Casa Albero, Ember, Keel,
  Orbit, Oyen, Pell & Ashby, Pith, Quarry, Slow Signals, + real-brand recreations: Airbnb, Apple, Nike, Spotify,
  Stack Overflow, Stripe).
- Each template ships **2 designs** made from it. `pnpm --filter ./templates readme` regenerates the index.
- A brand supplies `colors, fonts, logo, company details, links.domains` — the template reads them through
  `token(...)` and `brand.links.domains` (see `raw/example-announcement-template.tsx` for a real one: two formats'
  worth of `Canvas`, `fitInside`, `Svg` shapes, `field.image` with `aspect`/`maxCrop`/`minWidth`, and
  `rules.require.core: ["canvas/overflow","image/overflow","image/glyph","image/fit"]`).
- **The gallery's own multi-brand mechanic is `extendTheme(base, overrides)`** — one template, N brands, N× the
  screenshots for one build.

**Implication for this campaign (inference, labelled):** the highest-value artifact is a *brand-parameterized
template + designs + a brand*, in the gallery's folder shape, with rules that actually run and a values file that
proves the fields. That is simultaneously the `Use of Hyper Elements` answer, the `Practical value` answer
("developers can reuse or build upon it"), and the "add it to the gallery" answer.
