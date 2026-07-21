# Sprout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the entire app (landing, intake wizard, playbook, chat widget, PDF export) into the warm-paper/serif/mono editorial design from `SingaPath - Standalone.html`, and rename the product from SingaPath to Sprout.

**Architecture:** Token-level reskin (colors, radius, fonts) in `globals.css`/`layout.tsx` cascades through the shadcn-style UI primitives automatically; page/feature components that currently hardcode Tailwind `teal-*`/`zinc-*` classes get hand-edited onto the semantic tokens (`bg-primary`, `text-foreground`, etc.) so the cascade actually reaches them. Separately, seven already-built-but-unwired playbook section components (`src/components/playbook/sections/*.tsx`) get connected to `playbook/page.tsx`, replacing its ad hoc inline rendering — this both fulfills the mockup's per-section card pattern and removes dead code, without touching the rules engine or schemas. No data/logic layer changes anywhere in this plan.

**Tech Stack:** Next.js App Router, Tailwind CSS v4 (`@theme inline` token mapping), `next/font/google`, `@react-pdf/renderer`, zustand, vitest.

## Global Constraints

- No changes to `src/lib/rules/*`, `src/lib/schemas.ts`, or any data/logic layer — every task here is styling, wiring of existing presentational components, or renaming.
- No new runtime dependencies. Fonts load via `next/font/google` (web) and `Font.register` with static Google Fonts TTF URLs (PDF) — no new npm packages.
- No dark mode — light theme only, matching both the current app and the mockup.
- Rename scope: user-facing text **and** the specific internal files/identifiers listed in Task 3's table — not a blanket repo/package rename.
- Every color/spacing value introduced must come from the token set defined in Task 1 — no new one-off hex values in page/component files after Task 1 lands.
- Run `pnpm lint` and `pnpm test` (`vitest run --passWithNoTests`) after every task; both must pass before moving to the next task.

---

### Task 1: Design tokens, radius scale, and fonts

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: CSS custom properties `--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--destructive`, `--destructive-foreground`, `--success`, `--success-tint`, `--warning`, `--warning-tint`, `--radius` (and the Tailwind-consumed `--radius-sm/md/lg/xl`, `--color-*`, `--font-sans/serif/mono` theme keys). Every later task's Tailwind classes (`bg-primary`, `text-success`, `font-serif`, `rounded-lg`, etc.) depend on these existing exactly as named here.

- [ ] **Step 1: Replace the token block in `globals.css`**

Replace the entire file content (lines 1–59) with:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@source "../../node_modules/streamdown/dist/*.js";

:root {
  --background: #faf9f5;
  --foreground: #1c1b19;
  --card: #ffffff;
  --card-foreground: #1c1b19;
  --primary: #93362c;
  --primary-foreground: #ffffff;
  --secondary: #f2f0ea;
  --secondary-foreground: #3a3830;
  --muted: #f2f0ea;
  --muted-foreground: #8a8880;
  --border: #e2ddd2;
  --input: #e2ddd2;
  --ring: #93362c;
  --destructive: #6f2a22;
  --destructive-foreground: #ffffff;
  --success: #2f6f4e;
  --success-tint: #e8f1ea;
  --warning: #93641b;
  --warning-tint: #f5ecda;
  --radius: 0.375rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-tint: var(--success-tint);
  --color-warning: var(--warning);
  --color-warning-tint: var(--warning-tint);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --font-sans: var(--font-public-sans), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-newsreader), ui-serif, Georgia, serif;
  --font-mono: var(--font-ibm-plex-mono), ui-monospace, monospace;
}

* {
  border-color: var(--border);
}

html {
  background: var(--background);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}

::selection {
  background: #f3e7e3;
  color: #6f2a22;
}
```

- [ ] **Step 2: Swap fonts in `layout.tsx`**

Replace lines 1–13 of `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
```

with:

```tsx
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Newsreader, Public_Sans } from 'next/font/google';
import './globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
});
```

Then update the `<html>` className (currently `` `${geistSans.variable} ${geistMono.variable} h-full antialiased` ``) to:

```tsx
      className={`${publicSans.variable} ${newsreader.variable} ${ibmPlexMono.variable} h-full antialiased`}
```

- [ ] **Step 3: Verify**

Run: `pnpm lint && pnpm test`
Expected: both pass (no code references `geistSans`/`geistMono` elsewhere — confirm with `grep -rn "geist" src` before this step; if any hits exist outside `layout.tsx`, note them but do not fix here, they're out of scope for this task).

Run: `pnpm dev` in the background, then in a second terminal:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/sprout-tokens-check.png --window-size=1440,900 http://localhost:3000
```
Expected: screenshot shows a cream (`#faf9f5`) page background — the rest of the landing page still looks like the old teal/zinc design at this point, since no component files have been touched yet. That's expected; this task only lands the tokens.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: swap design tokens and fonts for Sprout redesign"
```

---

### Task 2: UI primitive shape fixes

**Files:**
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/badge.tsx`

**Interfaces:**
- Consumes: `--radius-lg`, `--color-border`, `--color-foreground` from Task 1.
- Produces: no prop/API changes — `Card`, `Badge` keep their existing exports and props; only their default visual style changes, so every existing consumer (landing, playbook, agency badges) picks this up automatically.

**Context:** `button.tsx`, `input.tsx`, `select.tsx`, `progress.tsx`, `tooltip.tsx`, `label.tsx` already use only semantic token classes (`bg-primary`, `border-input`, `bg-muted`, etc.) and the `rounded-lg`/`rounded-md` scale now remapped in Task 1 — they need no edits. `card.tsx` uses `ring-1 ring-foreground/10` (a soft inset ring) where the mockup uses a flat 1px border; `badge.tsx` uses a fixed `rounded-4xl` pill shape where the mockup uses a boxy tag — both need a targeted edit.

- [ ] **Step 1: Flatten Card's border**

In `src/components/ui/card.tsx`, in the `Card` function's `className`, replace:

```
'group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
```

with:

```
'group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl border border-border bg-card py-(--card-spacing) text-sm text-card-foreground [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
```

(swap `ring-1 ring-foreground/10` for `border border-border`).

- [ ] **Step 2: Box the Badge shape**

In `src/components/ui/badge.tsx`, in `badgeVariants`, replace `rounded-4xl` with `rounded-md` in the base class string (the string starting `'group/badge inline-flex h-5 w-fit...'`).

- [ ] **Step 3: Verify**

Run: `pnpm lint && pnpm test`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/card.tsx src/components/ui/badge.tsx
git commit -m "style: flatten card border and box badge shape for Sprout redesign"
```

---

### Task 3: Rename SingaPath to Sprout

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/playbook/page.tsx`
- Rename: `src/components/chat/ask-singapath.tsx` → `src/components/chat/ask-sprout.tsx`
- Modify: `src/components/intake/wizard-shell.tsx`
- Modify: `src/store/use-profile-store.ts`
- Modify: `src/lib/ai.ts`
- Modify: `docs/IMPLEMENTATION_PLAN.md`, `docs/TODO.md`

**Interfaces:**
- Produces: component export renamed `AskSingapath` → `AskSprout` (file `ask-sprout.tsx`). Every later task that imports `AskSingapath` from `@/components/chat/ask-singapath` must instead import `AskSprout` from `@/components/chat/ask-sprout` — this is the only cross-file rename with a real import-site dependency.
- Note: this task runs on the *current* (pre-redesign) markup, since it's purely textual/identifier renaming and independent of the styling tasks. Later tasks that touch these same files (4, 5, 7, 8) will inherit "Sprout" copy already in place.

- [ ] **Step 1: Rename the chat component file and its identifiers**

```bash
git mv src/components/chat/ask-singapath.tsx src/components/chat/ask-sprout.tsx
```

In `src/components/chat/ask-sprout.tsx`, apply these replacements (all occurrences):
- `export function AskSingapath(` → `export function AskSprout(`
- `aria-label="Open Ask SingaPath chat"` → `aria-label="Open Ask Sprout chat"`
- `aria-labelledby="ask-singapath-title"` → `aria-labelledby="ask-sprout-title"`
- `id="ask-singapath-dialog"` → `id="ask-sprout-dialog"` (both occurrences: the `<section id=...>` and the two `aria-controls="ask-singapath-dialog"` attributes)
- `id="ask-singapath-title"` → `id="ask-sprout-title"`
- `Ask SingaPath` (the visible `<p>` label text) → `Ask Sprout`
- `aria-label="Close Ask SingaPath chat"` → `aria-label="Close Ask Sprout chat"`

- [ ] **Step 2: Update the one import site**

In `src/app/playbook/page.tsx`, replace:

```tsx
import { AskSingapath } from '@/components/chat/ask-singapath';
```

with:

```tsx
import { AskSprout } from '@/components/chat/ask-sprout';
```

and replace the usage `<AskSingapath profile={profile} />` with `<AskSprout profile={profile} />`.

- [ ] **Step 3: Update page metadata**

In `src/app/layout.tsx`, replace:

```tsx
export const metadata: Metadata = {
  title: 'SingaPath — Singapore market-entry playbook',
  description:
    'A source-backed Singapore market-entry playbook for ASEAN founders.',
};
```

with:

```tsx
export const metadata: Metadata = {
  title: 'Sprout — Singapore market-entry playbook',
  description:
    'A source-backed Singapore market-entry playbook for ASEAN founders.',
};
```

- [ ] **Step 4: Update the landing page wordmark and links**

In `src/app/page.tsx`, replace the wordmark:

```tsx
            Singa<span className="text-teal-700">Path</span>
```

with:

```tsx
            Sprout
```

(Task 4 restyles this further into the shared wordmark component — this step only fixes the text.)

- [ ] **Step 5: Update remaining copy references**

In `src/app/playbook/page.tsx`, replace both occurrences of `Back to SingaPath` with `Back to Sprout`.

In `src/components/intake/wizard-shell.tsx`, replace:

```tsx
          SingaPath intake
```

with:

```tsx
          Sprout intake
```

- [ ] **Step 6: Rename the persisted storage key**

In `src/store/use-profile-store.ts`, replace:

```ts
    {
      name: 'singapath-profile',
      storage: createJSONStorage(() => sessionStorage),
    },
```

with:

```ts
    {
      name: 'sprout-profile',
      storage: createJSONStorage(() => sessionStorage),
    },
```

- [ ] **Step 7: Rename the chat persona**

In `src/lib/ai.ts`, replace:

```ts
  return `You are Ask SingaPath, a grounded assistant for a Singapore market-entry playbook.
```

with:

```ts
  return `You are Ask Sprout, a grounded assistant for a Singapore market-entry playbook.
```

- [ ] **Step 8: Update docs**

In `docs/IMPLEMENTATION_PLAN.md` and `docs/TODO.md`, replace occurrences of `SingaPath` with `Sprout` in prose (product name mentions only — do not alter any technical content, code samples, or historical decision descriptions beyond the name swap).

- [ ] **Step 9: Verify no stray references remain in app code**

Run: `grep -rIn -i "singapath" src`
Expected: no output (empty). `SingaPath - Standalone.html` at the repo root is the design reference and intentionally excluded from this grep/from any edits.

Run: `pnpm lint && pnpm test`
Expected: both pass.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "rename: SingaPath -> Sprout across UI copy, metadata, and identifiers"
```

---

### Task 4: Landing page redesign

**Files:**
- Create: `src/components/layout/sprout-wordmark.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `SproutWordmark({ className?: string })` — a `Link` to `/` rendering the "Sprout" serif wordmark. Tasks 5 and 7 import and reuse this in the wizard and playbook page headers.
- Consumes: `--font-serif`/`font-serif` utility, `--primary`/`text-primary`, `--foreground`/`text-foreground` from Task 1.

- [ ] **Step 1: Create the shared wordmark component**

```tsx
// src/components/layout/sprout-wordmark.tsx
import Link from 'next/link';

import { cn } from '@/lib/utils';

export function SproutWordmark({ className }: { className?: string }) {
  return (
    <Link
      className={cn(
        'rounded-sm font-serif text-[19px] font-semibold tracking-[-0.02em] text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary',
        className,
      )}
      href="/"
    >
      Sprout
    </Link>
  );
}
```

- [ ] **Step 2: Rewrite the landing page header**

In `src/app/page.tsx`, replace the `<header>` block (the wordmark `<Link>` plus its containing markup from Task 3 Step 4) with:

```tsx
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-5 lg:px-8">
          <SproutWordmark />
          <nav aria-label="Primary" className="flex items-center gap-5">
            <a
              className="hidden rounded-sm text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:inline"
              href="#mock-profiles"
            >
              Mock profiles
            </a>
            <a
              className="hidden rounded-sm text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:inline"
              href="#how-it-works"
            >
              How it works
            </a>
            <Link
              className="inline-flex items-center gap-1 rounded-md text-[13px] font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
              href={profile ? '/playbook' : '/intake'}
            >
              {profile ? 'View current playbook' : 'Build your playbook'}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </nav>
        </div>
      </header>
```

Add the import: `import { SproutWordmark } from '@/components/layout/sprout-wordmark';`

- [ ] **Step 3: Restyle the hero**

Replace the hero `<section>` block:

```tsx
        <section className="border-b border-zinc-200 py-7 sm:py-9">
          <div className="max-w-[840px]">
            <p className="mb-3 flex items-center gap-2 text-[12.5px] font-medium tracking-[0.08em] text-teal-700 uppercase">
              <span className="h-px w-5 bg-teal-700" /> ASEAN → Singapore
            </p>
            <h1 className="max-w-[790px] text-[30px] leading-[1.08] font-semibold tracking-[-0.045em] text-zinc-950 sm:text-[42px]">
              {formatNumber(3)}–{formatNumber(6)} months of Singapore
              market-entry confusion.{' '}
              <span className="text-teal-700">
                One {formatNumber(5)}-minute playbook.
              </span>
            </h1>
            <p className="mt-4 max-w-[730px] text-[14.5px] leading-6 text-zinc-700 sm:text-[16px]">
              Entity, visas (COMPASS), licences, tax, banking, timeline — every
              fact source-backed and last-verified.
            </p>
            <p className="mt-3 max-w-[760px] text-[12.5px] leading-5 text-zinc-500">
              A deterministic rules engine computes every fact — AI only
              narrates. Every figure links to MOM, ACRA, IRAS or MAS.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                className="h-10 bg-teal-700 px-4 text-white hover:bg-teal-800 focus-visible:ring-teal-700/30"
                onClick={() => router.push(profile ? '/playbook' : '/intake')}
              >
                {profile ? 'View current playbook' : 'Build your playbook'}
                <ArrowRight aria-hidden="true" />
              </Button>
              <Button
                className="h-10 border-zinc-300 bg-white px-4 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100 focus-visible:ring-teal-700/30"
                onClick={() => handleLoadProfile('vietstack')}
                variant="outline"
              >
                See a sample playbook
              </Button>
            </div>
          </div>
        </section>
```

with:

```tsx
        <section className="border-b border-border py-7 sm:py-9">
          <div className="max-w-[840px]">
            <p className="mb-3 flex items-center gap-2 font-mono text-[12.5px] font-medium tracking-[0.08em] text-primary uppercase">
              <span className="h-px w-5 bg-primary" /> ASEAN → Singapore
            </p>
            <h1 className="max-w-[790px] font-serif text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-foreground sm:text-[44px]">
              {formatNumber(3)}–{formatNumber(6)} months of Singapore
              market-entry confusion.{' '}
              <span className="text-primary">
                One {formatNumber(5)}-minute playbook.
              </span>
            </h1>
            <p className="mt-4 max-w-[730px] text-[14.5px] leading-6 text-foreground sm:text-[16px]">
              Entity, visas (COMPASS), licences, tax, banking, timeline — every
              fact source-backed and last-verified.
            </p>
            <p className="mt-3 max-w-[760px] text-[12.5px] leading-5 text-muted-foreground">
              A deterministic rules engine computes every fact — AI only
              narrates. Every figure links to MOM, ACRA, IRAS or MAS.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                className="h-10 bg-foreground px-4 text-background hover:bg-foreground/90"
                onClick={() => router.push(profile ? '/playbook' : '/intake')}
              >
                {profile ? 'View current playbook' : 'Build your playbook'}
                <ArrowRight aria-hidden="true" />
              </Button>
              <Button
                className="h-10 border-border bg-card px-4 text-foreground hover:bg-muted"
                onClick={() => handleLoadProfile('vietstack')}
                variant="outline"
              >
                See a sample playbook
              </Button>
            </div>
          </div>
        </section>
```

- [ ] **Step 4: Restyle the mock-profile cards**

Replace the `mock-profiles` `<section>` block's inner classes — in the same section, apply these string replacements:
- `border-zinc-200 bg-white p-4 shadow-sm transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-zinc-300` → `border-border bg-card p-4 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/30`
- `text-base font-semibold tracking-[-0.015em] text-zinc-950` → `font-serif text-base font-semibold tracking-[-0.01em] text-foreground`
- `mt-1 text-[12.5px] text-zinc-500` → `mt-1 font-mono text-[12.5px] text-muted-foreground`
- `mt-4 min-h-10 text-[14.5px] leading-5 text-zinc-700` → `mt-4 min-h-10 text-[14.5px] leading-5 text-foreground`
- `mt-4 inline-flex items-center gap-1 rounded-md text-[13px] font-semibold text-teal-700 transition-colors hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-700` → `mt-4 inline-flex items-center gap-1 rounded-md text-[13px] font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary`
- `mt-2 flex items-center justify-between gap-4` block's `<p>`: `text-[12.5px] font-medium text-zinc-500` → `font-mono text-[12.5px] font-medium text-muted-foreground`
- the "or start with your own company" `<Link>`: `text-[12.5px] font-medium text-teal-700 underline decoration-teal-300 underline-offset-4 hover:text-teal-800 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700` → `text-[12.5px] font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:text-primary/80 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`
- `Building2` icon classes: `mt-0.5 size-4 text-zinc-400 transition-colors duration-200 group-hover:text-teal-700` → `mt-0.5 size-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary`

- [ ] **Step 5: Restyle the footer**

Replace:

```tsx
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-[12.5px] text-zinc-500 lg:px-8">
```

with:

```tsx
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-5 font-mono text-[12.5px] text-muted-foreground lg:px-8">
```

Also replace the outer page wrapper class `min-h-screen flex-col bg-zinc-50 text-zinc-950` with `min-h-screen flex-col bg-background text-foreground`.

- [ ] **Step 6: Verify**

Run: `pnpm lint && pnpm test`
Expected: both pass. `grep -n "teal-\|zinc-" src/app/page.tsx` should return no matches.

Run dev server + screenshot:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/sprout-landing.png --window-size=1440,1200 http://localhost:3000
```
Expected: cream background, serif "Sprout" wordmark, serif hero headline with rust emphasis span, black primary button, mono ASEAN→Singapore eyebrow.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/sprout-wordmark.tsx src/app/page.tsx
git commit -m "feat: redesign landing page with Sprout paper/editorial theme"
```

---

### Task 5: Intake wizard redesign

**Files:**
- Modify: `src/components/intake/wizard-shell.tsx`
- Modify: `src/components/intake/step-home-country.tsx`
- Modify: `src/components/intake/step-industry.tsx`
- Modify: `src/components/intake/step-entity-purpose.tsx`
- Modify: `src/components/intake/step-team-revenue.tsx`
- Modify: `src/components/intake/step-entrepass-evidence.tsx`

**Interfaces:**
- Consumes: `SproutWordmark` from Task 4.
- Produces: no prop/type changes to any step component — every `Step*` component keeps its existing `{ draft, onBack?, onValid, onClearDetail? }` signature; only JSX class strings change.

- [ ] **Step 1: Restyle `wizard-shell.tsx` — header and shell chrome**

Replace the `<main>` opening through the progress block:

```tsx
    <main className="min-h-screen bg-zinc-50 px-6 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-[12.5px] font-medium tracking-[0.08em] text-teal-700 uppercase">
          Sprout intake
        </p>
        <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-zinc-950">
          Build your Singapore entry plan.
        </h1>
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between text-[12.5px] font-medium text-zinc-500">
            <span>
              Step {step} of {stepCount}
            </span>
            <span className="tabular-nums">{step * 20}% complete</span>
          </div>
          <Progress
            aria-label={`Step ${step} of ${stepCount}`}
            className="mt-3"
            value={step * 20}
          />
          {submitError ? (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}
```

with:

```tsx
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 lg:px-8">
          <SproutWordmark />
          <Link
            className="text-[13px] font-medium text-muted-foreground underline decoration-border underline-offset-4 hover:text-primary"
            href="/"
          >
            Exit to landing
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-xl px-6 py-10 sm:py-16">
        <p className="font-mono text-[12.5px] font-medium tracking-[0.08em] text-primary uppercase">
          Sprout intake
        </p>
        <h1 className="mt-3 font-serif text-[32px] font-semibold tracking-[-0.02em] text-foreground">
          Build your Singapore entry plan.
        </h1>
        <div className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-7">
          <div className="flex items-center justify-between font-mono text-[12.5px] font-medium text-muted-foreground">
            <span>
              Step {step} of {stepCount}
            </span>
            <span className="tabular-nums">{step * 20}% complete</span>
          </div>
          <Progress
            aria-label={`Step ${step} of ${stepCount}`}
            className="mt-3"
            value={step * 20}
          />
          {submitError ? (
            <p
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}
```

Then near the end of the file, replace:

```tsx
        <p className="mt-5 text-center text-[12.5px] text-zinc-500">
          General information, not legal advice.
        </p>
      </div>
    </main>
```

with:

```tsx
        <p className="mt-5 text-center text-[12.5px] text-muted-foreground">
          General information, not legal advice.
        </p>
      </div>
      </div>
    </main>
```

(the extra closing `</div>` matches the new wrapping `<div className="mx-auto w-full max-w-xl px-6 py-10 sm:py-16">` opened above — the original file only had one wrapper div at this nesting level, this task adds the header/content split so there are now two divs to close before `</main>`).

Add imports: `import Link from 'next/link';` and `import { SproutWordmark } from '@/components/layout/sprout-wordmark';`

- [ ] **Step 2: Restyle `step-home-country.tsx`**

Replace:

```tsx
        <legend className="text-[20px] font-semibold tracking-[-0.025em] text-zinc-950">
          Where is your business based today?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-zinc-700">
          Choose your ASEAN home country.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {countries.map(([value, label]) => (
            <label className="group relative cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                type="radio"
                value={value}
                {...register('homeCountry')}
              />
              <span className="flex min-h-12 items-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors peer-checked:border-teal-700 peer-checked:bg-teal-50 peer-checked:text-teal-800 group-focus-within:outline-2 group-focus-within:outline-offset-3 group-focus-within:outline-teal-700">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.homeCountry && (
          <p className="mt-3 text-[12.5px] text-red-600" role="alert">
            {errors.homeCountry.message}
          </p>
        )}
      </fieldset>
      <div className="mt-8 flex justify-end">
        <Button
          className="h-10 bg-teal-700 px-4 text-white hover:bg-teal-800"
          type="submit"
        >
          Continue
        </Button>
      </div>
```

with:

```tsx
        <legend className="font-serif text-[22px] font-semibold tracking-[-0.01em] text-foreground">
          Where is your business based today?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-foreground">
          Choose your ASEAN home country.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {countries.map(([value, label]) => (
            <label className="group relative cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                type="radio"
                value={value}
                {...register('homeCountry')}
              />
              <span className="flex min-h-12 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary group-focus-within:outline-2 group-focus-within:outline-offset-3 group-focus-within:outline-primary">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.homeCountry && (
          <p className="mt-3 text-[12.5px] text-destructive" role="alert">
            {errors.homeCountry.message}
          </p>
        )}
      </fieldset>
      <div className="mt-8 flex justify-end">
        <Button
          className="h-10 bg-foreground px-4 text-background hover:bg-foreground/90"
          type="submit"
        >
          Continue
        </Button>
      </div>
```

- [ ] **Step 3: Restyle `step-industry.tsx`**

Replace:

```tsx
        <legend className="text-[20px] font-semibold tracking-[-0.025em] text-zinc-950">
          What best describes your business?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-zinc-700">
          Choose the industry closest to your main Singapore activity.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {industries.map(([value, label]) => (
            <label className="group relative cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                type="radio"
                value={value}
                {...register('industry')}
              />
              <span className="flex min-h-12 items-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors peer-checked:border-teal-700 peer-checked:bg-teal-50 peer-checked:text-teal-800 group-focus-within:outline-2 group-focus-within:outline-offset-3 group-focus-within:outline-teal-700">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.industry && (
          <p className="mt-3 text-[12.5px] text-red-600" role="alert">
            {errors.industry.message}
          </p>
        )}
      </fieldset>
      <div className="mt-8 flex justify-between">
        <Button onClick={onBack} type="button" variant="outline">
          Back
        </Button>
        <Button
          className="h-10 bg-teal-700 px-4 text-white hover:bg-teal-800"
          type="submit"
        >
          Continue
        </Button>
      </div>
```

with:

```tsx
        <legend className="font-serif text-[22px] font-semibold tracking-[-0.01em] text-foreground">
          What best describes your business?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-foreground">
          Choose the industry closest to your main Singapore activity.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {industries.map(([value, label]) => (
            <label className="group relative cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                type="radio"
                value={value}
                {...register('industry')}
              />
              <span className="flex min-h-12 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary group-focus-within:outline-2 group-focus-within:outline-offset-3 group-focus-within:outline-primary">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.industry && (
          <p className="mt-3 text-[12.5px] text-destructive" role="alert">
            {errors.industry.message}
          </p>
        )}
      </fieldset>
      <div className="mt-8 flex justify-between">
        <Button
          className="border-border bg-card text-foreground hover:bg-muted"
          onClick={onBack}
          type="button"
          variant="outline"
        >
          Back
        </Button>
        <Button
          className="h-10 bg-foreground px-4 text-background hover:bg-foreground/90"
          type="submit"
        >
          Continue
        </Button>
      </div>
```

(this same `Back`-button replacement — adding the `className="border-border bg-card text-foreground hover:bg-muted"` line — applies identically in every remaining step file's `Back` button below.)

- [ ] **Step 4: Restyle `step-entity-purpose.tsx`**

Replace:

```tsx
        <legend className="text-[20px] font-semibold tracking-[-0.025em] text-zinc-950">
          What will your Singapore entity do?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-zinc-700">
          Choose its primary purpose.
        </p>
        <div className="mt-6 grid gap-3">
          {purposes.map(([value, label]) => (
            <label className="group relative cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                type="radio"
                value={value}
                {...register('entityPurpose')}
              />
              <span className="flex min-h-12 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors peer-checked:border-teal-700 peer-checked:bg-teal-50 peer-checked:text-teal-800 group-focus-within:outline-2 group-focus-within:outline-offset-3 group-focus-within:outline-teal-700">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.entityPurpose && (
          <p className="mt-3 text-[12.5px] text-red-600" role="alert">
            {errors.entityPurpose.message}
          </p>
        )}
      </fieldset>
      <div className="mt-8 flex justify-between">
        <Button onClick={onBack} type="button" variant="outline">
          Back
        </Button>
        <Button
          className="h-10 bg-teal-700 px-4 text-white hover:bg-teal-800"
          type="submit"
        >
          Continue
        </Button>
      </div>
```

with:

```tsx
        <legend className="font-serif text-[22px] font-semibold tracking-[-0.01em] text-foreground">
          What will your Singapore entity do?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-foreground">
          Choose its primary purpose.
        </p>
        <div className="mt-6 grid gap-3">
          {purposes.map(([value, label]) => (
            <label className="group relative cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                type="radio"
                value={value}
                {...register('entityPurpose')}
              />
              <span className="flex min-h-12 items-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary group-focus-within:outline-2 group-focus-within:outline-offset-3 group-focus-within:outline-primary">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.entityPurpose && (
          <p className="mt-3 text-[12.5px] text-destructive" role="alert">
            {errors.entityPurpose.message}
          </p>
        )}
      </fieldset>
      <div className="mt-8 flex justify-between">
        <Button
          className="border-border bg-card text-foreground hover:bg-muted"
          onClick={onBack}
          type="button"
          variant="outline"
        >
          Back
        </Button>
        <Button
          className="h-10 bg-foreground px-4 text-background hover:bg-foreground/90"
          type="submit"
        >
          Continue
        </Button>
      </div>
```

- [ ] **Step 5: Restyle `step-team-revenue.tsx`**

Replace the legend/description and the `fieldClass` constant:

```tsx
const fieldClass =
  'mt-2 h-10 border-zinc-300 bg-white focus-visible:border-teal-700 focus-visible:ring-teal-700/25';
```

with:

```tsx
const fieldClass =
  'mt-2 h-10 border-border bg-card focus-visible:border-primary focus-visible:ring-primary/25';
```

Replace:

```tsx
        <legend className="text-[20px] font-semibold tracking-[-0.025em] text-zinc-950">
          Who is moving, and what will you earn?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-zinc-700">
```

with:

```tsx
        <legend className="font-serif text-[22px] font-semibold tracking-[-0.01em] text-foreground">
          Who is moving, and what will you earn?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-foreground">
```

Replace every `text-sm font-medium text-zinc-800` (three occurrences: "Founders relocating" label, "Staff relocating" label, "Projected Singapore revenue" label) with `text-sm font-medium text-foreground`.

Replace every `text-[12.5px] text-red-600` (three error `<p>` occurrences) with `text-[12.5px] text-destructive`.

Replace `text-[12.5px] font-normal text-zinc-500` (the "For example, ..." helper text) with `font-mono text-[12.5px] font-normal text-muted-foreground`.

On the `Back` button, add `className="border-border bg-card text-foreground hover:bg-muted"` (it currently has no `className`). On the submit `Button`, replace its `className="h-10 bg-teal-700 px-4 text-white hover:bg-teal-800"` with `className="h-10 bg-foreground px-4 text-background hover:bg-foreground/90"`.

- [ ] **Step 6: Restyle `step-entrepass-evidence.tsx`**

Replace:

```tsx
        <legend className="text-[20px] font-semibold tracking-[-0.025em] text-zinc-950">
          What supports your EntrePass eligibility?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-zinc-700">
```

with:

```tsx
        <legend className="font-serif text-[22px] font-semibold tracking-[-0.01em] text-foreground">
          What supports your EntrePass eligibility?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-foreground">
```

Replace the per-item card wrapper `rounded-xl border border-zinc-200 bg-white p-4` with `rounded-xl border border-border bg-card p-4`.

Replace `text-sm font-semibold text-zinc-900` with `text-sm font-semibold text-foreground`, and `mt-1 text-sm text-zinc-700` with `mt-1 text-sm text-foreground`.

Replace both Yes/No pill spans' class (identical string, two occurrences):

```
'inline-flex rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 peer-checked:border-teal-700 peer-checked:bg-teal-50 peer-checked:text-teal-800 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-teal-700'
```

with:

```
'inline-flex rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-primary'
```

Replace both error `<p>` classes `text-[12.5px] text-red-600` with `text-[12.5px] text-destructive` (choice error and detail error).

Replace the "Supporting details" label class `mt-4 block text-sm font-medium text-zinc-800` with `mt-4 block text-sm font-medium text-foreground`, and the `<textarea>` class:

```
'mt-2 min-h-24 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:border-teal-700 focus-visible:ring-3 focus-visible:ring-teal-700/25'
```

with:

```
'mt-2 min-h-24 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25'
```

Replace `mt-1.5 block text-[12.5px] font-normal text-zinc-500` with `mt-1.5 block font-mono text-[12.5px] font-normal text-muted-foreground`.

On the `Back` button, add `className="border-border bg-card text-foreground hover:bg-muted"` (it currently has no `className`). On the submit `Button` (labelled "Generate playbook"), replace its `className="h-10 bg-teal-700 px-4 text-white hover:bg-teal-800"` with `className="h-10 bg-foreground px-4 text-background hover:bg-foreground/90"`.

- [ ] **Step 7: Verify**

Run: `pnpm lint && pnpm test`
Expected: both pass. `grep -rn "teal-\|zinc-\|red-600\|red-200" src/components/intake` should return no matches.

Run dev server + screenshot each step (click through via the same Playwright-driving technique used to review the mockup, or manually): confirm serif question titles, boxy rust-highlighted radio cards on selection, mono step counter, black Continue button.

- [ ] **Step 8: Commit**

```bash
git add src/components/intake
git commit -m "feat: redesign intake wizard with Sprout paper/editorial theme"
```

---

### Task 6: Playbook status derivation (new logic, TDD)

**Files:**
- Create: `src/lib/playbook-status.ts`
- Test: `tests/lib/playbook-status.test.ts`

**Interfaces:**
- Consumes: `PlaybookFacts` from `@/lib/schemas`, `Status` type from `@/components/playbook/status-chip`.
- Produces: `type SectionKey = 'entity' | 'visaCompass' | 'licenses' | 'taxIncentives' | 'banking' | 'timeline' | 'riskMatrix'`, `getSectionStatus(key: SectionKey, facts: PlaybookFacts): Status`, `countSectionStatuses(facts: PlaybookFacts): { eligible: number; toReview: number }`. Task 7 imports all three.

This is the one piece of genuinely new logic in this plan (a pure presentational derivation, not a rules-engine change) — it gets a real TDD cycle.

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/playbook-status.test.ts
import { describe, expect, it } from 'vitest';

import { buildPlaybookFacts } from '@/lib/rules';
import { mockProfiles } from '@/lib/mock-profiles';
import {
  countSectionStatuses,
  getSectionStatus,
} from '@/lib/playbook-status';

describe('getSectionStatus', () => {
  it('marks entity, taxIncentives, banking, and timeline as always eligible', () => {
    const facts = buildPlaybookFacts(mockProfiles.vietstack);
    expect(getSectionStatus('entity', facts)).toBe('eligible');
    expect(getSectionStatus('taxIncentives', facts)).toBe('eligible');
    expect(getSectionStatus('banking', facts)).toBe('eligible');
    expect(getSectionStatus('timeline', facts)).toBe('eligible');
  });

  it('maps visaCompass outcome to a status', () => {
    const facts = buildPlaybookFacts(mockProfiles.vietstack);
    const expected =
      facts.visaCompass.outcome === 'pass'
        ? 'eligible'
        : facts.visaCompass.outcome === 'likely-fail'
          ? 'blocker'
          : 'not-applicable';
    expect(getSectionStatus('visaCompass', facts)).toBe(expected);
  });

  it('flags licenses when any item needs review', () => {
    const facts = buildPlaybookFacts(mockProfiles.vietstack);
    const expected = facts.licenses.items.some(
      (item) => item.status === 'review-needed',
    )
      ? 'flag'
      : 'eligible';
    expect(getSectionStatus('licenses', facts)).toBe(expected);
  });

  it('flags riskMatrix when any risk has high impact', () => {
    const facts = buildPlaybookFacts(mockProfiles['warung-digital']);
    const expected = facts.riskMatrix.risks.some(
      (risk) => risk.impact === 'high',
    )
      ? 'flag'
      : 'eligible';
    expect(getSectionStatus('riskMatrix', facts)).toBe(expected);
  });
});

describe('countSectionStatuses', () => {
  it('counts eligible and to-review sections across all seven keys', () => {
    const facts = buildPlaybookFacts(mockProfiles.payflip);
    const { eligible, toReview } = countSectionStatuses(facts);
    expect(eligible + toReview).toBeLessThanOrEqual(7);
    expect(eligible).toBeGreaterThanOrEqual(0);
    expect(toReview).toBeGreaterThanOrEqual(0);
  });
});
```

`mockProfiles` is exported from `src/lib/mock-profiles/index.ts` as `{ 'warung-digital': Profile; vietstack: Profile; payflip: Profile }` (`MockProfileId = keyof typeof mockProfiles`) — the bracket access `mockProfiles['warung-digital']` above is required since that key isn't a valid bare identifier; `mockProfiles.vietstack` and `mockProfiles.payflip` are correct as plain property access.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- playbook-status`
Expected: FAIL with a module-not-found error for `@/lib/playbook-status`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/playbook-status.ts
import type { PlaybookFacts } from '@/lib/schemas';
import type { Status } from '@/components/playbook/status-chip';

export type SectionKey =
  | 'entity'
  | 'visaCompass'
  | 'licenses'
  | 'taxIncentives'
  | 'banking'
  | 'timeline'
  | 'riskMatrix';

const sectionKeys: SectionKey[] = [
  'entity',
  'visaCompass',
  'licenses',
  'taxIncentives',
  'banking',
  'timeline',
  'riskMatrix',
];

export function getSectionStatus(
  key: SectionKey,
  facts: PlaybookFacts,
): Status {
  switch (key) {
    case 'entity':
    case 'taxIncentives':
    case 'banking':
    case 'timeline':
      return 'eligible';
    case 'visaCompass':
      if (facts.visaCompass.outcome === 'pass') return 'eligible';
      if (facts.visaCompass.outcome === 'likely-fail') return 'blocker';
      return 'not-applicable';
    case 'licenses':
      return facts.licenses.items.some(
        (item) => item.status === 'review-needed',
      )
        ? 'flag'
        : 'eligible';
    case 'riskMatrix':
      return facts.riskMatrix.risks.some((risk) => risk.impact === 'high')
        ? 'flag'
        : 'eligible';
  }
}

export function countSectionStatuses(facts: PlaybookFacts) {
  const statuses = sectionKeys.map((key) => getSectionStatus(key, facts));
  return {
    eligible: statuses.filter((status) => status === 'eligible').length,
    toReview: statuses.filter(
      (status) => status === 'flag' || status === 'blocker',
    ).length,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- playbook-status`
Expected: PASS, all assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/playbook-status.ts tests/lib/playbook-status.test.ts
git commit -m "feat: add per-section eligibility status derivation for playbook nav"
```

---

### Task 7: Playbook building blocks — restyle and add narrative slot

**Files:**
- Modify: `src/components/playbook/section-card.tsx`
- Modify: `src/components/playbook/status-chip.tsx`
- Modify: `src/components/playbook/agency-badge.tsx`
- Modify: `src/components/playbook/sources-footer.tsx`
- Modify: `src/components/playbook/sections/entity-card.tsx`
- Modify: `src/components/playbook/sections/visa-planner.tsx`
- Modify: `src/components/playbook/sections/license-table.tsx`
- Modify: `src/components/playbook/sections/tax-card.tsx`
- Modify: `src/components/playbook/sections/banking-card.tsx`
- Modify: `src/components/playbook/sections/timeline-card.tsx`
- Modify: `src/components/playbook/sections/risk-grid.tsx`
- Modify: `src/components/charts/compass-breakdown.tsx`

**Interfaces:**
- Consumes: `NarrativeSection` type from `@/lib/schemas`.
- Produces: every section component (`EntityCard`, `VisaPlanner`, `LicenseTable`, `TaxCard`, `BankingCard`, `TimelineCard`, `RiskGrid`) gains a new optional prop `narrative?: NarrativeSection` and renders it via a shared `NarrativeBlock` component at the end of its children. Task 8 renders these components from `playbook/page.tsx`, passing `narrative={displayedNarratives[key]}`.

- [ ] **Step 1: Restyle `SectionCard`**

In `src/components/playbook/section-card.tsx`, replace:

```tsx
      className={cn(
        'overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm',
        className,
      )}
```

with:

```tsx
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
```

Replace:

```tsx
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
```

with:

```tsx
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
```

Replace:

```tsx
            <h2 className="text-base font-semibold tracking-[-0.01em] text-zinc-950">
```

with:

```tsx
            <h2 className="font-serif text-[18px] font-semibold tracking-[-0.005em] text-foreground">
```

- [ ] **Step 2: Restyle `StatusChip` and add a `NarrativeBlock` export next to it**

Replace the whole `statusConfig` object in `src/components/playbook/status-chip.tsx`:

```ts
const statusConfig = {
  eligible: {
    icon: Check,
    label: 'Eligible',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  flag: {
    icon: TriangleAlert,
    label: 'Flag',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  blocker: {
    icon: X,
    label: 'Blocker',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  'not-applicable': {
    icon: CircleMinus,
    label: 'N/A',
    className: 'border-zinc-200 bg-zinc-50 text-zinc-500',
  },
} as const;
```

with:

```ts
const statusConfig = {
  eligible: {
    icon: Check,
    label: 'Eligible',
    className: 'border-success/30 bg-success-tint text-success',
  },
  flag: {
    icon: TriangleAlert,
    label: 'To review',
    className: 'border-warning/30 bg-warning-tint text-warning',
  },
  blocker: {
    icon: X,
    label: 'Blocker',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  'not-applicable': {
    icon: CircleMinus,
    label: 'N/A',
    className: 'border-border bg-muted text-muted-foreground',
  },
} as const;
```

Replace the chip `className` string:

```
'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium',
```

with:

```
'inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs font-medium',
```

- [ ] **Step 3: Restyle `AgencyBadge`**

In `src/components/playbook/agency-badge.tsx`, replace:

```tsx
            className="border-zinc-200 bg-white font-semibold tracking-[0.04em] text-zinc-600"
```

with:

```tsx
            className="border-border bg-card font-mono font-semibold tracking-[0.04em] text-muted-foreground"
```

- [ ] **Step 4: Restyle `SourcesFooter`**

In `src/components/playbook/sources-footer.tsx`, replace:

```tsx
    <footer className="border-t border-zinc-100 px-5 py-3 text-[12.5px] leading-5 text-zinc-500">
```

with:

```tsx
    <footer className="border-t border-border px-5 py-3 font-mono text-[12.5px] leading-5 text-muted-foreground">
```

Replace:

```
'inline-flex items-center gap-0.5 underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-teal-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
```

with:

```
'inline-flex items-center gap-0.5 underline decoration-border underline-offset-2 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
```

- [ ] **Step 5: Add a shared `NarrativeBlock` component**

Append to `src/components/playbook/section-card.tsx` (same file, new export — it's the section-card family's natural home since every section renders it as the last child of a `SectionCard`):

```tsx
import type { NarrativeSection } from '@/lib/schemas';

export function NarrativeBlock({
  narrative,
}: {
  narrative: NarrativeSection | undefined;
}) {
  if (!narrative) {
    return (
      <div
        aria-label="AI narrative is being generated"
        aria-live="polite"
        className="mt-5 border-t border-border pt-4"
        role="status"
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none"
          />
          <p className="text-[12.5px] font-semibold text-primary">
            Generating grounded guidance...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-5 space-y-3 border-t border-border pt-4 text-[13px] leading-6 text-foreground">
      <p>{narrative.summary}</p>
      {narrative.callout ? (
        <p className="rounded-md border-l-2 border-primary bg-primary/10 px-3 py-2 text-primary">
          {narrative.callout}
        </p>
      ) : null}
      {narrative.nextSteps.length ? (
        <ul className="list-disc space-y-1 pl-5">
          {narrative.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      ) : null}
      {narrative.uncertaintyFlags.length ? (
        <p className="font-mono text-xs text-warning">
          Uncertainty: {narrative.uncertaintyFlags.join(' ')}
        </p>
      ) : null}
    </div>
  );
}
```

Add the import `import type { NarrativeSection } from '@/lib/schemas';` at the top of `section-card.tsx` alongside the existing imports.

- [ ] **Step 6: Add the `narrative` prop to each section component**

For each of the 7 files below, apply the same two-part change: (a) add `narrative?: NarrativeSection` to the component's props type and destructure it, (b) render `<NarrativeBlock narrative={narrative} />` as the last child inside `<SectionCard>`, (c) import `NarrativeBlock` and `NarrativeSection`.

`src/components/playbook/sections/entity-card.tsx` — replace:

```tsx
import { SectionCard } from '@/components/playbook/section-card';
import { sourcesFromFacts } from '@/components/playbook/source-utils';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { formatNumber } from '@/lib/format';
import type { EntityFacts } from '@/lib/schemas';

export function EntityCard({ facts }: { facts: EntityFacts }) {
```

with:

```tsx
import { NarrativeBlock, SectionCard } from '@/components/playbook/section-card';
import { sourcesFromFacts } from '@/components/playbook/source-utils';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { formatNumber } from '@/lib/format';
import type { EntityFacts, NarrativeSection } from '@/lib/schemas';

export function EntityCard({
  facts,
  narrative,
}: {
  facts: EntityFacts;
  narrative?: NarrativeSection;
}) {
```

and just before the closing `</SectionCard>`, add `<NarrativeBlock narrative={narrative} />`.

Apply the identical pattern to the other six files, each keeping its own existing facts-prop type and adding `narrative?: NarrativeSection`:

- `visa-planner.tsx`: props become `{ facts: VisaCompassFacts; narrative?: NarrativeSection }`; import `NarrativeBlock` alongside `SectionCard`, import `NarrativeSection` alongside `VisaCompassFacts`; add `<NarrativeBlock narrative={narrative} />` before `</SectionCard>` (after `<CompassBreakdown facts={facts} />`).
- `license-table.tsx`: props become `{ facts: LicensesFacts; narrative?: NarrativeSection }`; same import pattern; add `<NarrativeBlock narrative={narrative} />` before `</SectionCard>` (after the `divide-y` items list).
- `tax-card.tsx`: props become `{ facts: TaxIncentivesFacts; narrative?: NarrativeSection }`; same import pattern; add `<NarrativeBlock narrative={narrative} />` before `</SectionCard>` (after the opportunities block).
- `banking-card.tsx`: props become `{ facts: BankingFacts; narrative?: NarrativeSection }`; same import pattern; add `<NarrativeBlock narrative={narrative} />` before `</SectionCard>` (after the recommendations block).
- `timeline-card.tsx`: props become `{ facts: TimelineFacts; factCatalog: RegulatoryFact[]; narrative?: NarrativeSection }`; same import pattern (keep the existing `RegulatoryFact` import); add `<NarrativeBlock narrative={narrative} />` before `</SectionCard>` (after the `<ol>`).
- `risk-grid.tsx`: props become `{ facts: RiskMatrixFacts; factCatalog: RegulatoryFact[]; narrative?: NarrativeSection }`; same import pattern; add `<NarrativeBlock narrative={narrative} />` before `</SectionCard>` (after the grid `<div>`).

- [ ] **Step 7: Restyle section-specific hardcoded colors**

`license-table.tsx`: replace `statusMap` values so the mapping still resolves through the `Status` type but reads correctly against the new `StatusChip` label ("To review" now covers what was "flag") — no code change needed here since `statusMap`'s values (`'flag'`, `'not-applicable'`) are unchanged; only `StatusChip`'s rendering changed in Step 2. Replace hardcoded text colors: `text-[14.5px] font-semibold text-zinc-950` → `text-[14.5px] font-semibold text-foreground`; `mt-1 space-y-1 text-[13px] leading-5 text-zinc-600` → `mt-1 space-y-1 text-[13px] leading-5 text-muted-foreground`; `divide-y divide-zinc-100` → `divide-y divide-border`.

`entity-card.tsx`: replace `text-[14.5px] leading-6 text-zinc-700` → `text-[14.5px] leading-6 text-foreground`; `border-t border-zinc-100 pt-4` → `border-t border-border pt-4`; `text-[12.5px] font-medium text-zinc-500` → `font-mono text-[12.5px] font-medium text-muted-foreground`; `space-y-2 text-[13px] leading-5 text-zinc-700` → `space-y-2 text-[13px] leading-5 text-foreground`; `divide-y divide-zinc-100 border-y border-zinc-100` → `divide-y divide-border border-y border-border`; `text-[13px] leading-5 text-zinc-600` → `text-[13px] leading-5 text-muted-foreground`; `text-[13px] font-medium text-zinc-950 tabular-nums` → `text-[13px] font-mono font-medium text-foreground tabular-nums`.

`tax-card.tsx`: replace `text-[13px] font-medium text-zinc-950` → `text-[13px] font-medium text-foreground`; `mt-0.5 text-[13px] leading-5 text-zinc-600 tabular-nums` → `mt-0.5 font-mono text-[13px] leading-5 text-muted-foreground tabular-nums`; `border-t border-zinc-100 pt-4` → `border-t border-border pt-4`; `text-[12.5px] font-medium text-zinc-500` → `font-mono text-[12.5px] font-medium text-muted-foreground`; `space-y-2 text-[13px] leading-5 text-zinc-700` → `space-y-2 text-[13px] leading-5 text-foreground`.

`banking-card.tsx`: replace both `text-[12.5px] font-medium text-zinc-500` → `font-mono text-[12.5px] font-medium text-muted-foreground`; both `space-y-2 text-[13px] leading-5 text-zinc-700` → `space-y-2 text-[13px] leading-5 text-foreground`; `font-medium text-zinc-950` → `font-medium text-foreground`; `border-t border-zinc-100 pt-4` → `border-t border-border pt-4`.

`timeline-card.tsx`: replace `before:absolute before:top-2 before:bottom-2 before:left-[4.75rem] before:w-px before:bg-zinc-200` → `before:absolute before:top-2 before:bottom-2 before:left-[4.75rem] before:w-px before:bg-border`; `text-[12.5px] font-semibold text-teal-700 tabular-nums` → `font-mono text-[12.5px] font-semibold text-primary tabular-nums`; `text-[14.5px] leading-5 text-zinc-700` → `text-[14.5px] leading-5 text-foreground`.

`risk-grid.tsx`: replace `severityClasses` values:

```ts
const severityClasses = {
  low: 'border-emerald-200 bg-emerald-50',
  medium: 'border-amber-200 bg-amber-50',
  high: 'border-red-200 bg-red-50',
} as const;
```

with:

```ts
const severityClasses = {
  low: 'border-success/30 bg-success-tint',
  medium: 'border-warning/30 bg-warning-tint',
  high: 'border-destructive/30 bg-destructive/10',
} as const;
```

Replace `text-[13px] leading-5 text-zinc-600` → `text-[13px] leading-5 text-muted-foreground`; every `text-[12.5px] font-semibold text-zinc-600` (3 occurrences) → `font-mono text-[12.5px] font-semibold text-muted-foreground`; `text-[12.5px] font-semibold leading-4 text-zinc-950` → `text-[12.5px] font-semibold leading-4 text-foreground`; `text-[12px] text-zinc-500` → `font-mono text-[12px] text-muted-foreground`; the "Show/Hide mitigation" button class `text-zinc-700 underline decoration-zinc-400 underline-offset-2 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700` → `text-foreground underline decoration-border underline-offset-2 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`; `text-[12px] leading-4 text-zinc-700` → `text-[12px] leading-4 text-foreground`.

`visa-planner.tsx`: replace `text-[14.5px] leading-6 text-zinc-700` → `text-[14.5px] leading-6 text-foreground`; `font-semibold text-zinc-950 tabular-nums` (both occurrences) → `font-mono font-semibold text-foreground tabular-nums`.

- [ ] **Step 8: Restyle `compass-breakdown.tsx`**

Replace `border-t border-zinc-100 pt-5` → `border-t border-border pt-5`; both `text-[12.5px] font-medium text-zinc-500` → `font-mono text-[12.5px] font-medium text-muted-foreground`; `mt-1 text-[13px] text-zinc-600` → `mt-1 text-[13px] text-muted-foreground`; `text-[13px] font-semibold text-zinc-950 tabular-nums` → `font-mono text-[13px] font-semibold text-foreground tabular-nums`; `font-medium text-zinc-700` → `font-medium text-muted-foreground`; `shrink-0 font-semibold text-zinc-950 tabular-nums` → `shrink-0 font-mono font-semibold text-foreground tabular-nums`; `h-2 overflow-hidden rounded-full bg-zinc-100` → `h-2 overflow-hidden rounded-full bg-muted`; the score-bar conditional:

```ts
                  gap
                      ? 'h-full rounded-full bg-amber-500'
                      : 'h-full rounded-full bg-zinc-700'
```

with:

```ts
                  gap
                      ? 'h-full rounded-full bg-warning'
                      : 'h-full rounded-full bg-primary'
```

Replace `border-t border-zinc-300` → `border-t border-border`; `border-l-2 border-teal-700` (threshold marker) → `border-l-2 border-primary`; `font-semibold text-teal-700 tabular-nums` → `font-mono font-semibold text-primary tabular-nums`; `border-l-2 border-zinc-950` (score marker) → `border-l-2 border-foreground`; the gap-callout `aside` class `rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] leading-5 text-amber-950` → `rounded-lg border border-warning/30 bg-warning-tint p-3 text-[13px] leading-5 text-warning`; the small-firm `aside` class `rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[13px] leading-5 text-zinc-700` → `rounded-lg border border-border bg-muted p-3 text-[13px] leading-5 text-foreground`.

- [ ] **Step 9: Verify**

Run: `pnpm lint && pnpm test`
Expected: both pass. `grep -rn "teal-\|zinc-\|emerald-\|amber-\|red-2\|red-6" src/components/playbook src/components/charts/compass-breakdown.tsx` should return no matches.

These components aren't wired into any page yet (Task 8 does that) — visual verification happens after Task 8.

- [ ] **Step 10: Commit**

```bash
git add src/components/playbook src/components/charts/compass-breakdown.tsx
git commit -m "feat: restyle playbook section components and add narrative slot"
```

---

### Task 8: Playbook page — wire sections in with pill nav

**Files:**
- Modify: `src/app/playbook/page.tsx`

**Interfaces:**
- Consumes: `SproutWordmark` (Task 4), `getSectionStatus`/`countSectionStatuses` (Task 6), `EntityCard`/`VisaPlanner`/`LicenseTable`/`TaxCard`/`BankingCard`/`TimelineCard`/`RiskGrid` (Task 7), `StatusChip`, `Badge`.
- Removes: the page's own `FactSummary`, `getFactLines`, and `NarrativeBody` functions — their job is now done by the Task 7 section components plus `NarrativeBlock`.

This task replaces the page's rendering body while keeping 100% of its data-fetching logic (the `useEffect` streaming fetch, `demoMode`, `narratives` state, mock-profile loading) untouched — only the JSX from the `if (!profile || !facts)` guard downward changes, plus which section is "active" is now driven by new local state.

- [ ] **Step 1: Replace imports and add active-section state**

Replace:

```tsx
import { AskSingapath } from '@/components/chat/ask-singapath';
```

(this import name should already read `AskSprout` from `@/components/chat/ask-sprout` after Task 3 — if it doesn't yet because tasks are being executed out of order, apply Task 3 Step 2 first)

Replace the full import block at the top of the file with:

```tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { AskSprout } from '@/components/chat/ask-sprout';
import { PlaybookPdfDownload } from '@/components/pdf/playbook-pdf';
import { SproutWordmark } from '@/components/layout/sprout-wordmark';
import { Badge } from '@/components/ui/badge';
import { EntityCard } from '@/components/playbook/sections/entity-card';
import { VisaPlanner } from '@/components/playbook/sections/visa-planner';
import { LicenseTable } from '@/components/playbook/sections/license-table';
import { TaxCard } from '@/components/playbook/sections/tax-card';
import { BankingCard } from '@/components/playbook/sections/banking-card';
import { TimelineCard } from '@/components/playbook/sections/timeline-card';
import { RiskGrid } from '@/components/playbook/sections/risk-grid';
import { StatusChip } from '@/components/playbook/status-chip';
import { findNarrativeFixture } from '@/lib/fixtures';
import { mockProfileIds, type MockProfileId } from '@/lib/mock-profiles';
import {
  NarrativeSectionSchema,
  NarrativesSchema,
  type Profile,
  type Narratives,
} from '@/lib/schemas';
import { buildPlaybookFacts } from '@/lib/rules';
import {
  countSectionStatuses,
  getSectionStatus,
  type SectionKey,
} from '@/lib/playbook-status';
import { useProfileStore } from '@/store/use-profile-store';

const sectionLabels: Record<SectionKey, string> = {
  entity: 'Entity',
  visaCompass: 'Visa and COMPASS',
  licenses: 'Licences',
  taxIncentives: 'Tax and incentives',
  banking: 'Banking',
  timeline: 'Timeline',
  riskMatrix: 'Risk matrix',
};

const sectionKeys = Object.keys(sectionLabels) as SectionKey[];

type NarrativeSource = 'loading' | 'live' | 'demo' | 'cached-demo';
```

This keeps the `type NarrativeSource = ...` declaration that already existed right after the old `sectionLabels` constant — it's still used, untouched, by the existing `const [source, setSource] = useState<NarrativeSource>('loading');` line further down in the component body. Do not duplicate it if that line is still physically present below the constants (it should not be re-declared twice in the same module).

(drops the now-unused `formatMoney, formatNumber, formatWeek` import — those were only used by the deleted `getFactLines`; `formatNumber` may still be needed if any inline JSX in the header uses it — check with `grep -n "formatNumber\|formatMoney\|formatWeek" src/app/playbook/page.tsx` after this step and re-add only what's still referenced.)

Add active-section state right after the existing `const [source, setSource] = useState<NarrativeSource>('loading');` line:

```tsx
  const [activeSection, setActiveSection] = useState<SectionKey>('entity');
```

- [ ] **Step 2: Replace the "no profile" guard styling**

Replace:

```tsx
  if (!profile || !facts) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-950">
            No profile loaded yet.
          </h1>
          <Link
            className="mt-6 inline-flex text-sm font-semibold text-teal-700 underline"
            href="/"
          >
            Back to Sprout
          </Link>
        </div>
      </main>
    );
  }
```

with:

```tsx
  if (!profile || !facts) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center bg-background px-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            No profile loaded yet.
          </h1>
          <Link
            className="mt-6 inline-flex text-sm font-semibold text-primary underline"
            href="/"
          >
            Back to Sprout
          </Link>
        </div>
      </main>
    );
  }
```

- [ ] **Step 3: Replace the page body**

Replace everything from `return (` (the main return, currently starting `<main className="mx-auto min-h-screen w-full max-w-5xl bg-zinc-50 px-6 py-10 text-zinc-950">`) through the closing `</main>` — including the demo-mode banners, breadcrumb, heading, and the `.map` over `sectionLabels` that currently renders `FactSummary`/`NarrativeBody` — with:

```tsx
  const statusCounts = countSectionStatuses(facts);
  const ActiveSectionContent = () => {
    const narrative = displayedNarratives[activeSection];
    switch (activeSection) {
      case 'entity':
        return <EntityCard facts={facts.entity} narrative={narrative} />;
      case 'visaCompass':
        return <VisaPlanner facts={facts.visaCompass} narrative={narrative} />;
      case 'licenses':
        return <LicenseTable facts={facts.licenses} narrative={narrative} />;
      case 'taxIncentives':
        return <TaxCard facts={facts.taxIncentives} narrative={narrative} />;
      case 'banking':
        return <BankingCard facts={facts.banking} narrative={narrative} />;
      case 'timeline':
        return (
          <TimelineCard
            facts={facts.timeline}
            factCatalog={allRegulatoryFacts(facts)}
            narrative={narrative}
          />
        );
      case 'riskMatrix':
        return (
          <RiskGrid
            facts={facts.riskMatrix}
            factCatalog={allRegulatoryFacts(facts)}
            narrative={narrative}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 lg:px-8">
          <SproutWordmark />
          <nav aria-label="Primary" className="flex items-center gap-5">
            <Link
              className="text-[13px] font-medium text-muted-foreground hover:text-primary"
              href="/#mock-profiles"
            >
              Mock profiles
            </Link>
            <Link
              className="text-[13px] font-medium text-primary hover:text-primary/80"
              href="/"
            >
              Back to Sprout
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        {displayedSource === 'cached-demo' ? (
          <div className="mb-5 rounded-lg border border-warning/30 bg-warning-tint px-4 py-3 text-sm text-warning">
            Using cached demo narrative while live generation is unavailable.
          </div>
        ) : null}
        {displayedSource === 'demo' ? (
          <div className="mb-5 rounded-lg border border-warning/30 bg-warning-tint px-4 py-3 text-sm text-warning">
            Demo mode: showing the bundled narrative fixture.
          </div>
        ) : null}
        <p className="font-mono text-xs font-medium tracking-[0.08em] text-primary uppercase">
          Your playbook — {profile.industry} · {profile.entityPurpose}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.01em] text-foreground">
          Facts first. Guidance as it arrives.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground">
          Every fact below comes from the rules engine. Narratives are
          constrained to these facts and may flag uncertainty.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge className="border-success/30 bg-success-tint font-mono text-success" variant="outline">
            ✓ {statusCounts.eligible} eligible
          </Badge>
          <Badge className="border-warning/30 bg-warning-tint font-mono text-warning" variant="outline">
            ⚠ {statusCounts.toReview} to review
          </Badge>
          <PlaybookPdfDownload facts={facts} profile={profile} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {sectionKeys.map((key) => {
            const status = getSectionStatus(key, facts);
            const active = key === activeSection;
            return (
              <button
                className={
                  active
                    ? 'inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[13px] font-medium text-background'
                    : 'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground hover:border-foreground/30'
                }
                key={key}
                onClick={() => setActiveSection(key)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={
                    status === 'eligible'
                      ? 'size-1.5 rounded-full bg-success'
                      : status === 'not-applicable'
                        ? 'size-1.5 rounded-full bg-muted-foreground'
                        : 'size-1.5 rounded-full bg-warning'
                  }
                />
                {sectionLabels[key]}
              </button>
            );
          })}
        </div>
        <div className="mt-6">
          <ActiveSectionContent />
        </div>
        <Link
          className="mt-8 inline-flex text-sm font-semibold text-primary underline"
          href="/"
        >
          Back to Sprout
        </Link>
      </div>
      <AskSprout profile={profile} />
    </main>
  );
}

function allRegulatoryFacts(facts: PlaybookFacts) {
  return [
    ...facts.entity.regulatoryFacts,
    ...facts.visaCompass.regulatoryFacts,
    ...facts.visaCompass.criteria.flatMap((criterion) => criterion.regulatoryFacts),
    ...facts.licenses.items.flatMap((item) => item.regulatoryFacts),
    ...facts.taxIncentives.regulatoryFacts,
    ...facts.banking.requirements,
  ];
}
```

Add `import type { PlaybookFacts } from '@/lib/schemas';` to the type-only import list from Step 1 (alongside `Profile`, `Narratives`).

Delete the now-unused `FactSummary`, `getFactLines`, and `NarrativeBody` function definitions that followed the old return statement — everything from `function FactSummary(` through the end of the old `function NarrativeBody(` is removed; the file now ends after the new `allRegulatoryFacts` function.

- [ ] **Step 4: Verify**

Run: `pnpm lint && pnpm test`
Expected: both pass. If lint flags unused imports (`formatMoney`, `formatNumber`, `formatWeek`, `NarrativeSection`, `PlaybookFacts` if unused, etc.), remove exactly the ones flagged — don't guess ahead of the linter here.

Run dev server + screenshot with a mock profile loaded:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/sprout-playbook.png --window-size=1440,1400 "http://localhost:3000/playbook?mock=vietstack&demo=1"
```
Expected: header with Sprout wordmark, rust breadcrumb, serif H1, green/amber summary badges, black-pill section nav with status dots, the active section rendered as a `SectionCard` with agency badges, fact rows, sources footer, and (in demo mode) the fixture narrative appended below the facts.

Click through each pill (or repeat the screenshot with different `?mock=` / manually toggling `activeSection` during dev) to confirm all seven sections render without runtime errors — pay particular attention to `TimelineCard`/`RiskGrid`'s `factCatalog` prop resolving real source labels via `allRegulatoryFacts`, since `sourcesFromReferences` falls back to the raw `factId` string when a reference isn't found in the catalog.

- [ ] **Step 5: Commit**

```bash
git add src/app/playbook/page.tsx
git commit -m "feat: wire playbook section components into the playbook page with pill nav"
```

---

### Task 9: Chat widget redesign

**Files:**
- Modify: `src/components/chat/ask-sprout.tsx`

**Interfaces:** No prop changes — `AskSprout({ profile: Profile })` keeps its signature.

- [ ] **Step 1: Restyle the launcher button and unread badge**

Replace:

```tsx
          className="size-14 rounded-full bg-teal-700 text-white shadow-lg shadow-teal-950/20 hover:bg-teal-800 focus-visible:ring-teal-700/40"
```

with:

```tsx
          className="size-14 rounded-full bg-foreground text-background shadow-lg shadow-foreground/20 hover:bg-foreground/90"
```

Replace:

```tsx
            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-zinc-50 bg-amber-500 text-[10px] font-bold text-white"
```

with:

```tsx
            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-background bg-warning text-[10px] font-bold text-warning-tint"
```

- [ ] **Step 2: Restyle the dialog shell and header**

Replace:

```tsx
      className="fixed right-4 bottom-4 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-xl border border-teal-200 bg-white shadow-2xl shadow-zinc-950/20"
```

with:

```tsx
      className="fixed right-4 bottom-4 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-foreground/10"
```

Replace:

```tsx
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-teal-100 bg-teal-50 p-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700">
            <Sparkles aria-hidden="true" className="size-4" />
            <p className="text-xs font-semibold tracking-[0.08em] uppercase">
              Ask Sprout
            </p>
          </div>
          <h2
            className="mt-2 text-lg font-semibold text-zinc-950"
            id="ask-sprout-title"
          >
            Explore a grounded what-if
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-zinc-600">
```

with:

```tsx
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-primary/10 p-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles aria-hidden="true" className="size-4" />
            <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase">
              Ask Sprout
            </p>
          </div>
          <h2
            className="mt-2 font-serif text-lg font-semibold text-foreground"
            id="ask-sprout-title"
          >
            Explore a grounded what-if
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
```

- [ ] **Step 3: Restyle suggested questions, messages, and the input row**

Replace:

```tsx
                className="rounded-full border border-teal-200 bg-teal-50 px-3 py-2 text-left text-xs font-medium text-teal-900 transition-colors hover:border-teal-400 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
```

with:

```tsx
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-left text-xs font-medium text-primary transition-colors hover:border-primary/50 hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
```

Replace:

```tsx
          <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            {messages.map((message) => (
              <div
                className={
                  message.role === 'user'
                    ? 'ml-8 rounded-lg bg-teal-700 px-3 py-2 text-sm leading-5 text-white'
                    : 'mr-8 rounded-lg bg-white px-3 py-2 text-sm leading-5 text-zinc-700 shadow-sm'
                }
```

with:

```tsx
          <div className="space-y-4 rounded-lg border border-border bg-muted p-3">
            {messages.map((message) => (
              <div
                className={
                  message.role === 'user'
                    ? 'ml-8 rounded-lg bg-foreground px-3 py-2 text-sm leading-5 text-background'
                    : 'mr-8 rounded-lg bg-card px-3 py-2 text-sm leading-5 text-foreground'
                }
```

Replace:

```tsx
              <p className="text-xs font-semibold text-teal-700" role="status">
```

with:

```tsx
              <p className="font-mono text-xs font-semibold text-primary" role="status">
```

Replace the "Scenario result" tool-result block classes:

```tsx
            className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-teal-950"
```

with:

```tsx
            className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-foreground"
```

and:

```tsx
              <p className="text-xs font-semibold tracking-[0.08em] text-teal-800 uppercase">
```

with:

```tsx
              <p className="font-mono text-xs font-semibold tracking-[0.08em] text-primary uppercase">
```

and the two remaining `text-teal-800`/`border-teal-200`/`text-teal-900` occurrences inside that block (the status label span and the sources block) to `text-primary`/`border-primary/30`/`text-primary` respectively.

Replace the error banner:

```tsx
            className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
```

with:

```tsx
            className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning-tint px-3 py-2 text-xs text-warning"
```

Replace the text input:

```tsx
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-teal-700 focus:ring-3 focus:ring-teal-700/15"
```

with:

```tsx
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
```

Replace the footer disclaimer:

```tsx
        <p className="text-xs text-zinc-500">
```

with:

```tsx
        <p className="text-xs text-muted-foreground">
```

- [ ] **Step 4: Verify**

Run: `pnpm lint && pnpm test`
Expected: both pass. `grep -n "teal-\|zinc-\|amber-" src/components/chat/ask-sprout.tsx` should return no matches.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/ask-sprout.tsx
git commit -m "feat: restyle Ask Sprout chat widget for paper/editorial theme"
```

---

### Task 10: PDF export reskin

**Files:**
- Modify: `src/components/pdf/playbook-pdf.tsx`

**Interfaces:** No prop changes — `PlaybookPdf`/`PlaybookPdfDownload` keep their existing `{ profile, facts }` props.

- [ ] **Step 1: Register web fonts for react-pdf**

Add, right after the existing imports (before `const styles = StyleSheet.create(...)`):

```tsx
Font.register({
  family: 'Newsreader',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/newsreader/v20/cY9GfjGoW0FpXus0zpe2Zh6ZWm-YRZ2vk5NHTQ.ttf',
      fontWeight: 600,
    },
  ],
});
Font.register({
  family: 'Public Sans',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/publicsans/v18/ijwGs572Xtc6ZYQws9YVwllKWEQfEt0jkHDlYA.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/publicsans/v18/ijwOs572Xtc6ZYQws9YVwllKWCTsxJ0kHz5H.ttf',
      fontWeight: 600,
    },
  ],
});
Font.register({
  family: 'IBM Plex Mono',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/ibmplexmono/v19/-F63fjptAgt5VM-kVkqdyU8n3o8XVA.ttf',
      fontWeight: 400,
    },
  ],
});
```

Add `Font` to the `@react-pdf/renderer` import list.

Before wiring this into every style, verify the exact static-TTF URLs are current and reachable — Google Fonts periodically rotates its static CDN filenames. Run:
```bash
curl -sI "https://fonts.gstatic.com/s/newsreader/v20/cY9GfjGoW0FpXus0zpe2Zh6ZWm-YRZ2vk5NHTQ.ttf" | head -1
curl -sI "https://fonts.gstatic.com/s/publicsans/v18/ijwGs572Xtc6ZYQws9YVwllKWEQfEt0jkHDlYA.ttf" | head -1
curl -sI "https://fonts.gstatic.com/s/publicsans/v18/ijwOs572Xtc6ZYQws9YVwllKWCTsxJ0kHz5H.ttf" | head -1
curl -sI "https://fonts.gstatic.com/s/ibmplexmono/v19/-F63fjptAgt5VM-kVkqdyU8n3o8XVA.ttf" | head -1
```
Expected: `HTTP/2 200` for each. If any return 404, fetch the current URL for that family/weight from `https://fonts.googleapis.com/css2?family=Newsreader:wght@600&family=Public+Sans:wght@400;600&family=IBM+Plex+Mono:wght@400` (the `src:` URLs inside that CSS response are the current static TTF links) and substitute it before proceeding — do not guess a URL.

- [ ] **Step 2: Update the color/font tokens in `StyleSheet.create`**

Replace the whole `styles` object with:

```tsx
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#faf9f5',
    color: '#1c1b19',
    fontFamily: 'Public Sans',
    fontSize: 9,
    paddingBottom: 42,
    paddingHorizontal: 36,
    paddingTop: 36,
  },
  header: { borderBottomColor: '#93362c', borderBottomWidth: 2, marginBottom: 18, paddingBottom: 10 },
  eyebrow: { color: '#93362c', fontFamily: 'IBM Plex Mono', fontSize: 8, letterSpacing: 1.2, marginBottom: 5, textTransform: 'uppercase' },
  title: { fontFamily: 'Newsreader', fontSize: 21, fontWeight: 600 },
  subtitle: { color: '#8a8880', fontSize: 9, marginTop: 5 },
  section: { backgroundColor: '#ffffff', borderColor: '#e2ddd2', borderRadius: 3, borderWidth: 1, marginBottom: 12, padding: 12 },
  sectionTitle: { color: '#1c1b19', fontFamily: 'Newsreader', fontSize: 14, fontWeight: 600, marginBottom: 8 },
  label: { color: '#8a8880', fontFamily: 'IBM Plex Mono', fontSize: 8, marginBottom: 2 },
  value: { color: '#1c1b19', fontSize: 9, lineHeight: 1.35 },
  paragraph: { color: '#3a3830', fontSize: 9, lineHeight: 1.4, marginBottom: 6 },
  list: { marginTop: 3 },
  listItem: { color: '#3a3830', fontSize: 9, lineHeight: 1.35, marginBottom: 4 },
  row: { borderBottomColor: '#f2f0ea', borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 5 },
  rowLabel: { color: '#8a8880', flex: 1, fontSize: 8.5 },
  rowValue: { color: '#1c1b19', flex: 1, fontFamily: 'IBM Plex Mono', fontSize: 8.5, textAlign: 'right' },
  sourceBlock: { borderTopColor: '#f2f0ea', borderTopWidth: 1, marginTop: 9, paddingTop: 7 },
  source: { color: '#8a8880', fontFamily: 'IBM Plex Mono', fontSize: 7.5, lineHeight: 1.3, marginBottom: 3 },
  sourceLink: { color: '#93362c', textDecoration: 'underline' },
  footer: { bottom: 18, color: '#8a8880', fontFamily: 'IBM Plex Mono', fontSize: 7.5, left: 36, position: 'absolute', right: 36, textAlign: 'center' },
  disclaimer: { backgroundColor: '#f2f0ea', color: '#3a3830', fontSize: 8, lineHeight: 1.35, marginTop: 4, padding: 8 },
});
```

- [ ] **Step 3: Rename the download filename, title, and footer copy**

Replace `title="SingaPath playbook" author="SingaPath"` with `title="Sprout playbook" author="Sprout"`.

Replace `<Text style={styles.eyebrow}>SingaPath playbook</Text>` with `<Text style={styles.eyebrow}>Sprout playbook</Text>`.

Replace `A deterministic snapshot generated from your profile and SingaPath&apos;s rules engine.` with `A deterministic snapshot generated from your profile and Sprout&apos;s rules engine.`

Replace `` `SingaPath - Facts-first playbook  |  Page ${pageNumber} of ${totalPages}` `` with `` `Sprout - Facts-first playbook  |  Page ${pageNumber} of ${totalPages}` ``.

Replace `` `singapath-${profile.industry}-playbook.pdf` `` with `` `sprout-${profile.industry}-playbook.pdf` ``.

Replace the download button's `className`:

```tsx
    className={buttonVariants({ className: 'h-10 bg-teal-700 px-4 text-white hover:bg-teal-800 focus-visible:ring-teal-700/30' })}
```

with:

```tsx
    className={buttonVariants({ className: 'h-10 bg-foreground px-4 text-background hover:bg-foreground/90' })}
```

- [ ] **Step 4: Verify**

Run: `pnpm lint && pnpm test`
Expected: both pass.

Run dev server, navigate to `http://localhost:3000/playbook?mock=vietstack&demo=1`, click "Download PDF", and open the downloaded `sprout-saas-playbook.pdf` (or equivalent). Visually confirm: cream page background, serif section titles, mono fact labels/sources, rust header rule and eyebrow — and specifically confirm the fonts actually rendered as Newsreader/IBM Plex Mono rather than silently falling back to Helvetica (react-pdf swallows font-registration failures rather than throwing, so this must be checked by eye, not just by the build succeeding).

- [ ] **Step 5: Commit**

```bash
git add src/components/pdf/playbook-pdf.tsx
git commit -m "feat: reskin PDF export with Sprout paper/editorial theme"
```

---

### Task 11: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Full lint, typecheck, and test run**

Run: `pnpm lint && pnpm test && pnpm build`
Expected: all three succeed with zero errors/warnings. `pnpm build` also serves as the TypeScript typecheck for a Next.js project (`next build` runs `tsc` as part of the production build).

- [ ] **Step 2: Repo-wide rename check**

Run: `grep -rIn -i "singapath" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" src docs package.json`
Expected: no output.

- [ ] **Step 3: Repo-wide leftover-color check**

Run: `grep -rIn "teal-[0-9]\|zinc-[0-9]" src/app src/components/chat src/components/intake src/components/playbook src/components/pdf src/components/charts`
Expected: no output. (`src/components/ui/*` primitives were intentionally left mostly untouched in Task 2 beyond the two targeted fixes — re-run this same grep against `src/components/ui` too and confirm any remaining hits are pre-existing dark-mode-only classes like `dark:bg-input/30`, not light-theme `teal-*`/`zinc-*` literals.)

- [ ] **Step 4: End-to-end visual walkthrough**

With `pnpm dev` running, capture and review each of these with headless Chrome (adjust `--window-size` height per page as needed):

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --window-size=1440,1400 --screenshot=/tmp/sprout-final-landing.png http://localhost:3000
"$CHROME" --headless --disable-gpu --window-size=1440,900 --screenshot=/tmp/sprout-final-wizard.png http://localhost:3000/intake
"$CHROME" --headless --disable-gpu --window-size=1440,1500 --screenshot=/tmp/sprout-final-playbook.png "http://localhost:3000/playbook?mock=warung-digital&demo=1"
```

Expected: all three show the cream/rust/serif/mono paper theme consistently, "Sprout" wordmark in the header of every page, no leftover teal/zinc styling, and the playbook page's pill nav switching between all seven sections without errors (spot-check by changing `mock=` to `vietstack` and `payflip` and re-screenshotting the playbook page for each, since different profiles exercise different `licenses`/`riskMatrix` status branches from Task 6).

- [ ] **Step 5: Final commit (only if any fixes were needed in this task)**

If Steps 1–4 required any fixes, commit them:

```bash
git add -A
git commit -m "fix: address issues found in Sprout redesign verification pass"
```

If no fixes were needed, this task produces no commit — verification-only tasks that pass clean don't need one.
