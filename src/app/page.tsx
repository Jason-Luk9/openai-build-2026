'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, FileCheck2 } from 'lucide-react';

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
          <div className="mb-2 flex items-center justify-between gap-4">
            <p className="font-mono text-[12.5px] font-medium text-muted-foreground">
              Load a mock profile to see it run
            </p>
            <Link
              className="text-[12.5px] font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:text-primary/80 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              href="/intake"
            >
              or start with your own company →
            </Link>
          </div>
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
                  className="mt-4 inline-flex items-center gap-1 rounded-md text-[13px] font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
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

        <section className="scroll-mt-6 pt-5" id="how-it-works">
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
              qualifying threshold — based on the salary, education and company
              track record you entered.
            </p>
          </SectionCard>
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
