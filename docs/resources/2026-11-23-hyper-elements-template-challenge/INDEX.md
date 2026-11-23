# INDEX — resource pack: Hyper Elements Template Challenge ($500)

- **Event:** Hyper Elements Template Challenge (November 2026), by **Unlayer** / Hyper Elements
- **Pack fetched:** 2026-11-23 (UTC), by the resource-extractor (Step 0a) of the build-system pipeline
- **Deadline:** **2026-11-29 23:59 UTC** — see `event.md`
- **Vendored corpus:** 1.1 MB total; `raw/llms-full.txt` is the sponsor's entire docs site (543 KB, MIT-licensed)

## Files in this pack

| File | What it holds |
|---|---|
| `event.md` | Deadline (absolute + tz), eligibility, scope, submission form fields, README requirements, **judging criteria verbatim (no weights published — documented gap)**, prizes, cross-checks. Testnet/mainnet: N/A |
| `tracks.md` | The single track, the qualifying checklist, field clustering (measured), inferred scoring levers (labelled inference) |
| `sponsors/hyper-elements.md` | The only sponsor: what they reward, pinned package versions, entry-point signatures, integration models (Next.js specifics), **15 gotchas**, CLI surface, email-client emulator, feasibility notes for the architect |
| `sponsors/hyper-elements/template-api.md` | The `template()` surface in depth — fields, image limits, bindings, slots, blocks, rules, `check()`, values files, CLI loop, and how the official gallery is built |
| `prior-art.md` | Official gallery (30 templates / 15 brands) + **all 89 live submissions** (verbatim table) + measured pattern analysis + white space + 8 exemplar deep reads + head-to-head implications |
| `seeds.md` | The v0.5.0 timing fact, the sponsor's own narrative, 10 capability seeds, anti-seeds |
| `raw/` | Vendored primary sources (see below) — nothing paraphrased |

## Provenance — every source

| # | Source | URL | Fetched | Tool | Type | Confidence / gaps |
|---|---|---|---|---|---|---|
| 1 | Challenge announcement (rules, prizes, criteria, dates) | https://github.com/hyper-elements/hyper-elements/discussions/209 | 2026-11-23 | WebFetch | **Primary** | High. Full post text captured verbatim; 0 replies at fetch. Maintainer-authored (`ericdellacasa8`) |
| 2 | Official challenge FAQ (30 Q&A) | https://unlayer.notion.site/Hyper-Elements-Template-Challenge-FAQ-4170ceb4c8e180ddb512d69e3792585d | 2026-11-23 | **Playwright** (Notion SPA; virtualized scroll, reassembled) | **Primary** | High on content. Reassembly order within a viewport window can repeat a heading; all Q1–Q30 present. Saved to `raw/faq.txt` |
| 3 | Docs home / Introduction | https://www.hyperelements.dev/docs | 2026-11-23 | WebFetch | Primary | High — server-rendered |
| 4 | Full docs corpus (`llms-full.txt`) | https://www.hyperelements.dev/llms-full.txt | 2026-11-23 | `curl` | **Primary** | High. 543,024 bytes; every docs page with its own `Source:` URL. `raw/llms-full.txt` |
| 5 | Docs index (`llms.txt`) | https://www.hyperelements.dev/llms.txt | 2026-11-23 | `curl` | Primary | High. `raw/llms.txt` |
| 6 | React package GUIDE.md | https://raw.githubusercontent.com/hyper-elements/hyper-elements/main/packages/react/GUIDE.md | 2026-11-23 | `curl` | **Primary** | High. Generated from the element definitions; guide id `f82a37d3`. `raw/GUIDE.md` |
| 7 | `hyper-elements` agent skill | https://www.hyperelements.dev/skills/hyper-elements.md | 2026-11-23 | `curl` | Primary | High. Same guide id as #6, plus CLI + migration sections. `raw/skill-hyper-elements.md` |
| 8 | `brand-templates` agent skill (repo) | https://raw.githubusercontent.com/hyper-elements/hyper-elements/main/skills/brand-templates/SKILL.md | 2026-11-23 | `curl` | **Primary** | High. The template-authoring workflow the docs don't spell out in one place. `raw/skill-brand-templates.md` |
| 9 | Brand-template worked example (repo) | https://raw.githubusercontent.com/hyper-elements/hyper-elements/main/skills/brand-templates/example.tsx | 2026-11-23 | `curl` | Primary | High — a complete `template()` with slot + rules. `raw/example-brand-template.tsx` |
| 10 | Real gallery template (repo) | https://raw.githubusercontent.com/hyper-elements/hyper-elements/main/templates/images/announcement/template.tsx | 2026-11-23 | `curl` | Primary | High — 146 lines, `field.image` limits, `fitInside`, Canvas rules, brand-parameterized. `raw/example-announcement-template.tsx` |
| 11 | Templates README (gallery inventory) | https://raw.githubusercontent.com/hyper-elements/hyper-elements/main/templates/README.md | 2026-11-23 | `curl` | Primary | High. All 30 templates + 9 sample brands with one-liners. `raw/templates-README.md` |
| 12 | Template gallery (live) | https://www.hyperelements.dev/templates | 2026-11-23 | `curl` + regex | Primary | High on routes/counts (30 templates, 15 brand slugs). `raw/gallery.json` |
| 13 | Live submissions (all 89) | https://github.com/hyper-elements/hyper-elements/discussions/categories/challenge-submissions | 2026-11-23 | **GitHub GraphQL** (`gh api graphql`) | **Primary** | High — full bodies, authors, URLs, timestamps. `raw/submissions.json`. Gaps: #301/#293 link attachments not repos; #306/#292/#278 untitled; #214 links the sponsor repo |
| 14 | Discussion list pages 1–4 (cross-check of #13) | …?page=1..4 | 2026-11-23 | `curl` + regex | Primary | Used to confirm the GraphQL count (87 links on pages vs 89 nodes — the 2 extra are the 2 pinned Announcements) |
| 15 | npm registry (versions, peer deps, exports) | https://registry.npmjs.org/@hyper-elements/{react,cli,email-clients,lint,migrate}/latest | 2026-11-23 | `curl` | **Primary** | High. `react@0.5.2`, `cli@0.3.3`, `email-clients@0.5.3`, `lint@0.1.11`, `migrate@0.4.3` |
| 16 | Repo metadata | https://api.github.com/repos/hyper-elements/hyper-elements | 2026-11-23 | `gh api` | Primary | High. MIT, 501 stars, pushed 2026-11-22T23:29Z |
| 17 | Release notes / tags | https://api.github.com/repos/hyper-elements/hyper-elements/releases | 2026-11-23 | `gh api` | **Primary** | High. **v0.5.0 = "Templates: reusable designs with guardrails", published 2026-11-18** — the key timing fact in `seeds.md` |
| 18 | Q&A / General / Ideas / Show-and-tell categories | …/discussions/categories/… | 2026-11-23 | `gh api graphql` | Primary | **Empty: 0 discussions in each** — recorded as a fact, not a gap. No maintainer guidance exists outside the announcement + FAQ |
| 19 | Package `REFERENCE.md` (per-prop defaults) | https://raw.githubusercontent.com/hyper-elements/hyper-elements/main/packages/react/REFERENCE.md | 2026-11-23 | not fetched | — | **Gap:** deliberately skipped (large, and the architect can read it from `node_modules` once installed). GUIDE.md covers what a design needs |

## Secondary / non-sources (considered and rejected)

- **Blog posts** on hyperelements.dev (`/blog`) — they are walkthroughs of the same docs (OG images, PDF invoices,
  GitHub Actions, Claude Code). Useful as demo ideas, not as facts; not extracted separately.
- **`/compare/react-email`, `/compare/mjml`, `/alternatives/*`** — marketing pages; they describe competitors, not
  this event. Skipped by the bounded-crawl rule.
- **Unlayer's own product docs** — different product (`@unlayer/react-elements` is the *old* package the migrate
  codemod targets). Not the challenge's subject; noted only as a migration path.
- **Third-party commentary** — none found; the challenge is 7 days old and the only discussion traffic is the entries.

## Verification notes

- **Deadline appears in two independent places** (announcement #209, FAQ #27) with identical wording → no conflict.
- **Judging criteria appear in two places**: the announcement's short form (5 names) and FAQ #22's full form (5 names +
  descriptions + "holistically"). No conflict; **no weights anywhere** — stated as a gap in `event.md`, and idea-forge
  must not invent them.
- **Prize figures agree** ($500 total / $100 × 5) across #209, FAQ #20, FAQ #21.
- **Submission count is live, not fixed**: 89 at 2026-11-23T02:40Z, and the newest entry (#333) was posted the same
  day. **Re-count before any strategy that depends on "the field is N entries"** — the deadline is 6 days out.
- **Nothing in this pack is invented.** Where a number was estimated rather than counted, the file says so
  (`tracks.md` cluster shares; `prior-art.md` §6 hypotheses).

## Handoff

This pack is idea-forge's **primary source** (Step 0). Its Step-1 inputs — hackathon URL, tracks, published judging
criteria, prior art — are pre-extracted here. Read `event.md` → `tracks.md` → `prior-art.md` (§3–§6 are the
decision-grade parts) → `seeds.md`, and treat `sponsors/hyper-elements/template-api.md` as the feasibility floor for
any candidate idea: an idea that can't be built with `template()` + fields/formats/rules + the CLI is a weaker idea
for *this* challenge, by the event's own published criterion.
