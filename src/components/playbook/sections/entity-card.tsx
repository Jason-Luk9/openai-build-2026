import { Building2 } from 'lucide-react';

import { AgencyBadge } from '@/components/playbook/agency-badge';
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
  return (
    <SectionCard
      agencies={<AgencyBadge agency="ACRA" />}
      footer={
        <SourcesFooter sources={sourcesFromFacts(facts.regulatoryFacts)} />
      }
      icon={Building2}
      title="Entity"
    >
      <p className="text-[14.5px] leading-6 text-foreground">
        {facts.recommendation.summary}
      </p>
      {facts.alternatives.length > 0 ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="font-mono text-[12.5px] font-medium text-muted-foreground">
            Alternatives
          </p>
          <ul className="mt-2 space-y-2 text-[13px] leading-5 text-foreground">
            {facts.alternatives.map((alternative) => (
              <li key={alternative.summary}>{alternative.summary}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <dl className="mt-5 divide-y divide-border border-y border-border">
        {facts.regulatoryFacts.map((fact) => (
          <div className="flex gap-4 py-3" key={fact.id}>
            <dt className="min-w-0 text-[13px] leading-5 text-muted-foreground">
              {fact.label}
            </dt>
            <dd className="ml-auto font-mono text-right text-[13px] font-medium text-foreground tabular-nums">
              {typeof fact.value === 'number'
                ? formatNumber(fact.value)
                : String(fact.value)}
            </dd>
          </div>
        ))}
      </dl>
      <NarrativeBlock narrative={narrative} />
    </SectionCard>
  );
}
