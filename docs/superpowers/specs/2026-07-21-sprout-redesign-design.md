# Sprout redesign (visual + rebrand) — design

Date: 2026-07-21
Status: approved by user, pending implementation plan

## Context

The product ships under the name SingaPath with a teal/sans-serif SaaS look
(`src/app/globals.css`, Geist fonts). The user supplied a self-contained HTML
mockup (`SingaPath - Standalone.html`, opened in the IDE) built as an
exported single-file bundle covering three screens — landing, intake wizard,
and playbook — with a distinct editorial/paper visual language: warm cream
background, serif headlines paired with a monospace data/label typeface,
rust-red accent, and boxy (near-unrounded) components. The mockup is a
design reference only; it still says "SingaPath" throughout, but the user
wants the live app renamed to **Sprout** as part of this work.

The mockup file isn't readable as plain markup (it's a self-extracting JS
bundle, not static HTML/CSS), so it was rendered and driven with a headless
browser (Playwright) to capture the landing, wizard-step-1, and
playbook-entity-section screens, and its embedded source was grepped for
exact hex colors and `font-family` declarations to recover the design
tokens with certainty rather than by eye.

Two decisions the user made explicit, both diverging from the minimal-churn
default:

- Rename goes beyond UI copy into internal file/identifiers (e.g.
  `ask-singapath.tsx` → `ask-sprout.tsx`), not just user-facing text.
- The PDF export (`@react-pdf/renderer`) gets reskinned to match, not left
  in the old style — this needs real font files registered via
  `Font.register`, since react-pdf can't consume `next/font`/Google Fonts
  CSS the way the web app does.

## Design tokens

Recovered from the mockup source (`grep -oE '#[0-9a-fA-F]{3,6}'` /
`font-family`) and re-verified against the rendered screenshots.

**Fonts** (Google Fonts, loaded via `next/font/google` in `layout.tsx`):

| Role | Font | Used for |
|---|---|---|
| Heading | Newsreader (serif) | H1/H2, wordmark, section titles |
| Body/UI | Public Sans (sans) | body copy, buttons, nav, form labels |
| Data/mono | IBM Plex Mono | fact values, step counters ("Step 1 of 5"), agency badges (MOM/ACRA/IRAS/MAS), sources footer |

**Colors** (light theme only — the app has no dark mode today, none added):

| Token | Hex | Role |
|---|---|---|
| `--background` | `#faf9f5` | page background (warm cream, was `#fafafa`) |
| `--foreground` | `#1c1b19` | primary text (near-black, was `#18181b`) |
| `--card` | `#ffffff` | card surfaces |
| `--card-foreground` | `#1c1b19` | text on cards |
| `--primary` | `#93362c` | rust-red accent — replaces teal `#0f766e` everywhere: links, active states, emphasis spans, focus rings |
| `--primary-foreground` | `#ffffff` | text on primary |
| `--secondary` | `#f2f0ea` | secondary surfaces (was `#f4f4f5`) |
| `--secondary-foreground` | `#3a3830` | |
| `--muted` | `#f2f0ea` | |
| `--muted-foreground` | `#8a8880` (light) / `#55524a` (darker body-adjacent muted) | |
| `--border` | `#e2ddd2` | warm border (was `#e4e4e7`) |
| `--input` | `#e2ddd2` | |
| `--ring` | `#93362c` | |
| `--destructive` | `#6f2a22` (dark rust-red for error text) with `#f3e7e3` tint background | replaces `#dc2626` |
| success (eligible) | `#2f6f4e` text / `#e8f1ea` or `#cfe4d6` tint bg | status chips |
| warning (to review) | `#93641b` text / `#e8dab0` or `#f5ecda` tint bg | status chips |
| callout accent | `#93362c` text / `#f3e7e3` tint bg | rust callout boxes in playbook sections |
| `--radius` | `0.25rem`–`0.375rem` | boxy corners, down from `0.75rem` |

`::selection` gets a matching rust-tinted swap (was teal-tinted).

## Component primitives (`src/components/ui/*`)

Reskin in place — no new primitives, no prop-API changes, so every
consuming page picks up the new look automatically:

- **Button**: solid near-black (`#1c1b19`) primary with white text, sharp-ish
  corners; outline/secondary variant becomes white bg + `--border` outline;
  drop the current rounded-full/pill button style.
- **Card**: white surface, `1px solid var(--border)`, minimal/no shadow
  (mockup cards are flat with a hairline border, not elevated).
- **Badge** (and `AgencyBadge`, `StatusChip` in `playbook/*`): mono type,
  tinted backgrounds per status (green/amber/rust per table above), boxy not
  pill-shaped, matching the mockup's `MOM` / `ACRA` / `IRAS` / `MAS` footer
  tags and the `✓ Eligible` / `⚠ 2 to review` chips.
- **Input / Select / Label**: bordered boxy fields; wizard radio options
  become full-width bordered "radio cards" (selected = rust border + tinted
  fill + filled dot, matching the wizard-step-1 screenshot) rather than the
  current compact radio-button-plus-label row.
- **Progress**: thin bar + mono step counter text ("Step 1 of 5" /
  "20% complete") on either side, replacing the current progress style.
- **Tabs → playbook section nav**: new pill-row pattern (not a generic
  `tabs.tsx` change, since nothing else uses `tabs.tsx` this way) — active
  section is a solid near-black pill with a status dot, inactive sections
  are outlined pills with a colored status dot (green = eligible, amber =
  to review), matching the playbook-entity screenshot exactly.

## Screen-level changes

**Landing** (`src/app/page.tsx`): rust "ASEAN → Singapore" eyebrow label
with a short rule, serif H1 with a rust-colored emphasis span (same copy,
just restyled — no content changes), body copy unchanged, black primary CTA
+ white/outline secondary CTA, mock-profile cards restyled to flat white
cards with rust "Load profile →" links, "How it works" section reuses the
restyled `SectionCard`.

**Intake wizard** (`src/app/intake/page.tsx`, `wizard-shell.tsx`,
`step-*.tsx`): rust eyebrow ("SPROUT INTAKE"), serif H1 ("Build your
Singapore entry plan."), mono step counter + thin progress bar under the
header, each step's options become the bordered radio-card pattern above.
No changes to validation, step order, or `react-hook-form` wiring.

**Playbook** (`src/app/playbook/page.tsx`, `section-card.tsx`,
`status-chip.tsx`, `agency-badge.tsx`, `sources-footer.tsx`,
`section-reveal.tsx`, `sections/*`): rust breadcrumb eyebrow ("YOUR
PLAYBOOK — {profile} · {country} · {industry}"), serif H1, summary chips
("✓ N eligible" / "⚠ N to review"), the new pill section-nav, each
`SectionCard` gets a mono-labeled "FACTS" box for the bullet facts (matching
the mockup's bordered fact list) and a rust callout block for the single
most important action item, mono `SourcesFooter`. No changes to what data is
shown or `buildPlaybookFacts` — this is styling of existing props only.

**Chat widget** (`ask-singapath.tsx` → `ask-sprout.tsx`): the mockup doesn't
include this screen, so it's restyled to match the rest of the system
(cream/white panel, black send button, rust accents on prompt chips) rather
than copied from a reference. Component renamed `AskSingaPath` →
`AskSprout`, its header copy "ASK SINGAPATH" → "ASK SPROUT".

## Rename to Sprout

Scope, per user decision: user-facing text **and** internal
files/identifiers that reference the old name — not a blanket repo-wide
rename of unrelated things (package name `openai-build-2026`, repo name,
etc. are untouched; this is a product rebrand, not a repo rename).

**Wordmark**: `Sprout`, single color (near-black `#1c1b19`), Newsreader
serif — no two-tone split (the mockup's `Singa`/`Path` split doesn't
translate to a non-compound word; user picked the single-color option over
forcing a `Spr`/`out` split or adding a new glyph/mark).

Confirmed occurrences to update (from repo grep for "singapath",
case-insensitive):

| File | Change |
|---|---|
| `src/app/layout.tsx` | `<title>`/description metadata: "SingaPath" → "Sprout" |
| `src/app/page.tsx` | header wordmark, any copy referencing the product name |
| `src/app/playbook/page.tsx` | breadcrumb / header references |
| `src/components/chat/ask-singapath.tsx` | renamed to `ask-sprout.tsx`; component `AskSingaPath` → `AskSprout`; update the one import site (`playbook/page.tsx`) |
| `src/components/intake/wizard-shell.tsx` | "SingaPath intake" eyebrow → "Sprout intake" |
| `src/store/use-profile-store.ts` | zustand persist key `'singapath-profile'` → `'sprout-profile'` (accepted: this invalidates any existing locally-persisted profile in a browser's localStorage — expected for a rebrand, not a bug) |
| `src/lib/ai.ts` | chat system prompt persona: "You are Ask SingaPath..." → "You are Ask Sprout..." |
| `docs/IMPLEMENTATION_PLAN.md`, `docs/TODO.md` | update product-name mentions for consistency (docs only, no behavior change) |

`SingaPath - Standalone.html` itself is the design reference and is left
untouched (still says SingaPath — it's the source mockup, not app code).

## PDF export reskin (`src/components/pdf/playbook-pdf.tsx`)

`@react-pdf/renderer` cannot use `next/font/google`; it needs font files
registered explicitly via `Font.register({ family, src })`. Register
Newsreader, Public Sans, and IBM Plex Mono from their Google Fonts static
TTF URLs (same three families as the web app, for visual consistency),
apply the same near-black/cream/rust palette and mono fact/source labels
used on the web playbook. No changes to what data the PDF renders — only
its `StyleSheet.create` definitions and font registration.

## Verification approach

- Dev server (`pnpm dev`) + a Playwright script driving the same
  screens captured from the mockup (landing, wizard step 1, playbook entity
  section, plus the chat widget open state) via headless Chrome, screenshots
  compared against the mockup renders already captured this session.
- `pnpm lint`, `pnpm test` (vitest) — confirms no regression in rules-engine
  logic, which this work doesn't touch.
- Generate one PDF (via the existing "Download PDF" action) and open/screenshot
  it to confirm font registration and colors render correctly — react-pdf
  font issues are silent (falls back to Helvetica) rather than throwing, so
  this needs an actual visual check, not just a build-passes check.

## Out of scope

- No dark mode (mockup and current app are both light-only).
- No copy/content changes beyond the product name — hero copy, wizard
  question text, playbook fact text, and all regulatory content are
  unchanged.
- No changes to `src/lib/rules/*`, `src/lib/schemas.ts`, or any data/logic
  layer — this is a styling + rename pass only.
- `package.json` `name` field and repo name are not part of the rebrand.
