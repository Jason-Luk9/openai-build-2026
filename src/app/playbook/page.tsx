'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { AskSprout } from '@/components/chat/ask-sprout';
import { PlaybookPdfDownload } from '@/components/pdf/playbook-pdf';
import { findNarrativeFixture } from '@/lib/fixtures';
import { formatMoney, formatNumber, formatWeek } from '@/lib/format';
import { mockProfileIds, type MockProfileId } from '@/lib/mock-profiles';
import {
  NarrativeSectionSchema,
  NarrativesSchema,
  type PlaybookFacts,
  type Profile,
  type NarrativeSection,
  type Narratives,
} from '@/lib/schemas';
import { buildPlaybookFacts } from '@/lib/rules';
import { useProfileStore } from '@/store/use-profile-store';

const sectionLabels = {
  entity: 'Entity',
  visaCompass: 'Visa and COMPASS',
  licenses: 'Licences',
  taxIncentives: 'Tax and incentives',
  banking: 'Banking',
  timeline: 'Timeline',
  riskMatrix: 'Risk matrix',
} as const;

type NarrativeSource = 'loading' | 'live' | 'demo' | 'cached-demo';

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

  const displayedNarratives = demoMode
    ? findNarrativeFixture(profile)
    : narratives;
  const displayedSource = demoMode ? 'demo' : source;

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl bg-zinc-50 px-6 py-10 text-zinc-950">
      {displayedSource === 'cached-demo' ? (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Using cached demo narrative while live generation is unavailable.
        </div>
      ) : null}
      {displayedSource === 'demo' ? (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Demo mode: showing the bundled narrative fixture.
        </div>
      ) : null}
      <p className="text-xs font-medium tracking-[0.08em] text-teal-700 uppercase">
        Your playbook
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Facts first. Guidance as it arrives.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-700">
        Every fact below comes from the rules engine. Narratives are constrained
        to these facts and may flag uncertainty.
      </p>
      <div className="mt-5">
        <PlaybookPdfDownload facts={facts} profile={profile} />
      </div>
      <div className="mt-8 grid gap-4">
        {(Object.keys(sectionLabels) as Array<keyof typeof sectionLabels>).map(
          (key) => (
            <section
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
              key={key}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{sectionLabels[key]}</h2>
                <span
                  className={
                    displayedSource === 'loading'
                      ? 'text-xs font-semibold text-teal-700'
                      : 'text-xs text-zinc-500'
                  }
                >
                  {displayedNarratives[key]
                    ? displayedSource === 'loading'
                      ? 'Streaming'
                      : 'Narrative ready'
                    : displayedSource === 'loading'
                      ? 'Generating...'
                      : 'Narrative pending'}
                </span>
              </div>
              <FactSummary facts={facts} profile={profile} section={key} />
              <NarrativeBody narrative={displayedNarratives[key]} />
            </section>
          ),
        )}
      </div>
      <Link
        className="mt-8 inline-flex text-sm font-semibold text-teal-700 underline"
        href="/"
      >
        Back to Sprout
      </Link>
      <AskSprout profile={profile} />
    </main>
  );
}

function FactSummary({
  facts,
  profile,
  section,
}: {
  facts: PlaybookFacts;
  profile: Profile;
  section: keyof typeof sectionLabels;
}) {
  const lines = getFactLines(facts, profile, section);

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-xs font-semibold tracking-[0.08em] text-zinc-500 uppercase">
        Facts
      </p>
      <ul className="mt-2 space-y-1 text-sm leading-5 text-zinc-700">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function getFactLines(
  facts: PlaybookFacts,
  profile: Profile,
  section: keyof typeof sectionLabels,
): string[] {
  switch (section) {
    case 'entity':
      return [
        `Industry: ${profile.industry}; purpose: ${profile.entityPurpose}.`,
        `Relocating founders/staff: ${formatNumber(profile.foundersRelocating)} / ${formatNumber(profile.staffRelocating)}.`,
        facts.entity.recommendation.summary,
        ...facts.entity.regulatoryFacts
          .slice(0, 2)
          .map((fact) => `${fact.label}: ${String(fact.value)}`),
      ];
    case 'visaCompass':
      return [
        `Relocating team: ${formatNumber(profile.foundersRelocating + profile.staffRelocating)} people.`,
        `COMPASS score: ${formatNumber(facts.visaCompass.totalScore)} / ${formatNumber(facts.visaCompass.passThreshold)} points to pass.`,
        `Small-firm rule: ${facts.visaCompass.isSmallFirm ? 'applies' : 'does not apply'}.`,
        ...facts.visaCompass.criteria.map(
          (criterion) =>
            `${criterion.id}: ${formatNumber(criterion.score)} / ${formatNumber(criterion.maximumScore)} points.`,
        ),
      ];
    case 'licenses':
      return facts.licenses.items.map((item) => {
        const fact = item.regulatoryFacts[0];
        return `${item.name}: ${item.status}${fact ? ` — ${String(fact.value)}` : ''}.`;
      });
    case 'taxIncentives':
      return [
        `Projected Singapore revenue: ${formatMoney(profile.projectedSingaporeRevenue)}.`,
        ...facts.taxIncentives.regulatoryFacts.map(
          (fact) => `${fact.label}: ${String(fact.value)}`,
        ),
      ];
    case 'banking':
      return facts.banking.requirements.map(
        (fact) => `${fact.label}: ${String(fact.value)}`,
      );
    case 'timeline':
      return facts.timeline.steps.map(
        (step) => `${formatWeek(step.week)}: ${step.action}`,
      );
    case 'riskMatrix':
      return facts.riskMatrix.risks.map(
        (risk) =>
          `${risk.title}: ${risk.likelihood} likelihood / ${risk.impact} impact.`,
      );
  }
}

function NarrativeBody({
  narrative,
}: {
  narrative: NarrativeSection | undefined;
}) {
  if (!narrative) {
    return (
      <div
        aria-label="AI narrative is being generated"
        aria-live="polite"
        className="mt-4 rounded-lg border-2 border-teal-200 bg-teal-50 p-4 text-teal-950"
        role="status"
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2.5 animate-pulse rounded-full bg-teal-700 motion-reduce:animate-none"
          />
          <p className="text-sm font-semibold">
            Generating grounded guidance...
          </p>
        </div>
        <div aria-hidden="true" className="mt-3 space-y-2">
          <div className="h-2.5 w-full animate-pulse rounded-full bg-teal-200 motion-reduce:animate-none" />
          <div className="h-2.5 w-10/12 animate-pulse rounded-full bg-teal-200 motion-reduce:animate-none" />
          <div className="h-2.5 w-7/12 animate-pulse rounded-full bg-teal-200 motion-reduce:animate-none" />
        </div>
        <p className="mt-3 text-xs text-teal-800">
          Your facts are ready. The AI explanation will appear here as it
          streams in.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
      <p>{narrative.summary}</p>
      {narrative.callout ? (
        <p className="rounded-md border-l-2 border-teal-700 bg-teal-50 px-3 py-2">
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
        <p className="text-xs text-amber-700">
          Uncertainty: {narrative.uncertaintyFlags.join(' ')}
        </p>
      ) : null}
    </div>
  );
}
