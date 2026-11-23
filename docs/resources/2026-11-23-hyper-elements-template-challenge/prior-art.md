# Prior art — official gallery, live field, and the white space

Fetched 2026-11-23. Two bodies of prior art matter here, and they are different things:

1. **The official gallery** (https://www.hyperelements.dev/templates) — the **design bar** and the destination the
   five winners are added to. 30 templates, 15 brands.
2. **The live challenge field** — **89 submissions** in the *Challenge Submissions* category on 2026-11-23, fetched
   via GitHub GraphQL (full bodies + authors), i.e. the **head-to-head competition** the judges will read in one list.

---

## 1. The official gallery — 30 templates, 15 brands (the bar)

Every one is a `template()` made from a brand, shipped with 2 designs, in **17 emails / 1 page / 7 PDFs / 5 images**.
Full list with one-liners: `raw/templates-README.md` (verbatim from the repo). The shapes to beat:

| Type | Templates | What "polished" means here |
|---|---|---|
| Email (17) | welcome, password-reset, magic-link, verify-email, sign-in-code, receipt, invoice, order-confirmation, shipping, event, newsletter (11) + 6 real-brand recreations (Stripe welcome, Apple App Store receipt, Nike shipping, Spotify Premium, Stack Overflow tips, Airbnb review) | tabular, one CTA, locked header/footer, text inherits the theme's body |
| Page (1) | event page | band of brand color, schedule, speakers |
| PDF (7) | invoice, receipt, quote, certificate, ticket, Stripe invoice, Airbnb trip receipt | letterhead, page numbers, tabular totals, signature/seal |
| Image (5) | launch graphic (2 formats from one template), Nike drop, OG card (1200×630), speaker card, Spotify Wrapped (1080×1920) | fitted text, Svg shapes, Layer over artwork |

**The two things the gallery proves the judges expect:**
- **One template, several sizes** (the launch graphic renders `square` 1080×1080 *and* `landscape` 1200×630 from the
  same values) — this is `formats`, used by **0 of 89** submissions.
- **One template, many brands** — the gallery's own "see them in their own brands" switcher, via `extendTheme()`.

## 2. The live field — 89 submissions (verbatim, machine-extracted)

Source: GitHub GraphQL, `repository.discussions(categoryId: "DIC_kwDOPkBcA84DLQB3")`, fetched 2026-11-23.
Machine-readable copy with full bodies: `raw/submissions.json` (`number`, `title`, `body`, `url`, `author.login`,
`createdAt`, `upvoteCount`). The table below is generated from it — titles are exact; `[Challenge Submission]` is
part of the real title where present.

Author distribution: `rohit-jsfreaky` 17 · `dunoil` 9 · `ferdiakhmadirawan44` 8 · `r0ebn` 5 · `Lontong6` 4 ·
`onchaindc` 3 · `Aayu095` 3 · `AshThunder` 3 · singletons elsewhere — **~30 distinct builders, ~3 entries each**,
so the judges are effectively choosing among *portfolios*, not single pieces.

| # | Author | Title (verbatim) | Repo (from body) |
|---|---|---|---|
| 333 | `dunoil` | VINYL DROP: Twelve records, one Friday, no repress, a record store release kit (preorder email, drop page, printed invoice and stock-sheet PDF, cover-art cards from one drop file) | https://github.com/dunoil/vinyl-drop |
| 331 | `rohit-jsfreaky` | [Challenge Submission] Kerbside: the timetable your stop used to have on paper | https://github.com/rohit-jsfreaky/kerbside |
| 330 | `rohit-jsfreaky` | [Challenge Submission] Tirekick: the recall check before you buy a used car | https://github.com/rohit-jsfreaky/tirekick |
| 329 | `ferdiakhmadirawan44` | BURSA — Exchange Trade Kit | https://github.com/ferdiakhmadirawan44/bursa-kit |
| 328 | `rohit-jsfreaky` | [Challenge Submission] Countersign: see what the Terraform plan destroys before you sign it | https://github.com/rohit-jsfreaky/countersign |
| 327 | `mrnorbertf` | [Challenge Submission] Transfer Window — transit replacement notices | https://github.com/mrnorbertf/transfer-window |
| 326 | `rohit-jsfreaky` | [Challenge Submission] Cousins: the family tree on one page, aunts and uncles included | https://github.com/rohit-jsfreaky/cousins |
| 325 | `rohit-jsfreaky` | [Challenge Submission] Takeback: homework from your student's own chess game | https://github.com/rohit-jsfreaky/takeback |
| 324 | `rohit-jsfreaky` | [Challenge Submission] Doorlist: which AI bots your robots.txt lets in, and what keeping each one out costs you | https://github.com/rohit-jsfreaky/doorlist |
| 323 | `rohit-jsfreaky` | [Challenge Submission] Lapse: every certificate on your domain, and the ones that won't renew | https://github.com/rohit-jsfreaky/lapse |
| 322 | `rohit-jsfreaky` | [Challenge Submission] Day One: the setup guide your repo already knows | https://github.com/rohit-jsfreaky/day-one |
| 321 | `rohit-jsfreaky` | [Challenge Submission] Inboxed: will this domain's email land in the inbox? | https://github.com/rohit-jsfreaky/inboxed |
| 320 | `rohit-jsfreaky` | [Challenge Submission] Verdict: "Are you affected?" Answered and published | https://github.com/rohit-jsfreaky/verdict |
| 319 | `rohit-jsfreaky` | [Challenge Submission] Runway: how long each part of your stack has left | https://github.com/rohit-jsfreaky/runway |
| 318 | `rohit-jsfreaky` | [Challenge Submission] Columnist: the data dictionary that writes itself from your schema | https://github.com/rohit-jsfreaky/columnist |
| 317 | `rohit-jsfreaky` | [Challenge Submission] Owed: the SLA credit your vendor owes you, from its own status page | https://github.com/rohit-jsfreaky/owed |
| 316 | `rohit-jsfreaky` | [Challenge Submission] Plainspeed: Lighthouse, in words your client reads | https://github.com/rohit-jsfreaky/plainspeed |
| 315 | `rohit-jsfreaky` | [Challenge Submission] Fineprint: every licence you ship, accounted for | https://github.com/rohit-jsfreaky/fineprint |
| 314 | `rohit-jsfreaky` | [Challenge Submission] Sundown: retire an API endpoint without breaking anyone | https://github.com/rohit-jsfreaky/sundown |
| 313 | `rohit-jsfreaky` | [Challenge Submission] Homeward: one file, the whole lost-pet appeal | https://github.com/rohit-jsfreaky/homeward |
| 312 | `camtonguyen` | [Challenge Submission] The Deep Scroll | https://github.com/camtonguyen/the-deep-scroll |
| 311 | `iamIniunam` | [Challenge Submission] MobiPay: one mobile money receipt, four formats | https://github.com/iamIniunam/mobipay |
| 310 | `dunoil` | MEND — Bring the broken thing: a repair café kit (customer email, workshop page, printed repair-ticket PDF, status-and-parts cards from one session file) | https://github.com/dunoil/mend |
| 308 | `dunoil` | WAYFARER — The Slow Road, walked: a small-group travel itinerary kit (traveller email, trip page, printed itinerary PDF, daily social cards from one trip file) | https://github.com/dunoil/wayfarer |
| 306 | `yash-pouranik` | [Challenge Submission] | https://github.com/yash-pouranik/OSS-RELEASE-KIT--Hyper-elements-Template |
| 305 | `ScapeXYZ` | OweBook – One ledger. Four outputs. | https://github.com/ScapeXYZ/OweBook |
| 304 | `ahmardchain` | [Challenge Submission] Meridian: animated conference registration email (dark theme) | https://github.com/ahmardchain/meridian |
| 303 | `YashM2704` | [Challenge Submission] Foldline gift cards — one gift becomes its card, email, balance page, fold-in card and share images | https://github.com/YashM2704/foldline-gift-cards |
| 302 | `Ashutoshranjan195` | Launch Kit — Multi-Format Release Kit for Small-Batch Brands | https://github.com/Ashutoshranjan195/launch-kit |
| 301 | `Aayu095` | [Challenge Submission] The Listing — The Real Estate Kit · one listing file → listing Email, drawn-to-measure Page, brochure & cost-sheet PDF & poster Canvas | https://github.com/Aayu095/The-Listing-The-Real-Estate-Kit |
| 300 | `onchaindc` | [Challenge Submission] AFTERACTION | https://github.com/onchaindc/afteraction |
| 299 | `rajarshidattapy` | [Challenge Submission] Sluice Daily Digest | https://github.com/rajarshidattapy/sluice-daily-digest |
| 298 | `Thanusha8095` | NEXORA Signature — Universal Business Report Studio | https://github.com/Thanusha8095/nexora-signature |
| 295 | `dunoil` | CURTAIN CALL — One night, every seat filled: a community theatre production kit (patron email, production page, printed programme PDF, cast cards from one production file) | https://github.com/dunoil/curtain-call |
| 294 | `ferdiakhmadirawan44` | [Challenge Submission] ADOPSI — Hyper Elements Adoption Kit | https://github.com/ferdiakhmadirawan44/adopsi-adoption-kit |
| 293 | `Aayu095` | [Challenge Submission] Latchkey — The Account Security Kit · one account record → sign-in alert Email, security-center Page, incident-report PDF & recovery Canvas card | https://github.com/Aayu095/Latchkey-The-Account-Security-Kit |
| 292 | `lavjeetrai` | [Challenge Submission] | https://github.com/lavjeetrai/daa |
| 291 | `Ashish-CodeJourney` | [Challenge Submission] Hyper Invoice: one invoice JSON → email, web page, PDF and social card | https://github.com/Ashish-CodeJourney/hyper-invoice |
| 290 | `ferdiakhmadirawan44` | [Challenge Submission] DAO Voting Kit — Nusantara DAO: one proposal file → 7 outputs (email, page, PDF, certificate, share card) | https://github.com/ferdiakhmadirawan44/dao-voting-kit |
| 289 | `Joystonm` | [Challenge Submission] Meridian — A Multi-Format Type Foundry Template | https://github.com/Joystonm/meridian |
| 288 | `Onichanmmm` | [Challenge Submission] Hyper Game Launch Kit | https://github.com/Onichanmmm/hyper-game-launch-kit |
| 287 | `Onichanmmm` | [Challenge Submission] Hyper Invoice Kit | https://github.com/Onichanmmm/hyper-invoice-kit |
| 286 | `ferdiakhmadirawan44` | [Challenge Submission] TAGIHAN — PLN Electricity Bill Kit: one meter reading → bill + receipt + page + PDF + reminder card | https://github.com/ferdiakhmadirawan44/tagihan-bill-kit |
| 285 | `dunoil` | SUBAK — One water, fairly shared: a traditional Balinese water cooperative kit (member notice email, season page, printed rotation charts PDF, gate cards from one water file) | https://github.com/dunoil/subak |
| 284 | `dunoil` | OMBAK — Every break, every tide: a Bali surf kit (dawn-patrol alert email, swell page, printed break charts PDF, session cards from one swell file) | https://github.com/dunoil/ombak |
| 283 | `dunoil` | ORBITAL — Every pass, predicted: a satellite observation kit (observer alert email, passes page, printed station charts PDF, pass cards from one night file) | https://github.com/dunoil/orbital |
| 282 | `ferdiakhmadirawan44` | [Challenge Submission] TUMBUH — Baby's First Year Kit: one birth date → email + page + PDF + reminder card | https://github.com/ferdiakhmadirawan44/tumbuh-first-year-kit |
| 281 | `ferdiakhmadirawan44` | [Challenge Submission] SIAGA — Flood Alert Kit: one gauge reading → email + page + PDF + share card | https://github.com/ferdiakhmadirawan44/flood-alert-kit |
| 280 | `dunoil` | RELEASE LEDGER — Every version, on the record: a software release kit (announcement email, release page, sign-off PDF, announcement cards from one release file) | https://github.com/dunoil/release-ledger |
| 279 | `Aayu095` | [Challenge Submission] Marigold — The Clinic Kit · one patient file → Email, Page, lab-report PDF & Canvas poster | https://github.com/Aayu095/Marigold-The-Clinic-Kit |
| 278 | `OxRaji` | [Challenge Submission] | https://github.com/Oxraji/hyper-elements |
| 265 | `safwaankira` | [Challenge Submission] Night Shift: the morning report for AI coding agents (email, page, PDF audit trail, share card from one session log) | https://github.com/safwaankira/night-shift |
| 264 | `onchaindc` | [Challenge Submission] Last Will of a Wallet | https://github.com/onchaindc/last-will-of-a-wallet |
| 263 | `r0ebn` | [Challenge Submission] Perseid Night — a public stargazing night kit | https://github.com/r0ebn/perseid-night |
| 262 | `r0ebn` | [Challenge Submission] The Lantern Appeal — a charity gala fundraiser kit | https://github.com/r0ebn/lantern-appeal |
| 261 | `AshThunder` | [Challenge Submission] Metered: utility bills in due, paid and overdue from one account file | https://github.com/AshThunder/metered |
| 260 | `AshThunder` | [Challenge Submission] Term Report: one class file, every family's report | https://github.com/AshThunder/term-report |
| 259 | `AshThunder` | [Challenge Submission] Pay Packet: one payroll file, every payslip an employee receives | https://github.com/AshThunder/pay-packet |
| 258 | `Revaaa28` | [Challenge Submission] Ledgerline — the Get-Paid Kit | https://github.com/Revaaa28/ledgerline-kit |
| 257 | `dunoil` | SOWN — One Harvest, Every Box: a CSA harvest kit (email, page, packing PDF, recipe cards from one harvest file) | https://github.com/dunoil/sown-harvest-kit |
| 256 | `memeshee` | [Challenge Submission] Roll Call — 240 attendee badges from one CSV: print sheets, emails, pages and cards | https://github.com/memeshee/roll-call |
| 255 | `onchaindc` | Onchain Wrapped — Spotify Wrapped for any wallet | https://github.com/onchaindc/onchain-wrapped |
| 254 | `fortunesayspump` | [Challenge Submission] Access Brief — access information without an accessibility score | https://github.com/fortunesayspump/access-brief |
| 253 | `fortunesayspump` | [Challenge Submission] Object Lesson — one artwork, four ways to look closely | https://github.com/fortunesayspump/object-lesson |
| 252 | `fortunesayspump` | [Challenge Submission] Signal Desk — source-linked incident communications | https://github.com/fortunesayspump/signal-desk |
| 251 | `Ankith-m1006` | [Challenge Submission] Rent Receipt Kit — a year of Indian rent receipts from one tenancy file | https://github.com/Ankith-m1006/rent-receipt-kit |
| 250 | `ashwanisingh011` | [Challenge Submission] Northwind Summit Launch Kit: one source, four outputs, editorial design system | https://github.com/ashwanisingh011/hyper-elements |
| 247 | `shubh-gitpush` | Scuderia Performance Showroom — Ferrari Collection | https://github.com/shubh-gitpush/Hyper_template.git |
| 246 | `CodingwithMohit` | [Challenge Submission] UPI Receipt Kit: one source, three outputs, three payment states | https://github.com/CodingwithMohit/upi-receipt-kit |
| 245 | `skymiller1509-blip` | <smart-form> - AI-Powered Dynamic Web Components | https://github.com/skymiller1509-blip/smart-form |
| 244 | `santanu-atta03` | LaunchKit – One Design. Four Possibilities | https://github.com/santanu-atta03/launchkit-hyper-elements |
| 243 | `r0ebn` | [Challenge Submission] Harborlight Inn — a boutique inn booking kit | https://github.com/r0ebn/harborlight-inn |
| 242 | `r0ebn` | [Challenge Submission] Northstar Academy — a course completion kit | https://github.com/r0ebn/northstar-academy |
| 241 | `r0ebn` | [Challenge Submission] Saffron & Smoke — a seasonal tasting-menu launch kit | https://github.com/r0ebn/saffron-smoke |
| 240 | `cezo484` | Elena & Deniz — an Aegean wedding invitation kit: one theme → email, web page, PDF invitation & social card | https://github.com/cezo484/aegean-wedding-kit |
| 239 | `ariesbalweell` | Disclosure Report | https://github.com/ariesbalweell/hyper-elements-disclosure-report |
| 238 | `MSAbhishek22` | Midnight Circuit — a hackathon event kit: one theme → email, web page, PDF ticket & social card | https://github.com/MSAbhishek22/midnight-circuit-hyper-elements-kit |
| 237 | `Lontong6` | Year in Code — year-in-review stats card | https://github.com/Lontong6/hyper-elements-year-in-code |
| 236 | `Lontong6` | Mara Voss — designer résumé (Document → PDF) | https://github.com/Lontong6/hyper-elements-mara-voss-resume |
| 235 | `Lontong6` | Ember Roast — order receipt email | https://github.com/Lontong6/hyper-elements-ember-receipt |
| 234 | `Lontong6` | Halyard — SaaS landing page | https://github.com/Lontong6/hyper-elements-halyard-landing |
| 233 | `ferdiakhmadirawan44` | [Challenge Submission] Relay — a product launch landing page | https://github.com/ferdiakhmadirawan44/relay-launch-landing-page |
| 232 | `ferdiakhmadirawan44` | [Challenge Submission] The Ledger — a weekly crypto portfolio digest email | https://github.com/ferdiakhmadirawan44/weekly-crypto-portfolio-digest |
| 231 | `lampardkarunia` | [Challenge Submission] Solstice Fest Kit — one festival, four formats, one source of truth | https://github.com/lampardkarunia/solstice-fest-kit |
| 222 | `golden-lark-12` | [Challenge Submission] Matchday — a football club's whole matchday from one fixture file | https://github.com/golden-lark-12/matchday |
| 215 | `Luis8755` | Daylight — Copenhagen, in one unhurried day | https://github.com/Luis8755/daylight-hyper-elements-template |
| 214 | `Ysf30` | [Challenge Submission] Launch Day — Solstice 1.0 | https://github.com/Ysf30/hyper-elements |
| 211 | `Revaaa28` | [Challenge Submission] Meridian Marathon — Race Report | https://github.com/Revaaa28/meridian-race-report |
| 210 | `Revaaa28` | [Challenge Submission] Northlight Sessions | https://github.com/Revaaa28/northlight-sessions |

**Gaps in the table:** #301 and #293 link to `user-attachments` images rather than a repository, so their repo URLs
are not verifiable from the discussion body. #306, #292, #278 post an untitled discussion. #214 links the sponsor's
own repo, not the entrant's.

## 3. What the field actually does (measured, not impression)

Counts over all 89 bodies: the **presence of a signal string** in the discussion body, 2026-11-23. This measures
*claims*, not verified code — an entry can claim a feature it doesn't ship. Treat a `0` as reliable (nobody even
mentions it) and a non-zero as "at least this many talk about it".

### Table stakes (the field already does this — not a differentiator)

| Signal | Entries | Reading |
|---|---|---|
| `renderPdf` | 69 / 89 | A PDF output is near-universal |
| `defineTheme` | 64 / 89 | Theme-first is universal; an unthemed design looks dated beside the field |
| `renderImage` | 64 / 89 | A Canvas/share card is table stakes |
| `validate()` | 41 / 89 | Validation is common |
| `@hyper-elements/email-clients` | **36 / 89** | **40% of the field already ships client proof** (Outlook/Gmail/Apple Mail previews). Do not treat this as novel |
| `hyper-elements check` (CLI) | 28 / 89 | A third ran the checker |
| `brand(...)` / brand-parameterized | 22 / 89 | Brand-driven templates are more common than the titles suggest |
| `design new` (CLI) + `hyper-elements render` | **17 / 89** | The values-file workflow **is** in use — but by essentially one portfolio (`rohit-jsfreaky`, #313–#331). It is a *house style*, not a field norm |
| `defineElement()` | 13 / 89 | Typed custom elements (`prop.text`, `prop.choice`, …) — the deepest thing most top entries do |
| `outline()` | 11 / 89 | Layout verification |
| `extendTheme()` | 9 / 89 | Multi-brand from one base |

### White space (measured zero — nobody mentions these)

| Signal | Entries | Reading |
|---|---|---|
| `formats: { … }` (multi-size from one template) | **0** | The gallery's own signature move (square + landscape from one value set) is unused by the entire field. Prose "four formats" (19 entries) means four *output roots*, not the `formats` option |
| `field.slot` | **0** | Slots — content someone else writes, inside limits — unused |
| `prop.blocks` | **0** | Blocks — approved sections as data — unused |
| `rules: { … }` as a template rules block | **0** | Template rules unused (the 5 "rules" hits are prose about validation) |
| `require: { lint, core }` | **0** | Enforced rules (`passed/failed/not-run`) unused |
| `--require-template` | **0** | Template enforcement in CI unused |
| `template extract` | **0** | "Freeze an approved design into a template" unused |
| `--max-warnings 0` | **0** | A hard CI gate on warnings unused |
| `@hyper-elements/lint` as a package / `require.lint` | **0** (5 use `lint(` inline) | Lint *as a template rule* unused |

### Near-zero (1–2 entries)

| Signal | Entries | Reading |
|---|---|---|
| `template()` / `import … from "@hyper-elements/react/template"` | **2** (#313, #314; #303 claims "five `template()`s") | The template API is the newest and least-used surface in the field |
| `field.image` (with its aspect/minWidth/accepts limits) | **1** (#313) | Image *limits* are effectively unused |

> **Measurement caveat, stated once:** this is body-text presence, not code inspection. `rohit-jsfreaky`'s 17-entry
> portfolio single-handedly supplies most of the values-file/CLI counts; strip that one author and the field's
> template-API usage drops to ~3 entries. The `0` rows are the safe ones.

## 4. The dominant idiom, and why it's now a liability

The winning-shaped entries so far (`dunoil` ×9, `rohit-jsfreaky` ×17, `ferdiakhmadirawan44` ×8, `r0ebn` ×5) all ship the
same product in different skins:

> *"One <domain> file in → a customer email, a public page, a printed PDF and a social card out, from one theme and one
> set of shared components."*

Measured, not impressioned: **30 of 89 titles (34%)** carry that idiom explicitly (a `→`, "from one …", "one source",
"one theme" or "four outputs/formats"), **44 of 89 bodies (49%)** frame the product as one source → several outputs,
and **34 of 89 titles (38%)** contain the word "kit". It is a genuinely good answer to `Practical value` — and it is
now the **default**, so it scores ~0 on `Originality` no matter how well done. Two further patterns compound it:

- **Same-author portofolios.** ~30 builders × ~3 entries means the judges see *the same builder's same idea three
  times*. A distinctive single piece beats the fourth variant of your own kit.
- **Domain swapping.** Bali surf, Balinese water cooperative, satellite passes, repair café, vinyl drop, community
  theatre — same mechanism, different nouns. The judges will pattern-match this quickly.

**What the field does NOT do** (each is an unexploited lever, measured in §3):

| Unexploited | Evidence |
|---|---|
| **`formats`** — one template, several sizes from one set of values | **0 of 89**; only the official launch graphic does it |
| **`rules` that actually run** (`require.lint`, `require.core`, `links.domains`, `images.domains`) with `passed/failed/not-run` | **0 of 89** |
| **Slots/blocks** — a template a *team or an agent* fills, not just a developer | **0 of 89** |
| **`--require-template` / `template extract` / `--max-warnings 0`** — the "this artifact is verifiably template-driven" story | **0 of 89** |
| **`field.image` limits** (aspect, minWidth, accepts, maxCrop) | 1 of 89 |
| **`template()` itself** | 2 of 89 (+1 claiming five templates) |
| **Brand-parameterized template** (one template → N brands via `extendTheme`) | 9 use `extendTheme`, ~22 mention a brand — the official gallery is built *entirely* this way, so this is a **craft** gap, not a novelty gap |

**What the field already owns — do not sell these as novelty:** email-client previews (36 of 89), the CLI checker
(28), `validate()` (41), PDF+image+theme (64–69), typed custom elements (13). A README that leads with "I checked it in
Outlook" is describing 40% of the field.

## 5. Exemplars worth reading before ideating (deep reads, 2026-11-23)

| Entry | Why it's strong | Where it leaves room |
|---|---|---|
| **#333 VINYL DROP** (`dunoil`) | Strongest narrative in the field: a real failure mode ("the email says one thing, the wall sheet another, the sleeve a third"), 12 personalised preorder emails + 5-page printed invoice/stock sheet + drop page + 13 cover-art cards from **one drop file**; no Svg, no remote images (email-safe by construction); catalogue numbers can't disagree because they live in one file | Still the "one file → 4 outputs" idiom; no template fields/rules story; 13 cards from one template is the closest thing in the field to `formats` |
| **#304 Meridian animated email** (`ahmardchain`) | The only entry that solves a *hard medium* problem: an animated GIF hero whose **frame 1 is the complete design** so classic Outlook still looks finished, plus a still-PNG fallback, live text for everything that matters (images off), `.ics` + Google Calendar links, full-width buttons on phones | Single output; no template surface; the GIF (826 KB) is a delivery risk Gmail may clip |
| **#255 Onchain Wraped** (`onchaindc`) | Cleanest "same block, three placements" argument: one `defineTheme`, each story block written once and placed as `Section` in Email and Page and as a full-bleed `Document.Page` in the PDF, plus a `Canvas` share card with fitted text | The "for any wallet" framing implies a chain integration it doesn't have (sample data) — a judge may read it as a missed opportunity or as honesty |
| **#303 Foldline gift cards** (`YashM2704`) | The only entry that leads with **"five `template()`s, one set of typed fields"** and shows `prop.choice/number/text` with `pattern`+`maxLength`, `prop.date/link/list` — the deepest template use in the field | No `formats`, no rules, no values file; the gift-card domain is narrow |
| **#298 NEXORA report studio** (`Thanusha8095`) | Most "product" of the entries: five synchronized outputs, redaction, audience editions, export quality scorecard, email compatibility auditing — reads like a tool, not a demo | App-first, template-last; complexity is exactly what FAQ #23 says won't win |
| **#289 Meridian type foundry** (`Joystonm`) | The only **design-craft-first** entry: a landing page where the typeface is the content (animated typografy, weight demos, specimen gallery) — directly targets `Design quality` and `Originality` | Five outputs but the non-page ones are marketing sheets; template surface unused |
| **#256 Roll Call** (`memeshee`) | Best answer to `Practical value` at scale: 240 attendee badges from one CSV — print sheets, emails, pages, cards. A real back-office job | Bulk-data demos are hard to *show* in a README screenshot |
| **#245 smart-form** (`skymiller1509-blip`) | The only genuinely interactive concept: prompt → form, rendered as a Hyper Elements Page | Admits it's a mock (keyword rules, no LLM) — and it's the weakest use of the library in this list (`Page` + `Table` only) |

## 6. Head-to-head implications for idea-forge (hypotheses, not decisions)

1. **Don't ship a fourth "one file → 4 outputs" kit** unless the mechanism is new. That lane is owned by three
   portofolios with 30+ entries and better distribution.
2. **The cheapest originality in this field is mechanism, not domain.** The unclaimed mechanism stack is
   `formats` + `template()` with typed fields + **running** `rules` (`require.lint`/`require.core`, `links.domains`)
   + slots/blocks + `--require-template` in CI. No entry has more than one of those. It maps directly onto
   `Use of Hyper Elements` and onto the FAQ's "reusable / build upon it" — and unlike "client previews", nobody can
   say "everyone does that".
3. **`Design quality` is judged against the 30-template gallery**, which is editorial, restrained and brand-driven
   (Stripe/Apple/Nike/Spotify recreations set the ceiling). A loud "AI-generated" look loses to a quiet one.
4. **A single, superb piece beats a kit.** FAQ #23 says complexity doesn't win; the field is drowning in complexity.
5. **The judges can merge what they can place.** A brand-parameterized template in the gallery's own folder shape is
   the only artifact whose prize path (gallery inclusion) is already half-done.
6. **Whatever is chosen must survive the 6-day runway** (see `event.md`) — including README media, which is scored.
