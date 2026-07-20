'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';

import { AgencyBadge } from '@/components/playbook/agency-badge';
import { SectionReveal } from '@/components/playbook/section-reveal';
import { BankingCard } from '@/components/playbook/sections/banking-card';
import { EntityCard } from '@/components/playbook/sections/entity-card';
import { LicenseTable } from '@/components/playbook/sections/license-table';
import { RiskGrid } from '@/components/playbook/sections/risk-grid';
import { TaxCard } from '@/components/playbook/sections/tax-card';
import { TimelineCard } from '@/components/playbook/sections/timeline-card';
import { VisaPlanner } from '@/components/playbook/sections/visa-planner';
import { buildPlaybookFacts } from '@/lib/rules';
import type { RegulatoryFact } from '@/lib/schemas';
import { useProfileStore } from '@/store/use-profile-store';

const anchors = [
  ['entity', 'Entity'],
  ['visa', 'Visa / COMPASS'],
  ['licenses', 'Licences'],
  ['tax', 'Tax'],
  ['banking', 'Banking'],
  ['timeline', 'Timeline'],
  ['risks', 'Risks'],
] as const;

function allFacts(
  facts: ReturnType<typeof buildPlaybookFacts>,
): RegulatoryFact[] {
  return [
    ...facts.entity.regulatoryFacts,
    ...facts.visaCompass.regulatoryFacts,
    ...facts.visaCompass.criteria.flatMap(
      (criterion) => criterion.regulatoryFacts,
    ),
    ...facts.licenses.items.flatMap((item) => item.regulatoryFacts),
    ...facts.taxIncentives.regulatoryFacts,
    ...facts.banking.requirements,
  ];
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
          <Link
            className="rounded-sm text-[17px] font-semibold tracking-[-0.035em] text-zinc-950 transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            href="/"
          >
            Singa<span className="text-teal-700">Path</span>
          </Link>
          <Link
            className="inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold text-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            href="/"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Profiles
          </Link>
        </div>
      </header>
      {children}
      <footer className="mt-auto border-t border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-[12.5px] text-zinc-500 sm:px-6 lg:px-8">
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

export default function PlaybookPage() {
  const profile = useProfileStore((state) => state.profile);
  const facts = useMemo(
    () => (profile ? buildPlaybookFacts(profile) : null),
    [profile],
  );
  if (!profile || !facts)
    return (
      <Shell>
        <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-16 sm:px-6 lg:px-8">
          <div>
            <p className="text-[12.5px] font-medium tracking-[0.08em] text-teal-700 uppercase">
              Your playbook
            </p>
            <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.04em]">
              No profile loaded yet
            </h1>
            <p className="mt-3 max-w-xl text-[14.5px] leading-6 text-zinc-700">
              Choose a mock profile or build your company profile to generate an
              instant facts-backed playbook.
            </p>
            <Link
              className="mt-6 inline-flex rounded-sm text-sm font-semibold text-teal-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
              href="/"
            >
              Back to SingaPath
            </Link>
          </div>
        </main>
      </Shell>
    );
  const catalog = allFacts(facts);
  return (
    <Shell>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-10 sm:px-6 lg:px-8">
        <section className="py-7 sm:py-9">
          <p className="text-[12.5px] font-medium tracking-[0.08em] text-teal-700 uppercase">
            Your Singapore entry plan
          </p>
          <h1 className="mt-2 text-[30px] leading-tight font-semibold tracking-[-0.04em] text-zinc-950 sm:text-[36px]">
            Your facts-backed market-entry playbook.
          </h1>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-6 text-zinc-700">
            Every requirement below is computed from your profile and linked to
            its official source.
          </p>
        </section>
        <nav
          aria-label="Playbook sections"
          className="sticky top-0 z-20 -mx-5 border-y border-zinc-200 bg-zinc-50/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {anchors.map(([id, label]) => (
              <a
                className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-teal-300 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                href={`#${id}`}
                key={id}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="scroll-mt-24" id="entity">
            <SectionReveal delay={0}>
              <EntityCard facts={facts.entity} />
            </SectionReveal>
          </div>
          <div className="scroll-mt-24" id="visa">
            <SectionReveal delay={0.08}>
              <VisaPlanner facts={facts.visaCompass} />
            </SectionReveal>
          </div>
          <div className="scroll-mt-24 lg:col-span-2" id="licenses">
            <SectionReveal delay={0.16}>
              <LicenseTable facts={facts.licenses} />
            </SectionReveal>
          </div>
          <div className="scroll-mt-24" id="tax">
            <SectionReveal delay={0.24}>
              <TaxCard facts={facts.taxIncentives} />
            </SectionReveal>
          </div>
          <div className="scroll-mt-24" id="banking">
            <SectionReveal delay={0.32}>
              <BankingCard facts={facts.banking} />
            </SectionReveal>
          </div>
          <div className="scroll-mt-24 lg:col-span-2" id="timeline">
            <SectionReveal delay={0.4}>
              <TimelineCard factCatalog={catalog} facts={facts.timeline} />
            </SectionReveal>
          </div>
          <div className="scroll-mt-24 lg:col-span-2" id="risks">
            <SectionReveal delay={0.48}>
              <RiskGrid factCatalog={catalog} facts={facts.riskMatrix} />
            </SectionReveal>
          </div>
        </div>
      </main>
    </Shell>
  );
}
