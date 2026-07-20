# SingaPath — Build TODO

This checklist is derived from [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).
It is ordered so that factual accuracy and the deterministic rules engine land before AI narrative generation and UI polish.

## Foundation

- [x] Read the implementation plan and turn it into an execution checklist.
- [x] Create the Next.js App Router scaffold.
- [x] Move the implementation plan into `docs/`.
- [ ] Finish installing the planned app, AI, UI, PDF, and testing dependencies. (UI-adjacent deps in — shadcn/Base UI primitives, zustand, framer-motion, lucide-react, vitest; still missing `ai`/`@ai-sdk/google`, `react-hook-form` + `@hookform/resolvers`, `recharts`, `@react-pdf/renderer`.)
- [x] Configure shadcn primitives and project formatting/testing scripts. (`components.json` + `src/components/ui/*` via shadcn init; `.prettierrc.json`/`.prettierignore` and `pnpm run format`/`format:check`; `pnpm test` via Vitest.)

## Facts, schemas, and knowledge

- [x] Define strict Zod schemas for `Profile`, `PlaybookFacts`, and streamed narratives; `Profile` must include the seven canonical intake data points (home country, industry, entity purpose, founders/staff relocating, projected Singapore revenue, and VC/IP/award evidence).
- [x] Add provenance-aware knowledge JSON for entities, COMPASS, licences, tax, banking, and country context.
- [x] Verify all regulatory facts against live Singapore government sources. (ACRA S$315 incorporation fee, SFA S$195/yr Food Shop Licence, and the Indonesia/Vietnam DTA Article 11 10% interest caps were live re-verified this pass; EP salary floor, GST rate, corporate tax rate, COMPASS small-firm threshold, and EntrePass eligibility criteria were live-verified in the prior pass. Source set now also covers EDB (Development and Expansion Incentive) and a bank SME page (DBS foreign-owned-company account requirements), closing the two agency gaps from the ticket.)
- [x] Specifically verify and encode the COMPASS small-firm rule: firms with fewer than 25 PMET employees receive neutral C3/C4 scores. (Both the 25-PMET threshold and the neutral 10-point score are now structured `RegulatoryFact`s in `compass.json`, not just prose.)
- [x] Add the three demo profiles: Warung Digital, VietStack, and PayFlip. (`src/lib/mock-profiles/*.json`, schema-valid; still minimal — richer per-profile detail is expected once the rules engine and narratives land.)
- [x] Add a knowledge-validation script that fails facts missing source URLs or last-verified dates. (`scripts/validate-knowledge.ts`, run via `pnpm run validate-knowledge`; logs every bundled fact's id/source/lastVerified as a superset verification log — full profile-scoping is pending the mock-profiles ticket.)

## Deterministic rules engine

- [x] Implement entity recommendation. (`src/lib/rules/entity-recommender.ts`; also surfaces qualifying EntrePass evidence, since `PlaybookFactsSchema` has no separate EntrePass section.)
- [x] Implement COMPASS scoring, including benchmark, threshold-edge, and small-firm cases. (`src/lib/rules/compass-scorer.ts`. `isSmallFirm` = `foundersRelocating + staffRelocating < 25` — see the doc comment for why. C1/C2/C5/C6 use a fixed "qualifying benchmark" assumption since `Profile` captures no candidate salary/qualifications/shortage-occupation data; each criterion's `assessment` text states that assumption explicitly. `outcome` is `"not-applicable"` when no staff are relocating, since there's no Employment Pass applicant to score.)
- [x] Implement licence lookup for F&B, SaaS, fintech, retail, medical devices, and a generic fallback. (`src/lib/rules/license-lookup.ts`.)
- [x] Implement tax and incentive matching. (`src/lib/rules/tax-matcher.ts`. The EDB Development and Expansion Incentive is surfaced as an opportunity only for `regional-hq`/`rd-ip-hub` purposes, since the fact's own description scopes it to regional/global HQ activity; `industryOpportunities` is empty for every industry in the current knowledge base, a pre-existing content gap, not filled with invented facts.)
- [x] Implement banking roadmap, timeline builder, and risk assessor. (`src/lib/rules/{banking-advisor,timeline-builder,risk-assessor}.ts`. Timeline steps and risks only ever cite facts already surfaced elsewhere in that profile's `PlaybookFacts` — no new facts introduced. Both branch on the S$1,000,000 GST registration threshold and the fintech/MAS licensing flag; risk-assessor also raises a forward-looking "COMPASS diversity flag once you cross 25 PMETs" risk for small firms.)
- [x] Compose all modules through `buildPlaybookFacts(profile)`. (`src/lib/rules/index.ts`.)
- [x] Add Vitest golden tests for every rules module. (`tests/rules/*.test.ts`, one file per module, plus `build-playbook-facts.test.ts` (composition, all 3 mock profiles validate against `PlaybookFactsSchema` with non-empty facts in all 7 sections) and `fixtures.test.ts` (narrative fixtures validate against `NarrativesSchema` and introduce no numbers absent from computed facts). Run via `pnpm test`.)

## Product experience

- [x] Build the calm, institutional landing page with mock-profile cards. (`src/app/page.tsx`; loads Warung Digital/VietStack/PayFlip via `useProfileStore`; `/intake` and `/playbook` are stub routes pending their own tickets.)
- [ ] Build the five-step, validated intake wizard with profile persistence and mock-profile loading.
- [ ] Build the playbook dashboard that renders fact cards immediately.
- [ ] Build all seven fact sections: entity, visa/COMPASS, licences, tax, banking, timeline, and risk matrix.
- [ ] Add source footers, verification dates, status chips, agency tooltips, and the persistent legal disclaimer. (Shared components built in `src/components/playbook/` and demoed on the landing page; still need wiring into the actual playbook sections once those are built.)
- [ ] Add the COMPASS horizontal-bar chart and 3×3 risk grid.
- [ ] Add accessible motion and reduced-motion support.

## AI and resilience

- [x] Add the provider-agnostic AI configuration, defaulting to Gemini 3 Flash Preview.
- [x] Add `POST /api/generate` using a narratives-only schema and a constrained grounding prompt.
- [x] Merge streamed narratives into the already-rendered facts UI.
- [x] Add pre-generated per-profile fixtures and `?demo=1` mode.
- [x] Add automatic fixture fallback and the cached-demo banner when the API is unavailable.

## Finalization

- [ ] Add client-side PDF export that mirrors the facts-based playbook.
- [ ] Assess and, if time permits, add grounded what-if chat backed by rules-engine tools.
- [ ] Run knowledge validation, unit tests, lint, and production build.
- [ ] Manually test all three profiles, offline/demo fallback, PDF export, and a deployed URL.
- [ ] Fact-check the final demo against primary sources and prepare the backup recording/demo script.
