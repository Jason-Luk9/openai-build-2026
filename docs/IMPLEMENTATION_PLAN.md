# SingaPath — Implementation Plan

## Context

SingaPath turns an ASEAN founder's 5-minute company profile into a complete Singapore market-entry playbook: entity structure, founder/staff visas (with COMPASS scoring), industry licensing, tax incentives, banking roadmap, and a week-by-week timeline with costs. This document turns the product spec and stack doc into an executable architecture with design and code conventions for the whole team.

Build starts from an empty repository (Node 20+ required for Next.js 15). Three decisions are locked:

- **AI provider: Gemini 2.5 Flash via Google AI Studio free tier** (`@ai-sdk/google`), with an optional Groq free-tier fallback. The Vercel AI SDK keeps the app provider-agnostic — all model naming lives in one config file, so switching providers later (e.g. to OpenAI) is a one-line change plus an env var.
- **Timeline: 2–3 days of build** — all 6 outputs plus a risk matrix, 3 polished mock profiles, COMPASS chart, PDF export.
- **"Ask SingaPath" chat: stretch goal** — built last, cut first if behind.

---

## Feedback on the idea (hackathon lens)

### Strengths — keep these front and center
1. **The direction flip is the smartest thing in the spec.** ASEAN→SG collapses the data problem to one stable, English-language, authoritative jurisdiction. Say this in the pitch — judges reward teams who scoped away their biggest risk.
2. **"Rules engine computes, LLM narrates" is the architecturally correct answer** for compliance-adjacent AI. When a judge asks "what about hallucinated regulations?", there's a real answer: the model never produces a number or requirement — it only explains precomputed facts.
3. **Demo mechanics are strong**: one-click mock profile → streaming playbook in ~30s.
4. **The COMPASS same-nationality diversity flag is the money moment** — a specific, counter-intuitive fact no generic chatbot surfaces. Script the demo around it.
5. Real, quantifiable market (50–60K incorporations/yr) with obvious adjacent monetization (corp-sec firms, banks, EDB partnerships).

### Risks and fixes
1. **⚠ The headline COMPASS example may be factually wrong.** The spec's demo shows a new company scoring 0 on diversity (C3) and 0 on local-hiring support (C4) → 20 points → rejected. But MOM applies **special scoring for small firms (fewer than 25 PMET employees): C3 and C4 are scored at a neutral 10 points each**. A brand-new startup would likely score ~40 and pass — the opposite of the demo. **Verify against MOM's COMPASS pages during the build and encode the small-firm rule in the scorer.** A Singapore-ecosystem judge will catch this instantly; getting it *right* (showing the small-firm neutral scoring, then the flag appearing as the team grows past 25 PMETs, or a below-benchmark salary failing C1) is more impressive and shows depth. This is the single most important fact-check in the project.
2. **Provider optics.** The event is OpenAI-branded while the build uses Gemini for the free tier. Mitigations: check the hackathon rules early — if OpenAI API usage is required or scored, the single model-config file makes the swap ~30 minutes (change one import, one model id, one env var) while keeping Gemini for dev. Either way, pitch the AI-native mechanics by name: schema-validated streaming structured output and function calling.
3. **"Why is this AI?" critique.** With all facts hardcoded, a skeptic asks whether an LLM is needed. Mitigations: (a) visible per-profile personalization in the narratives (country-specific DTA notes, industry-specific warnings); (b) the grounded chat with function calling — "what if I pay S$7K?" → live recompute — is the strongest counter; (c) frame it as "deterministic facts, AI translation into a founder-specific plan."
4. **Content authoring is the critical path, not code.** 6 outputs × 5 industries is a lot of JSON. Go **3 profiles deep rather than 5 shallow**: Warung Digital (F&B — richest licensing story), VietStack (SaaS — COMPASS + fundraising story), PayFlip (fintech — MAS wow factor). Show the other two as "more profiles" cards if time runs out.
5. **`mra-calculator` is a leftover** from the abandoned SG→ASEAN direction (MRA is a grant for Singapore companies going overseas). Drop it; fold grant matching (Startup SG Founder) into `tax-matcher`.
6. **`riskMatrix` is in the stack doc's schema but not in the 6 outputs.** Keep it as a small 7th section — it's cheap (derived from flags the rules engine already raises) and visually striking.
7. **Liability optics.** Add a persistent "Not legal advice" disclaimer and per-fact source links with "Last verified" date stamps. This converts the accuracy question into a trust feature.
8. **Free-tier rate limits are a real live-demo risk.** Fixture-backed demo mode (below) is mandatory, the Groq fallback is optional insurance, and record a backup screen capture the night before.
9. Minor: the stack doc's snippets are AI SDK v4-era (`ai/react`, `toDataStreamResponse`) and use the deprecated `shadcn-ui` CLI. Use AI SDK v5 (`@ai-sdk/react`, `streamObject`/`useObject`) and `npx shadcn@latest` — don't copy the snippets verbatim.

---

## Architecture

### The one structural change from the stack doc

The stack doc has the LLM generate the *entire* playbook object (facts + prose) via `generateObject`. Instead, **split facts from narratives**:

1. **Facts are computed client-side** by the pure-TypeScript rules engine (it's just functions + bundled JSON — no I/O). The playbook page renders every number, table, score, fee, and timeline **instantly**. Zero latency, zero hallucination risk, works offline.
2. **Narratives stream from one API route** (`POST /api/generate`) using `streamObject` with a narratives-only zod schema (per-section prose + callouts). The client merges them into the already-rendered fact cards as they arrive.

This guarantees the LLM can never alter a regulatory fact, makes the demo feel instant, halves the tokens the model must produce (important on free-tier quotas), and degrades gracefully if the API is down.

```
Landing (mock profile cards) ─┐
Intake wizard (5 steps)  ─────┤
                              ▼
                    Zustand profile store
                              ▼
              buildPlaybookFacts(profile)        ← pure TS + knowledge JSON, runs in browser
                              ▼
        Playbook page renders all fact cards immediately
                              ▼
        POST /api/generate { profile, facts }    ← edge route
              streamObject(gemini-2.5-flash, NarrativesSchema)
                              ▼
        useObject streams section narratives → fade into cards
                              ▼
        [stretch] POST /api/chat — useChat + tools that call the
        rules engine (recomputeCompass, lookupLicenses, estimateTax)
```

### AI layer
- One config file (`src/lib/ai.ts`) is the only place models are named: default `google('gemini-2.5-flash')`. Optional fallback chain on error/429: Groq (`@ai-sdk/groq`, free tier) → local fixtures. Swapping providers later touches only this file.
- System prompt: "You receive precomputed regulatory facts. Never state a number, fee, timeline, or requirement not present in the facts. Flag uncertainty explicitly." Low temperature (~0.3).
- **Demo mode**: pre-generated narrative fixtures per mock profile in `src/lib/fixtures/`. Triggered by `?demo=1` or automatically on API error, with an amber "cached demo narrative" banner. Facts always work offline since rules run client-side.
- Chat (stretch): `useChat` + 2–3 function tools that wrap rules-engine functions, so what-if answers are deterministic.
- Env vars: `GOOGLE_GENERATIVE_AI_API_KEY` (aistudio.google.com — free, no card), optional `GROQ_API_KEY`. Server-side only, never `NEXT_PUBLIC_`.

### No database, no auth
Knowledge base and mock profiles are bundled JSON (<150KB budget). Zustand store persists to sessionStorage so refresh doesn't lose the profile. Deploy: Vercel via git integration, preview URL on every push.

---

## Repo layout

```
repo root  (Next.js 15 scaffold, App Router, src dir, git init on day 1)
  src/
    app/
      page.tsx                     # landing: pitch line + mock profile cards
      intake/page.tsx              # 5-step wizard
      playbook/page.tsx            # results dashboard
      api/generate/route.ts        # streamObject narratives (edge runtime)
      api/chat/route.ts            # stretch: grounded chat with tools
    components/
      ui/                          # shadcn primitives
      intake/                      # wizard-shell.tsx + one step-*.tsx per step
      playbook/
        section-card.tsx status-chip.tsx sources-footer.tsx
        sections/                  # entity-card, visa-planner, license-table,
                                   # tax-card, banking-card, timeline-card, risk-grid
      charts/compass-breakdown.tsx
      pdf/playbook-pdf.tsx         # @react-pdf/renderer, client-side PDFDownloadLink
    lib/
      ai.ts                        # model config (single source — provider swap happens here)
      schemas.ts                   # zod: Profile, PlaybookFacts, Narratives
      format.ts                    # S$ money, en-SG numbers, week labels
      rules/
        index.ts                   # buildPlaybookFacts(profile): PlaybookFacts
        entity-recommender.ts compass-scorer.ts license-lookup.ts
        tax-matcher.ts banking-advisor.ts timeline-builder.ts risk-assessor.ts
      knowledge/                   # entities, compass, licenses, tax-incentives,
                                   # banking, country-context (.json)
      mock-profiles/               # warung-digital, vietstack, payflip (.json)
      fixtures/                    # pre-generated narratives per profile (demo mode)
    store/use-profile-store.ts
  tests/rules/*.test.ts            # vitest golden tests
  scripts/validate-knowledge.ts
  docs/IMPLEMENTATION_PLAN.md      # this document (lives at repo root until the
                                   # scaffold exists, then moves into docs/)
```

---

## Design conventions

**Overall feel: calm, confident, institutional — a product a bank would trust.** Light theme only (projector-friendly); no dark-mode investment.

- **Color**: zinc neutrals (page `zinc-50`, cards white with `zinc-200` borders). One accent: **teal-700** (buttons, active step, links). Semantic status colors are reserved and never used decoratively: emerald-600 = eligible/pass, amber-500 = flag/warning, red-600 = blocker/likely rejection, zinc-400 = N/A.
- **Type**: Geist Sans (ships with the scaffold). Page title 30px/semibold, section title 20/semibold, card title 16/semibold, body 14.5 `zinc-700`, captions 12.5 `zinc-500`. All money, scores, and dates use `tabular-nums`.
- **Section card anatomy** (uniform across all 7 outputs): tinted icon square (lucide) + title + agency badge(s) in the header; body; `SourcesFooter` — e.g. "Sources: MOM COMPASS · Last verified Jul 2026" with outbound links. Radius `rounded-xl`, `shadow-sm`, borders over shadows.
- **Status chips** always pair icon + text (✓ Eligible / ⚠ Flag / ✕ Blocker) — never color alone.
- **Charts**: restrained and consistent with the tokens — zinc grid lines, semantic colors only where they carry meaning, direct labels over legends where possible, no library-default palettes. The COMPASS chart is horizontal bars per criterion with a labeled 40-point threshold line and a "what closes the gap" annotation — the demo's hero visual. Risk matrix is a 3×3 tinted grid.
- **Intake wizard**: `max-w-xl` centered, one decision per step, progress bar, Enter advances, Framer Motion 24px slide between steps.
- **Playbook page**: `max-w-5xl`, sticky anchor-chip nav; full-width for license table and timeline, 2-col grid for smaller cards; skeleton shimmer in narrative slots while streaming (never a bare spinner).
- **Motion**: 200–250ms ease-out fades/slides, 80–100ms stagger on section reveal, no spring bounce; respect `prefers-reduced-motion` (opacity-only via `useReducedMotion`).
- **Copy voice**: sentence case everywhere; second person ("You'll need…"); every number carries a unit (S$, weeks, %); callouts start with a verb ("Raise the proposed salary…"); agency abbreviations get a tooltip with the full name. Persistent footer: "General information, not legal advice."

## Code & data conventions

- **TypeScript strict** (`strict`, `noUncheckedIndexedAccess`); no `any` — the stack doc's `setField` becomes a typed `setField<K extends keyof Profile>(key: K, value: Profile[K])`.
- **Zod is the single source of truth** in `src/lib/schemas.ts`: `ProfileSchema`, `PlaybookFactsSchema`, `NarrativesSchema`. Rules engine returns `PlaybookFacts`; the API route validates input with `ProfileSchema`; UI and PDF render from the same inferred types.
- **Rules modules are pure**: `(profile, knowledge) => SectionFacts`. No I/O, no `Date.now()` (timeline is relative weeks). Every module unit-tested.
- **Every knowledge fact carries provenance**:
  `{ "fee": 195, "feeUnit": "S$/year", "source": { "url": "…", "lastVerified": "2026-07" } }`
  `scripts/validate-knowledge.ts` zod-validates all knowledge JSON and fails on any entry missing `source.url`/`lastVerified`.
- **Scope the knowledge base to the demo verticals** — F&B, SaaS, retail, medical devices, fintech + a generic fallback — keyed by industry preset, not the full SSIC table.
- Naming: kebab-case filenames, PascalCase component exports, camelCase functions, camelCase JSON keys. Path alias `@/*`.
- Git: init at scaffold; main-only; commit prefixes `feat:` `fix:` `content:` (knowledge edits) `chore:`.
- Tooling: npm; default Next ESLint + Prettier, don't fight them; vitest for rules only (no component tests — hackathon).
- Fee/date rendering via `format.ts` helpers only (en-SG locale) — no inline `toLocaleString` scattered around.

---

## Build phases (2–3 days)

**Day 1 — foundation + content (content is the critical path; start it first)**
1. Scaffold: `npx create-next-app@latest` (TS, Tailwind, App Router, src-dir) — note: create-next-app needs a near-empty directory, so temporarily move this plan file aside and restore it (into `docs/`) after scaffolding. Then `npx shadcn@latest init` + add card/badge/button/progress/tabs/select/input/label/tooltip, install `ai @ai-sdk/google @ai-sdk/react zustand react-hook-form zod @hookform/resolvers framer-motion recharts @react-pdf/renderer lucide-react clsx vitest` (+ optional `@ai-sdk/groq`). `git init` and first Vercel deploy same day.
2. `schemas.ts` + knowledge JSON authoring for the 3 chosen profiles' verticals, **verifying facts against live gov pages — the COMPASS small-firm rule especially**. Author 3 mock profiles.
3. Rules engine modules + vitest golden tests (COMPASS scenarios including small-firm neutral scoring and threshold edges).

**Day 2 — product**
4. Landing page + intake wizard (react-hook-form + zod per step, Zustand store, `loadMockProfile`).
5. Playbook page rendering all fact sections from `buildPlaybookFacts`; then `/api/generate` + `useObject` streaming narratives into the cards; demo-mode fixtures + auto-fallback.
6. COMPASS chart, risk grid, motion polish, sources footers, disclaimer.

**Day 3 — polish + stretch**
7. PDF export (client-side `PDFDownloadLink` mirroring the fact sections).
8. Stretch: `/api/chat` with rules-engine tools; the "what if" demo moment.
9. Fact-check pass (checklist below), full demo dry-runs on the deployed URL, record backup video, write the demo script.

## Demo script (~3 min)

1. Landing: "3–6 months of confusion → a 5-minute playbook." (15s)
2. Click **VietStack** → wizard pre-filled, flip through two steps to prove the form is real → Generate. (30s)
3. Facts render instantly; narratives stream in — talk over entity recommendation + timeline/cost. (45s)
4. **Money moment**: COMPASS chart with the diversity criterion explained — "not because they're unqualified, because all three founders are Vietnamese" (with the correct small-firm nuance). Show the concrete fix. (45s)
5. If chat shipped: "What if we hire one Singaporean engineer first?" → tool call → score updates live. (30s)
6. Close on sources + last-verified stamps + PDF download. (15s)
Backup: `?demo=1` offline mode; screen recording on standby.

## Verification

- `npm run build` and `npx vitest run` clean; `scripts/validate-knowledge.ts` passes.
- Golden tests: compass-scorer (≥5 scenarios: small-firm neutral, sub-benchmark salary fail, pass case, threshold edge), entity-recommender (each entry purpose), license-lookup (each vertical), tax-matcher (revenue above/below GST threshold).
- Manual E2E per mock profile: intake → playbook; all 7 sections render; stream completes <30s; flags match expectations; PDF downloads.
- Kill network → playbook still shows facts and falls back to fixture narratives with the banner.
- Repeat one full E2E on the deployed Vercel URL.
- **Fact-check checklist** (verify against live pages during build): EP salary floor S$5,600 (S$6,200 financial services); COMPASS bands for C1–C4 **and the <25-PMET small-firm rule**; EntrePass qualifying paths; startup tax exemption 75% of first S$100K / 50% of next S$100K; GST threshold S$1M and 9% rate; SFA food shop licence S$195/yr; ACRA fees S$315 total; SG–Indonesia and SG–Vietnam DTA withholding rates.
