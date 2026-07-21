# Sprout

Sprout turns an ASEAN founder's five-minute company profile into a complete
Singapore market-entry playbook: entity structure, founder/staff visas (with
MOM COMPASS scoring), industry licensing, tax incentives, banking roadmap,
and a week-by-week timeline with a risk matrix.

Facts are computed client-side by a deterministic, source-cited rules engine
(pure TypeScript + bundled JSON — no LLM involvement). Narratives are
streamed separately from an AI model that can only explain those precomputed
facts, never invent one.

## Getting started

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
cp .env.example .env   # fill in the values below
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Append `?demo=1` to load
a mock profile with pre-generated narratives, no API key required.

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | for live narratives | free key from [aistudio.google.com](https://aistudio.google.com) |
| `GEMINI_MODEL` | no | defaults to `gemini-3-flash-preview` |
| `GROQ_API_KEY` | optional | fallback provider if Gemini errors/rate-limits |
| `GROQ_MODEL` | optional | required if `GROQ_API_KEY` is set |

Facts and demo mode work with no keys set at all — only the live, streamed
narrative text depends on them.

### Scripts

```bash
pnpm dev                 # dev server
pnpm build               # production build
pnpm test                # vitest (rules engine golden tests)
pnpm lint                # eslint
pnpm format              # prettier --write
pnpm validate-knowledge  # zod-validate every regulatory fact in src/lib/knowledge/*.json
```

## How Codex and GPT-5.6 were used

📋 My README has setup instructions and explains how Codex and GPT-5.6 were used.

- **Codex** was the primary coding tool for this build — it wrote and
  refactored most of the codebase, including the deterministic rules engine
  (`src/lib/rules/*`: entity recommendation, COMPASS scoring, license
  lookup, tax matching, banking advice, timeline building, risk assessment),
  the intake wizard and playbook UI components, and the Vitest golden tests
  and knowledge-validation script.
- **GPT-5.6** was used for content, not code: researching and drafting the
  source-cited regulatory facts in `src/lib/knowledge/*.json` (fees,
  thresholds, treaty rates, each carrying a `source.url` and
  `lastVerified` date), and writing the pre-generated demo narrative
  fixtures in `src/lib/fixtures/*.json` used by the three mock profiles.
- The **live in-app narratives** (what streams into the playbook when you
  run it with an API key set) come from **Gemini 3 Flash Preview**, with an
  optional Groq fallback — this is a separate, runtime choice from the
  tools used to build the project, made to keep the app itself
  provider-agnostic (see `src/lib/ai.ts`).

## Project structure

```
src/
  app/
    page.tsx                     # landing page
    intake/                      # 5-step profile wizard
    playbook/                    # results dashboard
    api/generate/                # streamed narratives (Gemini/Groq)
  components/
    intake/                      # wizard-shell + one step-*.tsx per step
    playbook/sections/           # entity, visa/COMPASS, licenses, tax,
                                  # banking, timeline, risk grid
    charts/compass-breakdown.tsx
    chat/ask-sprout.tsx          # grounded what-if chat
    pdf/playbook-pdf.tsx         # @react-pdf/renderer export
  lib/
    ai.ts                        # model config (single source of truth)
    schemas.ts                   # zod: Profile, PlaybookFacts, Narratives
    rules/                       # buildPlaybookFacts(profile) and friends
    knowledge/                   # source-cited regulatory fact JSON
    mock-profiles/               # Warung Digital, VietStack, PayFlip
    fixtures/                    # pre-generated narratives (demo mode)
  store/use-profile-store.ts     # zustand, persisted to sessionStorage
tests/rules/                     # vitest golden tests
scripts/validate-knowledge.ts
docs/IMPLEMENTATION_PLAN.md       # full architecture and design system
```

## Learn more

- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — full
  architecture, design tokens, and build phases.
- [`docs/TODO.md`](docs/TODO.md) — open work.
