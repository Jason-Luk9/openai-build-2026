'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AskSprout } from '@/components/chat/ask-sprout';
import { PlaybookPdfDownload } from '@/components/pdf/playbook-pdf';
import { SproutWordmark } from '@/components/layout/sprout-wordmark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EntityCard } from '@/components/playbook/sections/entity-card';
import { VisaPlanner } from '@/components/playbook/sections/visa-planner';
import { LicenseTable } from '@/components/playbook/sections/license-table';
import { TaxCard } from '@/components/playbook/sections/tax-card';
import { BankingCard } from '@/components/playbook/sections/banking-card';
import { TimelineCard } from '@/components/playbook/sections/timeline-card';
import { RiskGrid } from '@/components/playbook/sections/risk-grid';
import { findNarrativeFixture } from '@/lib/fixtures';
import { mockProfileIds, type MockProfileId } from '@/lib/mock-profiles';
import {
  NarrativeSectionSchema,
  NarrativesSchema,
  type PlaybookFacts,
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

function isCompleteNarratives(
  narratives: Partial<Narratives>,
): narratives is Narratives {
  return sectionKeys.every((key) => Boolean(narratives[key]));
}

export default function PlaybookPage() {
  const profile = useProfileStore((state) => state.profile);
  const loadMockProfile = useProfileStore((state) => state.loadMockProfile);
  const facts = useMemo(
    () => (profile ? buildPlaybookFacts(profile) : null),
    [profile],
  );
  const demoMode = useMemo(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('demo') === '1',
    [],
  );
  const [narratives, setNarratives] = useState<Partial<Narratives>>({});
  const [source, setSource] = useState<NarrativeSource>('loading');
  const [activeSection, setActiveSection] = useState<SectionKey>('entity');

  useEffect(() => {
    if (profile) return;
    const params = new URLSearchParams(window.location.search);
    const requestedMock = params.get('mock');
    const demoMock = demoMode && !requestedMock ? 'vietstack' : requestedMock;
    if (demoMock && mockProfileIds.includes(demoMock as MockProfileId)) {
      loadMockProfile(demoMock as MockProfileId);
    }
  }, [demoMode, loadMockProfile, profile]);

  useEffect(() => {
    if (!profile || !facts) return;

    const fixture = findNarrativeFixture(profile);
    if (demoMode) return;

    const controller = new AbortController();
    async function generate() {
      try {
        setNarratives({});
        setSource('loading');
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, facts }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body)
          throw new Error(`Generation failed: ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let pending = '';
        while (true) {
          const result = await reader.read();
          pending += decoder.decode(result.value ?? new Uint8Array(), {
            stream: !result.done,
          });
          const lines = pending.split('\n');
          pending = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as {
              type: 'narrative' | 'complete' | 'error';
              section?: keyof typeof sectionLabels;
              narrative?: unknown;
              narratives?: unknown;
              message?: string;
            };
            if (
              event.type === 'narrative' &&
              event.section &&
              event.narrative
            ) {
              const section = NarrativeSectionSchema.parse(event.narrative);
              setNarratives((current) => ({
                ...current,
                [event.section!]: section,
              }));
            }
            if (event.type === 'complete') {
              setNarratives(NarrativesSchema.parse(event.narratives));
            }
            if (event.type === 'error')
              throw new Error(event.message ?? 'Narrative generation failed.');
          }
          if (result.done) break;
        }
        setSource('live');
      } catch {
        if (controller.signal.aborted) return;
        setNarratives(fixture);
        setSource('cached-demo');
      }
    }

    void generate();
    return () => controller.abort();
  }, [demoMode, facts, profile]);

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

  const displayedNarratives = demoMode
    ? findNarrativeFixture(profile)
    : narratives;
  const displayedSource = demoMode ? 'demo' : source;
  const narrativesReady = isCompleteNarratives(displayedNarratives);

  const statusCounts = countSectionStatuses(facts);
  const activeNarrative = displayedNarratives[activeSection];
  let activeSectionContent: React.ReactNode;
  switch (activeSection) {
    case 'entity':
      activeSectionContent = (
        <EntityCard facts={facts.entity} narrative={activeNarrative} />
      );
      break;
    case 'visaCompass':
      activeSectionContent = (
        <VisaPlanner facts={facts.visaCompass} narrative={activeNarrative} />
      );
      break;
    case 'licenses':
      activeSectionContent = (
        <LicenseTable facts={facts.licenses} narrative={activeNarrative} />
      );
      break;
    case 'taxIncentives':
      activeSectionContent = (
        <TaxCard facts={facts.taxIncentives} narrative={activeNarrative} />
      );
      break;
    case 'banking':
      activeSectionContent = (
        <BankingCard facts={facts.banking} narrative={activeNarrative} />
      );
      break;
    case 'timeline':
      activeSectionContent = (
        <TimelineCard
          facts={facts.timeline}
          factCatalog={allRegulatoryFacts(facts)}
          narrative={activeNarrative}
        />
      );
      break;
    case 'riskMatrix':
      activeSectionContent = (
        <RiskGrid
          facts={facts.riskMatrix}
          factCatalog={allRegulatoryFacts(facts)}
          narrative={activeNarrative}
        />
      );
      break;
  }

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
          Your playbook — {profile.homeCountry} · {profile.industry} ·{' '}
          {profile.entityPurpose}
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
          {narrativesReady ? (
            <PlaybookPdfDownload
              facts={facts}
              narratives={displayedNarratives}
              profile={profile}
            />
          ) : (
            <Button
              aria-label="Preparing guidance for all sections before the PDF can be downloaded"
              className="h-10 bg-foreground px-4 text-background"
              disabled
            >
              <Download aria-hidden="true" />
              Preparing guidance...
            </Button>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {sectionKeys.map((key) => {
            const status = getSectionStatus(key, facts);
            const active = key === activeSection;
            return (
              <button
                className={
                  active
                    ? 'inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[13px] font-medium text-background'
                    : 'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground hover:border-foreground/30'
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
          {activeSectionContent}
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
