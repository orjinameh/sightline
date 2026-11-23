# Seeds — current-quarter narratives, sponsor releases, and the timing fact that decides strategy

Fetched 2026-11-23. This augments `references/web3-seed-pack.md` (which is web3-flavored and largely irrelevant here —
this is a docs/design challenge, not a chain one). What matters instead: what the sponsor shipped *this month*, and
what story they are telling about themselves.

## The timing fact (decisive — verified from releases)

| Date | Release | What it was |
|---|---|---|
| **2026-11-16** | — | **Challenge opens** |
| **2026-11-18** | **v0.5.0** | *"Templates: reusable designs with guardrails"* (PR #229) — **the entire `template()` system, the `design new`/`describe`/`check`/`render` CLI workflow, and the brand-template architecture shipped two days after the challenge opened** |
| 2026-11-19 | v0.5.1 | Docs reworked around pictures of real output; social card for every page |
| 2026-11-19 | v0.5.2 | Open Graph image automation blog post; **free OG image generator**; email-clients accuracy documented |
| 2026-11-22 | (push) | `main` last pushed the day before this pack — the repo is under active daily development |

**Read:** the challenge is, functionally, the **launch vehicle for v0.5's template system**. The maintainer wrote a
*"Hyper Elements Template Challenge"* and shipped the *template* feature into it mid-flight. A submission that
demonstrates the new template surface — fields, formats, slots/blocks, rules, values files — is the submission the
challenge exists to elicit. A submission that doesn't (86 of 89 at fetch time) is a design using the pre-0.5 library.

This is an inference from dates and release notes, not a published statement — but it is a dated, verifiable one.

## The sponsor's own narrative (their words, from the site + docs)

- Footer, every page: *"The content engine for agents. Email, web pages, PDFs and images. Open source, MIT. Built by
  the team at Unlayer."*
- `llms-full.txt` header: *"The content engine for agents: React components your agent writes, rendered to emails,
  pages, PDFs and images, checked in every client, with the fix for what's wrong."*
- `/docs/templates` opens with: *"A template is written once, by your team: the brand's parts are locked, and a few
  parts are left open. People **and agents** make designs from it by filling the open parts, and the template checks
  each one before anything is drawn."*
- There is an `/docs/guides/ai-agents` page, an `/docs/benchmark` **agent benchmark**, an `/ai` landing page, a
  `skills/` folder in the repo, and distribution as installable agent skills
  (`npx skills add hyper-elements/hyper-elements --skill hyper-elements` / `--skill email-testing` /
  `--skill brand-templates`), plus a WebMCP tool (`check_html_email`) on the email-testing playground.

**Narrative available to a submission:** *templates are how you let an agent write your content without letting it
break your brand.* The sponsor says this themselves; nobody in the field built for it (0 of 89 use slots, blocks, or
rules — the three mechanisms that make "agent-safe content" real).

## Capability seeds (things that became possible recently, per this month's docs)

1. **Multi-size from one value set** (`formats`) — Canvas `{width,height,scale}` and Document `{size,orientation}`;
   the gallery's launch graphic renders 1080×1080 and 1200×630 from one template. New, documented, unused by the field.
2. **Rules that fail a build** — `require.lint` / `require.core` / `links.domains` / `images.domains` turn "good
   practice" into an enforced contract, with `passed|failed|not-run` per rule. *"One that didn't run never counts as
   passed."*
3. **Slots with a style policy** — `styles: "none"` lets a *filler* write content that cannot leave the brand's look,
   because literal colors are refused (`template/slot-style`). This is the "guardrails" idea made literal.
4. **Blocks as data** — approved section types picked and ordered by the filler; the look stays the template's.
5. **Values files + provenance** — `design new --set image=@file.png --source image=source.json` records
   `{kind: "generated", provider, model, prompt}` beside an image hash. The library ships **AI-image provenance**.
6. **19-client email emulator, deterministic, local** — 97–99% modelled accuracy, classic Outlook drawn with Word's
   rules, dark modes, `--findings --screenshots`. **Already table stakes in the field (36 of 89 mention the package)**
   — use it as *evidence*, never as the headline.
7. **`template extract`** — turn a human-approved design into a template by naming the parts that vary. A workflow
   story ("design once by hand, then freeze it into a template") that no entry tells.
8. **`toDesign()`** — a design as Unlayer builder JSON, for a visual editor (`/docs/guides/visual-editor`). A bridge
   to Unlayer's actual product; a "this plugs into your editor" angle exists.
9. **Agent skills** — the repo ships `skills/hyper-elements`, `skills/email-testing`, `skills/brand-templates`. A
   submission that ships *its own* skill alongside its template would be legible to this sponsor.
10. **Free OG image generator + Next.js `opengraph-image` route pattern** — the newest blog posts are literally about
    drawing cards per page from a template. A template whose first-class use is "your site's social cards" rides the
    sponsor's freshest doc.

## Anti-seeds (what the field's noise says to avoid)

- A fourth "one JSON → email + page + PDF + card" business kit (34% of titles, 49% of bodies).
- Bali/Indonesian-local color with no mechanism difference (`OMBAK`, `SUBAK`, `TAGIHAN`, `SIAGA`, `TUMBUH`, `ADOPSI`,
  `BURSA`, `Nusantara DAO` — one builder's house style, already 8 entries deep).
- Crypto framing with no chain (the event has no chain; `Last Will of a Wallet` / `Onchain Wrapped` earn nothing from it).
- A "studio"/"platform" with a dashboard (FAQ #23: complexity alone won't win; the field already has several).
