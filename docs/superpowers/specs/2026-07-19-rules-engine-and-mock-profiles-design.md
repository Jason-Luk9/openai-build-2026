# Rules engine + mock profiles + narrative fixtures — design

Date: 2026-07-19
Status: approved by user, pending implementation plan

## Context

`docs/HANDOFF.md`'s next ticket asks for 3 validated mock profiles
(`warung-digital`, `vietstack`, `payflip`) plus pre-generated narrative
fixtures, each demonstrating a different product value (licensing/EntrePass,
COMPASS/fundraising, MAS/fintech compliance). Scoping the ticket surfaced a
blocker: two of its five acceptance criteria need `PlaybookFacts` (the output
of a deterministic rules engine described in `docs/IMPLEMENTATION_PLAN.md`),
but `src/lib/rules/*` does not exist yet. The user chose to build the rules
engine first (rather than hand-authoring `PlaybookFacts` fixtures or
narrowing the ticket to `Profile`-only), matching `docs/TODO.md`'s own
sequencing (rules engine is its own section, listed before "pre-generated
fixtures + `?demo=1` mode").

This spec covers both the rules engine and the mock-profiles/fixtures work
that depends on it, since they're one dependency chain for this ticket.

## Architecture

Follows the repo layout already locked in `docs/IMPLEMENTATION_PLAN.md`:

```
src/lib/rules/
  index.ts               # buildPlaybookFacts(profile): PlaybookFacts
  entity-recommender.ts
  compass-scorer.ts
  license-lookup.ts
  tax-matcher.ts
  banking-advisor.ts
  timeline-builder.ts
  risk-assessor.ts
src/lib/mock-profiles/
  warung-digital.json
  vietstack.json
  payflip.json
  index.ts                # typed map keyed by profile id, ProfileSchema-parsed at import
src/lib/fixtures/
  warung-digital.json
  vietstack.json
  payflip.json
tests/rules/*.test.ts      # vitest golden tests, one file per module + composition + fixtures
```

Every rules module is a pure function `(profile: Profile, knowledge: BundledKnowledge) => SectionFacts`
— no I/O, no `Date.now()` (timeline is relative weeks, per existing convention
in `IMPLEMENTATION_PLAN.md`). `buildPlaybookFacts` composes all seven into a
`PlaybookFacts` object matching `PlaybookFactsSchema` exactly.

## Key design decisions

### 1. COMPASS small-firm determination (`isSmallFirm`)

`isSmallFirm = (foundersRelocating + staffRelocating) < 25`.

Justification: this ticket only covers brand-new SG entities (every
`entityPurpose` in `entities.json` maps to freshly incorporating a private
company limited by shares) — there is no pre-existing local headcount to add
to the count. Relocating founders and staff are the entity's initial PMET
headcount: founders who relocate are typically directors/employees of the
new entity, so they count alongside relocating staff. `Profile` has no field
for headcount beyond these two, so this is the only data-grounded proxy
available without changing `ProfileSchema`.

### 2. COMPASS C1/C2/C5/C6 scoring

`compass.json` only has prose descriptions for C1 (salary), C2
(qualifications), C5 (skills bonus), C6 (strategic priorities bonus) — no
numeric point tables — and `ProfileSchema`'s 7 intake fields capture no
candidate salary, age, qualifications, or shortage-occupation status.

Decision: score these four criteria against a **fixed "qualifying
benchmark" assumption**, applied identically across all profiles:
- C1 (salary) = 20 — assumes the EP applicant meets the sector's salary floor
- C2 (qualifications) = 10 — assumes a recognised degree
- C5 (skills bonus) = 0 — assumes no Shortage Occupation List bonus
- C6 (SEP bonus) = 0 — assumes no Strategic Economic Priorities bonus

Every narrative/assessment string for these four criteria must explicitly
label this as a placeholder pending the applicant's actual salary and
qualifications — this is not a fabricated regulatory fact, it's a stated
modeling assumption. Combined with the real C3/C4 computation, a small-firm
profile scores 20+10+10+10+0+0 = 60, comfortably over the 40-point
`passThreshold` — matching `IMPLEMENTATION_PLAN.md`'s own correction that a
small new startup should plausibly *pass*, not fail.

Rejected alternative: extending `ProfileSchema` with candidate-level fields
(salary, age, qualification, shortage-occupation flag). More accurate, but
`ProfileSchema` is already merged on `main` and its 7 fields are wired to a
planned 5-step wizard in `IMPLEMENTATION_PLAN.md` — changing it is a wizard
redesign, out of scope for "build the rules engine + mock profiles."

### 3. Module-by-module logic

- **entity-recommender**: look up `entities.json` by `entityPurpose`; return
  its recommendation + facts. `alternatives: []` for all profiles — the
  knowledge base models only one entity type today (private company limited
  by shares), so there's nothing else to list as an alternative.
- **license-lookup**: look up `licenses.json` by `industry`; pass through
  items unchanged.
- **tax-matcher**: always cite the 4 universal `globalRules` facts (corporate
  tax rate, GST rate, startup tax exemption, GST registration threshold) as
  `regulatoryFacts`. Add a GST-threshold-crossed flag when
  `projectedSingaporeRevenue > 1_000_000`. Surface the EDB Development and
  Expansion Incentive as an `opportunities` entry — not a blanket fact —
  only when `entityPurpose` is `"regional-hq"` or `"rd-ip-hub"`, since the
  fact's own description scopes it to regional/global HQ activity.
  `industryOpportunities` in `tax-incentives.json` is empty for every
  industry today; this is a pre-existing content gap (not something this
  ticket invents facts to fill), so `opportunities` may legitimately be a
  short list driven only by the DEI check.
- **banking-advisor**: `commonRequirements` always apply; append
  `industryFlags[industry]` when non-empty (only `fintech` has entries
  today).
- **timeline-builder**: an ordered sequence of week-numbered steps, each
  citing a fact already surfaced elsewhere in that profile's
  `PlaybookFacts` (name reservation/incorporation → licence application →
  bank account opening → EntrePass/EP submission → GST registration, the
  last step only when the revenue threshold is crossed). Every step's
  `sourceReferences` must point at a `factId` that also appears in another
  section's `regulatoryFacts` for that same profile — this is the
  mechanical guard against timeline steps inventing new facts.
- **risk-assessor**: derives 2-4 risks from flags already raised elsewhere:
  foreign-owned-company account due-diligence delay (all profiles, citing
  `dbs-foreign-owned-company-account`); MAS licensing delay (fintech only,
  citing the fintech licence facts); a forward-looking "COMPASS flag once
  you cross 25 PMETs" risk for small-firm profiles (citing the small-firm
  threshold/neutral-score facts) — this is the natural home for the
  small-firm story as a *risk*, complementing the COMPASS section itself.

## The three mock profiles

| | `warung-digital` | `vietstack` | `payflip` |
|---|---|---|---|
| Story | Licensing + EntrePass | COMPASS/fundraising + small-firm nuance | MAS/fintech compliance |
| `homeCountry` | indonesia | vietnam | philippines |
| `industry` | fnb | saas | fintech |
| `entityPurpose` | local-operations | regional-hq | local-operations |
| `foundersRelocating` | 2 | 2 | 2 |
| `staffRelocating` | 3 | 8 | 12 |
| Total headcount (small-firm check) | 5 (small firm) | 10 (small firm — the money moment) | 14 (small firm, not emphasized in narrative) |
| `projectedSingaporeRevenue` | S$450,000 (below GST threshold) | S$1,200,000 (above GST threshold) | S$2,000,000 (above GST threshold, largest) |
| `entrePassEvidence` | `hasTrackRecord: true` (founded and grew a Jakarta food-delivery chain through to acquisition) | `hasVcBacking: true` (raised S$150,000 from a recognised regional VC fund) | `hasIp: true` (holds a Philippines-registered patent on a cross-border payment-routing method) |

Each profile exercises a distinct EntrePass qualifying path (track record,
VC backing, IP) and the tax-matcher's GST threshold logic is split across
below/above cases. `vietstack`'s `regional-hq` purpose is what makes it
eligible for the EDB DEI tax opportunity (decision #3 above).

## Fixture files and `?demo=1` contract

- `src/lib/mock-profiles/{warung-digital,vietstack,payflip}.json` — the
  `Profile` objects.
- `src/lib/mock-profiles/index.ts` — exports a typed map keyed by profile id
  (`"warung-digital" | "vietstack" | "payflip"`), each entry parsed through
  `ProfileSchema` at import time (same pattern as `bundledKnowledge`'s
  `.parse()` at import in `schemas.ts`).
- `src/lib/fixtures/{warung-digital,vietstack,payflip}.json` — hand-authored
  `Narratives` fixtures, one per profile, same id as the join key.
- The profile id string is the stable identifier for `?demo=1` loading (e.g.
  `?demo=1&profile=vietstack`). This mapping (ids ↔ filenames ↔ query-param
  contract) gets documented in `docs/TODO.md` and a short README/comment in
  `src/lib/mock-profiles/`, since `/api/generate` and the demo-mode UI don't
  exist yet to consume it but the contract needs to be fixed now so later
  work doesn't invent a different convention.

### Narrative fixture content

Since `/api/generate`'s LLM path doesn't exist yet, these 3 fixtures are
hand-written prose, not model-generated — one `NarrativeSection` per
dashboard section per profile (21 sections total), written *after* the
rules engine runs, by reading each profile's actual `PlaybookFacts` output
(not before, to avoid inventing numbers the engine doesn't actually
produce).

`vietstack`'s `visaCompass` narrative section explicitly states the neutral
10-point default on C3/C4 due to being under 25 PMET employees, names the
25-PMET threshold, and flags the forward-looking risk once the team crosses
it — the demo's "money moment" per `IMPLEMENTATION_PLAN.md`.

## Testing

- **Vitest golden tests** (`tests/rules/*.test.ts`, one file per module):
  - `compass-scorer`: small-firm-neutral case, non-small-firm case,
    pass-vs-likely-fail threshold edge.
  - `entity-recommender`: all 4 `entityPurpose` values.
  - `license-lookup`: all 6 industries including the `generic` fallback.
  - `tax-matcher`: revenue above/below the S$1M GST threshold; DEI
    opportunity gated to `regional-hq`/`rd-ip-hub`.
  - `banking-advisor`, `timeline-builder`, `risk-assessor`: one test per
    module covering their branching logic.
- **Composition test**: `buildPlaybookFacts` on all 3 mock profiles
  validates against `PlaybookFactsSchema`, and every one of the 7 sections
  has a non-empty facts/items/steps/risks array (the mechanical check for
  "meaningful facts across all seven sections").
- **Fixture-consistency test**: each of the 3 narrative fixtures validates
  against `NarrativesSchema`, and every number/fee/threshold mentioned in a
  fixture's prose traces back to a fact actually present in that profile's
  computed `PlaybookFacts` (the mechanical check for "do not introduce
  regulatory facts absent from the underlying facts").
- `pnpm exec tsc --noEmit`, `pnpm exec eslint .`, and
  `pnpm run validate-knowledge` stay green throughout.

## Acceptance criteria mapping

| Ticket acceptance criterion | Satisfied by |
|---|---|
| 3 mock profiles validate against `ProfileSchema` | `mock-profiles/index.ts`'s import-time `.parse()` |
| Meaningful facts across all 7 sections | Composition test |
| Fixtures validate against `NarrativesSchema`, no invented facts | Fixture-consistency test |
| Stable, documented filenames/ids for `?demo=1` | Fixture files and `?demo=1` contract section above, documented in `docs/TODO.md` |
| Small-firm nuance accurate in VietStack narrative | Narrative fixture content section above |
