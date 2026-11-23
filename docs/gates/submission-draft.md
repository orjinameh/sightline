# Submission draft — Hyper Elements Template Challenge

Pre-answered from the brief and the spec, ready to paste into the Discussion form
(`https://github.com/hyper-elements/hyper-elements/discussions/new?category=challenge-submissions`).
Fields that only exist after the build and the closing gates ride as `TBD-post-build:<what>` — one per
line, nothing else deferred.

---

## Challenge

Hyper Elements Template Challenge *(select from the dropdown)*

## Project name

Sightline

## Project description

A wayfinding sign family where one directory of destinations renders at 3 m, 12 m and 30 m — and the
distance changes the copy, not just the type size.

A building's signs are usually designed one at a time, so a sign that reads well in a 3 m lobby gets
copied to the end of a 30 m corridor and stops working, or someone shortens the copy by hand and the
family stops agreeing with itself. Sightline makes the family one artifact: a single directory of
destinations is the only input, and one Hyper Elements `Canvas` template renders each destination at
three viewing distances, choosing which copy the sign carries from the distance.

When the copy cannot fit at a distance, the template refuses instead of shrinking or truncating it.
A 30 m sign with no short form fails `check` with `image/fit`, naming the field and saying roughly how
much to cut — "cut about 42 characters" — and `render` writes nothing. Add the short form and the
family re-renders, with the 3 m and 12 m signs untouched. The refusal demands content; it does not
destroy it.

Two buildings come from one factory via `extendTheme`: an editorial set in IBM Plex Sans on ivory and
deep green, and an industrial set in Barlow Condensed on near-black and signal yellow — different
ground, type family, type width, grid and arrow, not a recolour.

## GitHub repository

TBD-post-build:public repository URL (the repo is `orjinameh/sightline`; the Codespaces token cannot
create it, so it is created and flipped public at the closing gate)

## Hyper Elements implementation

Hyper Elements is the render path, not a dependency in the manifest. The submitted artifact is a
template, and the v0.5 template surface is what makes it one:

- **`formats`** — three named `Canvas` sizes (`near` 300×200 mm, `mid` 600×300 mm, `far` 900×300 mm at
  150 DPI). `render` builds each declared size, so `template/format` checks that what was drawn is what
  the format declares.
- **`fit` + `image/fit`** — the copy is fitted text in a `Canvas`, measured with real fonts. When it
  fits at none of its sizes the template fails with `image/fit`, naming the field (`"field": "short"`)
  and roughly how much to cut. This is the measured refusal the whole project is built on.
- **`field.image` limits** — `aspect`, `minWidth`, `accepts` and `transparent` on the pictogram, checked
  against the file.
- **`require.core`** — `canvas/overflow`, `image/overflow`, `image/glyph` and `image/fit` required on
  every design, with real `passed` / `failed` / `not-run` states. No `require.lint`: lint does not run
  on a Canvas.
- **`extendTheme`** — the two buildings are one base theme extended twice.
- **`describe()`** — the contract an agent fills. The README's first image is that contract, drawn from
  the committed `docs/contract.json`.
- **Values files** — the designs are data, so nothing executes before the template checks it; the demo's
  edit is `design set … short="Visitor car park"`.
- **`renderPdf()`** — an A3 sign schedule as the fabricator handoff.

Everything is rendered by `renderImage()` / `renderPdf()` on the server: no browser, no screenshot
service, no network at render time (fonts and pictograms are committed bytes).

## Live preview (optional)

https://sightline-six-gamma.vercel.app

A live renderer, not a gallery. The page posts the form to `app/api/render`, a Vercel Node function that
runs the *same* `templates/sign-family.tsx` the CLI runs, through `renderImage()` per format. Leave the
30 m form empty and the API returns `422` with the library's own `image/fit` diagnostic (field `short`,
"cut about 63 characters") and withholds the 30 m image; fill it in and it returns three PNGs.

Verified against the deployed URL: `422` with exactly one diagnostic, and `200` with three
`data:image/png` payloads. `satori` and `@resvg/resvg-js` are `serverExternalPackages`, and
`outputFileTracingIncludes` traces `assets/**` into the function.

---

## Confirmations (the form ends with these)

- [ ] `hyper-elements/hyper-elements` is **starred** by the submitting account
      → TBD-post-build:star confirmed (the closing gate checks it)
- [ ] The public repository contains the required source code and README
      → TBD-post-build:repo public and README present
- [ ] The submission meets the challenge requirements
      → satisfied by construction: Hyper Elements in the render path; README carries preview media,
      the implementation note and reproduce steps

## README media the form links to

- First image: `docs/images/contract.png` — the `describe()` contract (not a pretty sign)
- `docs/images/strip.png` — the same destination at 3 m, 12 m and 30 m, at one scale
- TBD-post-build:demo media — a short GIF of the 30 m refusal followed by the strip (Step 2.5), if the
  demo studio produces one; the committed screenshots already satisfy the event's
  "screenshot, GIF or video" requirement

## Notes for the closing gate

- No faucet, wallet, deploy, API key or chain step exists in this campaign.
- The only human gates are: create/flip the public repo, star the sponsor repo, and post the Discussion.
- The README's forbidden strings (`print-ready`, `ADA compliant at 30 m`, `the legal maximum is six
  words`) are mechanically blocked by `scripts/check-readme.mjs`, which is the README task's gate.
