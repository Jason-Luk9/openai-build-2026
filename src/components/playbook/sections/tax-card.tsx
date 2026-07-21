import { Landmark } from 'lucide-react';

import { AgencyBadge } from '@/components/playbook/agency-badge';
import { NarrativeBlock, SectionCard } from '@/components/playbook/section-card';
import { sourcesFromFacts } from '@/components/playbook/source-utils';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { formatNumber } from '@/lib/format';
import type { NarrativeSection, TaxIncentivesFacts } from '@/lib/schemas';

function displayValue(value: string | number | boolean) {
  return typeof value === 'number' ? formatNumber(value) : String(value);
}
export function TaxCard({
  facts,
  narrative,
}: {
  facts: TaxIncentivesFacts;
  narrative?: NarrativeSection;
}) {
  return (
    <SectionCard
      agencies={
        <>
          <AgencyBadge agency="IRAS" />
          <AgencyBadge agency="EDB" />
        </>
      }
      footer={
        <SourcesFooter sources={sourcesFromFacts(facts.regulatoryFacts)} />
      }
      icon={Landmark}
      title="Tax & incentives"
    >
      <dl className="space-y-3">
        {facts.regulatoryFacts.map((fact) => (
          <div key={fact.id}>
            <dt className="text-[13px] font-medium text-foreground">
              {fact.label}
            </dt>
            <dd className="mt-0.5 font-mono text-[13px] leading-5 text-muted-foreground tabular-nums">
              {displayValue(fact.value)}
              {fact.description ? ` — ${fact.description}` : ''}
            </dd>
          </div>
        ))}
      </dl>
      {facts.opportunities.length > 0 ? (
        <div className="mt-5 border-t border-border pt-4">
          <p className="font-mono text-[12.5px] font-medium text-muted-foreground">
            Opportunities
          </p>
          <ul className="mt-2 space-y-2 text-[13px] leading-5 text-foreground">
            {facts.opportunities.map((opportunity) => (
              <li key={opportunity.summary}>{opportunity.summary}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <NarrativeBlock narrative={narrative} />
    </SectionCard>
  );
}
