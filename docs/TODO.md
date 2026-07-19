# SingaPath — Build TODO

This checklist is derived from [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).
It is ordered so that factual accuracy and the deterministic rules engine land before AI narrative generation and UI polish.

## Foundation

- [x] Read the implementation plan and turn it into an execution checklist.
- [x] Create the Next.js App Router scaffold.
- [x] Move the implementation plan into `docs/`.
- [ ] Finish installing the planned app, AI, UI, PDF, and testing dependencies.
- [ ] Configure shadcn primitives and project formatting/testing scripts.

## Facts, schemas, and knowledge

- [x] Define strict Zod schemas for `Profile`, `PlaybookFacts`, and streamed narratives; `Profile` must include the seven canonical intake data points (home country, industry, entity purpose, founders/staff relocating, projected Singapore revenue, and VC/IP/award evidence).
- [x] Add provenance-aware knowledge JSON for entities, COMPASS, licences, tax, banking, and country context.
- [x] Verify all regulatory facts against live Singapore government sources. (ACRA S$315 incorporation fee, SFA S$195/yr Food Shop Licence, and the Indonesia/Vietnam DTA Article 11 10% interest caps were live re-verified this pass; EP salary floor, GST rate, corporate tax rate, COMPASS small-firm threshold, and EntrePass eligibility criteria were live-verified in the prior pass. Source set now also covers EDB (Development and Expansion Incentive) and a bank SME page (DBS foreign-owned-company account requirements), closing the two agency gaps from the ticket.)
- [x] Specifically verify and encode the COMPASS small-firm rule: firms with fewer than 25 PMET employees receive neutral C3/C4 scores. (Both the 25-PMET threshold and the neutral 10-point score are now structured `RegulatoryFact`s in `compass.json`, not just prose.)
- [ ] Add the three demo profiles: Warung Digital, VietStack, and PayFlip.
- [x] Add a knowledge-validation script that fails facts missing source URLs or last-verified dates. (`scripts/validate-knowledge.ts`, run via `pnpm run validate-knowledge`; logs every bundled fact's id/source/lastVerified as a superset verification log — full profile-scoping is pending the mock-profiles ticket.)

## Deterministic rules engine

- [ ] Implement entity recommendation.
- [ ] Implement COMPASS scoring, including benchmark, threshold-edge, and small-firm cases.
- [ ] Implement licence lookup for F&B, SaaS, fintech, retail, medical devices, and a generic fallback.
- [ ] Implement tax and incentive matching.
- [ ] Implement banking roadmap, timeline builder, and risk assessor.
- [ ] Compose all modules through `buildPlaybookFacts(profile)`.
- [ ] Add Vitest golden tests for every rules module.

## Product experience

- [ ] Build the calm, institutional landing page with mock-profile cards.
- [ ] Build the five-step, validated intake wizard with profile persistence and mock-profile loading.
- [ ] Build the playbook dashboard that renders fact cards immediately.
- [ ] Build all seven fact sections: entity, visa/COMPASS, licences, tax, banking, timeline, and risk matrix.
- [ ] Add source footers, verification dates, status chips, agency tooltips, and the persistent legal disclaimer.
- [ ] Add the COMPASS horizontal-bar chart and 3×3 risk grid.
- [ ] Add accessible motion and reduced-motion support.

## AI and resilience

- [ ] Add the provider-agnostic AI configuration, defaulting to Gemini 2.5 Flash.
- [ ] Add `POST /api/generate` using a narratives-only schema and a constrained grounding prompt.
- [ ] Merge streamed narratives into the already-rendered facts UI.
- [ ] Add pre-generated per-profile fixtures and `?demo=1` mode.
- [ ] Add automatic fixture fallback and the cached-demo banner when the API is unavailable.

## Finalization

- [ ] Add client-side PDF export that mirrors the facts-based playbook.
- [ ] Assess and, if time permits, add grounded what-if chat backed by rules-engine tools.
- [ ] Run knowledge validation, unit tests, lint, and production build.
- [ ] Manually test all three profiles, offline/demo fallback, PDF export, and a deployed URL.
- [ ] Fact-check the final demo against primary sources and prepare the backup recording/demo script.
