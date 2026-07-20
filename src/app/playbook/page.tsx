'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { findNarrativeFixture } from '@/lib/fixtures';
import { mockProfileIds, type MockProfileId } from '@/lib/mock-profiles';
import {
  NarrativeSectionSchema,
  NarrativesSchema,
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
  const facts = useMemo(() => (profile ? buildPlaybookFacts(profile) : null), [profile]);
  const demoMode = useMemo(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1',
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
        if (!response.ok || !response.body) throw new Error(`Generation failed: ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let pending = '';
        while (true) {
          const result = await reader.read();
          pending += decoder.decode(result.value ?? new Uint8Array(), { stream: !result.done });
          const lines = pending.split('\n');
          pending = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as {
              type: 'narrative' | 'complete';
              section?: keyof typeof sectionLabels;
              narrative?: unknown;
              narratives?: unknown;
            };
            if (event.type === 'narrative' && event.section && event.narrative) {
              const section = NarrativeSectionSchema.parse(event.narrative);
              setNarratives((current) => ({ ...current, [event.section!]: section }));
            }
            if (event.type === 'complete') {
              setNarratives(NarrativesSchema.parse(event.narratives));
            }
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
          <h1 className="text-3xl font-semibold text-zinc-950">No profile loaded yet.</h1>
          <Link className="mt-6 inline-flex text-sm font-semibold text-teal-700 underline" href="/">
            Back to SingaPath
          </Link>
        </div>
      </main>
    );
  }

  const displayedNarratives = demoMode ? findNarrativeFixture(profile) : narratives;
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
      <p className="text-xs font-medium tracking-[0.08em] text-teal-700 uppercase">Your playbook</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Facts first. Guidance as it arrives.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-700">
        Every fact below comes from the rules engine. Narratives are constrained to these facts and may flag uncertainty.
      </p>
      <div className="mt-8 grid gap-4">
        {(Object.keys(sectionLabels) as Array<keyof typeof sectionLabels>).map((key) => (
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm" key={key}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{sectionLabels[key]}</h2>
              <span className="text-xs text-zinc-500">
                {displayedNarratives[key] ? (displayedSource === 'loading' ? 'Streaming' : 'Narrative ready') : 'Narrative pending'}
              </span>
            </div>
            <details className="mt-4 rounded-md bg-zinc-50 p-3">
              <summary className="cursor-pointer text-sm font-medium text-zinc-700">View computed facts</summary>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-zinc-600">
                {JSON.stringify(facts[key], null, 2)}
              </pre>
            </details>
            <NarrativeBody narrative={displayedNarratives[key]} />
          </section>
        ))}
      </div>
      <Link className="mt-8 inline-flex text-sm font-semibold text-teal-700 underline" href="/">
        Back to SingaPath
      </Link>
    </main>
  );
}

function NarrativeBody({ narrative }: { narrative: NarrativeSection | undefined }) {
  if (!narrative) return <div className="mt-4 h-16 animate-pulse rounded bg-zinc-100" />;
  return (
    <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
      <p>{narrative.summary}</p>
      {narrative.callout ? <p className="rounded-md border-l-2 border-teal-700 bg-teal-50 px-3 py-2">{narrative.callout}</p> : null}
      {narrative.nextSteps.length ? (
        <ul className="list-disc space-y-1 pl-5">
          {narrative.nextSteps.map((step) => <li key={step}>{step}</li>)}
        </ul>
      ) : null}
      {narrative.uncertaintyFlags.length ? (
        <p className="text-xs text-amber-700">Uncertainty: {narrative.uncertaintyFlags.join(' ')}</p>
      ) : null}
    </div>
  );
}
