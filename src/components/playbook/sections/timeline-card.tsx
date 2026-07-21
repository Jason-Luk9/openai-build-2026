import { ListChecks } from 'lucide-react';

import { AgencyBadge } from '@/components/playbook/agency-badge';
import { NarrativeBlock, SectionCard } from '@/components/playbook/section-card';
import { sourcesFromReferences } from '@/components/playbook/source-utils';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { formatWeek } from '@/lib/format';
import type { NarrativeSection, RegulatoryFact, TimelineFacts } from '@/lib/schemas';

export function TimelineCard({
  facts,
  factCatalog,
  narrative,
}: {
  facts: TimelineFacts;
  factCatalog: RegulatoryFact[];
  narrative?: NarrativeSection;
}) {
  const steps = [...facts.steps].sort((a, b) => a.week - b.week);
  return (
    <SectionCard
      agencies={
        <>
          <AgencyBadge agency="ACRA" />
          <AgencyBadge agency="MOM" />
          <AgencyBadge agency="IRAS" />
        </>
      }
      footer={
        <SourcesFooter
          sources={sourcesFromReferences(
            facts.steps.flatMap((step) => step.sourceReferences),
            factCatalog,
          )}
        />
      }
      icon={ListChecks}
      title="Timeline"
    >
      <ol className="relative space-y-0 before:absolute before:top-2 before:bottom-2 before:left-[4.25rem] before:w-px before:bg-border">
        {steps.map((step) => (
          <li
            className="relative grid grid-cols-[3.75rem_1fr] gap-4 py-3 first:pt-0 last:pb-0"
            key={`${step.week}-${step.action}`}
          >
            <span className="z-10 h-5 bg-card text-right font-mono text-[12.5px] font-semibold text-primary tabular-nums">
              {formatWeek(step.week)}
            </span>
            <p className="text-[14.5px] leading-5 text-foreground">
              {step.action}
            </p>
          </li>
        ))}
      </ol>
      <NarrativeBlock narrative={narrative} />
    </SectionCard>
  );
}
