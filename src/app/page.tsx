'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Building2,
  Calculator,
  ClipboardList,
  Download,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

import { AgencyBadge } from '@/components/playbook/agency-badge';
import { SectionCard } from '@/components/playbook/section-card';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { StatusChip } from '@/components/playbook/status-chip';
import { Button } from '@/components/ui/button';
import { SproutWordmark } from '@/components/layout/sprout-wordmark';
import { formatNumber } from '@/lib/format';
import { type MockProfileId, useProfileStore } from '@/store/use-profile-store';

const mockProfiles: Array<{
  id: MockProfileId;
  name: string;
  meta: string;
  hook: string;
}> = [
  {
    id: 'warung-digital',
    name: 'Warung Digital',
    meta: 'Indonesia · F&B brand',
    hook: 'Opening a Singapore outlet to reach regional distributors.',
  },
  {
    id: 'vietstack',
    name: 'VietStack',
    meta: 'Vietnam · B2B SaaS',
    hook: 'Relocating two founders on Employment Passes.',
  },
  {
    id: 'payflip',
    name: 'PayFlip',
    meta: 'Philippines · Fintech',
    hook: 'Assessing a MAS licence path before expansion.',
  },
];

const howItWorksSteps = [
  {
    icon: ClipboardList,
    title: 'Answer 5 quick questions',
    description:
      'Home country, industry, entity purpose, team size, and EntrePass evidence — about five minutes.',
  },
  {
    icon: Calculator,
    title: 'The rules engine computes the facts',
    description:
      'Entity structure, COMPASS score, licences, tax, banking, and a week-by-week timeline — every figure sourced from MOM, ACRA, IRAS or MAS.',
  },
  {
    icon: Sparkles,
    title: 'AI narrates, never invents',
    description:
      'Plain-language guidance grounded only in the computed facts, with uncertainty flagged explicitly wherever a figure is assumed rather than confirmed.',
  },
  {
    icon: Download,
    title: 'Download or ask a what-if',
    description:
      'Export a source-cited PDF, or ask Sprout a grounded follow-up like "what if we pay S$7,000 a month?"',
  },
] as const;

export default function Home() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const loadMockProfile = useProfileStore((state) => state.loadMockProfile);

  function handleLoadProfile(id: MockProfileId) {
    loadMockProfile(id);
    router.push(`/playbook?mock=${id}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center px-6 py-5 lg:px-8">
          <SproutWordmark />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-6 lg:px-8">
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

        <section className="scroll-mt-6 pt-5" id="mock-profiles">
          <p className="mb-2 font-mono text-[12.5px] font-medium text-muted-foreground">
            Load a mock profile to see it run
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {mockProfiles.map((profile) => (
              <article
                className="group rounded-xl border border-border bg-card p-4 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/30 motion-reduce:transform-none"
                key={profile.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-base font-semibold tracking-[-0.01em] text-foreground">
                      {profile.name}
                    </h2>
                    <p className="mt-1 font-mono text-[12.5px] text-muted-foreground">
                      {profile.meta}
                    </p>
                  </div>
                  <Building2
                    aria-hidden="true"
                    className="mt-0.5 size-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary"
                    strokeWidth={1.75}
                  />
                </div>
                <p className="mt-4 min-h-10 text-[14.5px] leading-5 text-foreground">
                  {profile.hook}
                </p>
                <button
                  className="mt-4 inline-flex cursor-pointer items-center gap-1 rounded-md text-[13px] font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
                  onClick={() => handleLoadProfile(profile.id)}
                  type="button"
                >
                  Load profile{' '}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section
          className="scroll-mt-6 border-t border-border pt-8"
          id="how-it-works"
        >
          <p className="font-mono text-[12.5px] font-medium tracking-[0.08em] text-primary uppercase">
            How it works
          </p>
          <h2 className="mt-2 font-serif text-[26px] font-semibold tracking-[-0.01em] text-foreground">
            Facts computed, not guessed.
          </h2>
          <p className="mt-2 max-w-2xl text-[14.5px] leading-6 text-foreground">
            Four steps from a five-minute form to a source-cited playbook.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((step, index) => (
              <div
                className="rounded-xl border border-border bg-card p-4"
                key={step.title}
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
                  </div>
                  <p className="font-mono text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    Step {formatNumber(index + 1)}
                  </p>
                </div>
                <h3 className="mt-3 font-serif text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 font-mono text-[12.5px] font-medium text-muted-foreground">
            For example — one computed fact from step 2:
          </p>
          <div className="mt-2">
            <SectionCard
              action={<StatusChip status="eligible" />}
              agencies={<AgencyBadge agency="MOM" />}
              footer={
                <SourcesFooter
                  sources={[
                    {
                      label: 'MOM COMPASS Framework',
                      url: 'https://www.mom.gov.sg/passes-and-permits/employment-pass/compass',
                      lastVerified: 'Jul 2026',
                    },
                  ]}
                />
              }
              icon={FileCheck2}
              title="Employment Pass — COMPASS score"
            >
              <p className="max-w-3xl text-[14.5px] leading-6 text-foreground">
                <span className="font-mono font-semibold text-foreground tabular-nums">
                  {formatNumber(62)} pts
                </span>{' '}
                against a{' '}
                <span className="font-mono font-semibold text-foreground tabular-nums">
                  {formatNumber(40)} pt
                </span>{' '}
                qualifying threshold — based on the salary, education and
                company track record you entered.
              </p>
            </SectionCard>
          </div>

          <div className="mt-8 flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-[18px] font-semibold tracking-[-0.01em] text-foreground">
                Ready to see your own facts?
              </p>
              <p className="mt-1 text-[13.5px] leading-5 text-muted-foreground">
                Answer the same five questions with your company&apos;s real
                details.
              </p>
            </div>
            <Button
              className="h-10 shrink-0 bg-foreground px-4 text-background hover:bg-foreground/90"
              onClick={() => router.push('/intake')}
            >
              Start with your own company
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-5 font-mono text-[12.5px] text-muted-foreground lg:px-8">
          <p>General information, not legal advice.</p>
          <div className="flex flex-wrap gap-1.5">
            <AgencyBadge agency="MOM" />
            <AgencyBadge agency="ACRA" />
            <AgencyBadge agency="IRAS" />
            <AgencyBadge agency="MAS" />
          </div>
        </div>
      </footer>
    </div>
  );
}
