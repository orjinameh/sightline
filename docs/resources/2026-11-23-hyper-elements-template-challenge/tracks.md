# Tracks — one pool, no categories

Fetched 2026-11-23. Sources: announcement https://github.com/hyper-elements/hyper-elements/discussions/209 ·
FAQ https://unlayer.notion.site/Hyper-Elements-Template-Challenge-FAQ-4170ceb4c8e180ddb512d69e3792585d

## The single track

| Field | Value |
|---|---|
| Sponsor | **Unlayer** (builds Hyper Elements; the judging body is *"Unlayer's core team"*) |
| Track name | Hyper Elements Template Challenge (there is exactly one) |
| Problem statement | Announcement, verbatim: *"Build any kind of template using Hyper Elements and help grow the open-source template ecosystem. No categories. No predefined themes. Just build something creative!"* |
| Prize | **$100 × 5 winners** (pool $500). Non-cash: inclusion in the official template gallery + a dedicated Unlayer social post (FAQ #26) |
| Required tech | **Hyper Elements** (`@hyper-elements/react`, MIT, React) — *"meaningfully used to build and render"* (FAQ #7) |
| Minimum bar to qualify | 1) uses Hyper Elements meaningfully; 2) **public** GitHub repo with full source; 3) **star** `hyper-elements/hyper-elements`; 4) README with (a) screenshot/GIF/video preview, (b) how Hyper Elements was used, (c) run/reproduce instructions; 5) submitted as a new discussion in the *Challenge Submissions* category with the 6 form fields filled |
| Deployment | Not required (FAQ #14). Live preview optional |
| Categories / weights | **None.** FAQ #21: *"there are no separate categories. All eligible templates will be considered together"*; FAQ #22: *"evaluated holistically"* |
| Team | Allowed; prize per winning submission (FAQ #16) |
| Multiple entries | Allowed, each submitted separately (FAQ #15) |

## Qualifying checklist (the disqualification surface)

These are the only ways to lose before judging. Each is cheap; all five must be true at submission time:

- [ ] Hyper Elements is **in the render path** — the output the judge sees is produced by `render()` / `renderPdf()` /
      `renderImage()` from Hyper Elements components. Not "installed and unused" (FAQ #7's explicit failure mode).
- [ ] Repo is **public** (FAQ #13) — a private repo is a hard fail regardless of code quality.
- [ ] `hyper-elements/hyper-elements` is **starred** by the submitting account (form confirmation #11).
- [ ] README has all three parts: **preview media** (screenshot, GIF or video), **implementation explanation**,
      **setup/reproduce instructions** (FAQ #12).
- [ ] Discussion created in **Challenge Submissions** with `Challenge` = *Hyper Elements Template Challenge*, plus
      project name, description, repo URL, implementation note (live preview optional).

## De-facto sub-tracks (field clustering — evidence, not official categories)

The FAQ says there are no categories, but 89 live submissions cluster hard. Numbers from `prior-art.md`
(counted over the 89 discussions in the category on 2026-11-23):

| Cluster | Share of field (measured) | Notes |
|---|---|---|
| "One data file → several outputs" business/ops **kit** (email + page + PDF + social card) | **34%** of titles state the idiom (30/89); **49%** of bodies (44/89) frame it that way; **38%** of titles contain "kit" | The default idiom. Highly saturated; a near-twin of *"one X file → email, page, PDF, card"* appears across dozens of entries |
| Single-output **email** template (one root) | ~15% (estimate) | Cheapest to ship; the official gallery already ships 17 email templates |
| Single-output **PDF/Document** | ~8% (estimate) | Invoices, receipts, résumés, certificates — the gallery already covers all four |
| Single-output **image/Canvas** (OG card, share card, badge) | ~6% (estimate) | `renderImage` + Satori |
| **Interactive** page/app around a template (live editor, prompt→form, animated landing) | ~6% (estimate) | Highest-risk, highest-ceiling on `Originality` |
| **Multi-brand / design-system** template (one template, many brands via `extendTheme`) | ~3% (estimate) | Closest to how the official gallery itself is built |

Only the first row is a measured count; the rest are reading-based estimates over the same 89 bodies — treat them as
orientation, and re-count from `raw/submissions.json` if a decision turns on one.

The official gallery the winners join is organized as **Emails · Pages · PDFs · Images** (30 templates across 15
sample brands, 2026-11-23) — so "which output type" is a *placement* decision, not a track decision.

## Inferred scoring levers (labelled inference — not published)

Published criteria are the only binding text. These are readings of them against what the field actually does;
idea-forge should treat them as hypotheses to test, not facts:

1. **`Use of Hyper Elements` is the criterion with the most headroom.** The deepest surfaces of the library —
   `template()` with typed fields, `formats`, `field.slot`/`prop.blocks`, `rules` (`require.lint`, `require.core`,
   `links.domains`), values files (`design new` / `design set`), `--require-template`, `describe`, and the
   email-client emulator — are used by **0–4 of 89** submissions (measured: `template(` 2, `field.slot` 0,
   `prop.blocks` 0, `require:` 0, `--require-template` 0, `formats` 0, values files 0, `@hyper-elements/email-clients` 0,
   `@hyper-elements/lint` 0). See `prior-art.md` §White space.
2. **`Practical value` rewards the gallery's own shape.** The gallery's unit is
   `templates/<kind>/<slug>/template.tsx` + `designs/*.tsx` + a brand, i.e. *a brand-parameterized template with
   designs made from it*. A submission in that exact shape is (a) obviously reusable, (b) trivially acceptable into
   the gallery — which is the prize. **Inference.**
3. **`Overall execution` includes documentation.** *"properly documented and easy to understand or reproduce"* is
   verbatim in FAQ #22 — README quality is scored, not just tolerated.
4. **`Originality` is judged against a visible field.** The judges can see all 89 entries in the same category listing;
   a 4-output business kit reads as "another one". Domain novelty (a domain no entry touched) and mechanism novelty
   (the library's unused surfaces) are the two levers.
