import { Landmark } from 'lucide-react';

import { AgencyBadge } from '@/components/playbook/agency-badge';
import { SectionCard } from '@/components/playbook/section-card';
import { sourcesFromFacts } from '@/components/playbook/source-utils';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { formatNumber } from '@/lib/format';
import type { TaxIncentivesFacts } from '@/lib/schemas';

function displayValue(value: string | number | boolean) {
  return typeof value === 'number' ? formatNumber(value) : String(value);
}
export function TaxCard({ facts }: { facts: TaxIncentivesFacts }) {
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
            <dt className="text-[13px] font-medium text-zinc-950">
              {fact.label}
            </dt>
            <dd className="mt-0.5 text-[13px] leading-5 text-zinc-600 tabular-nums">
              {displayValue(fact.value)}
              {fact.description ? ` — ${fact.description}` : ''}
            </dd>
          </div>
        ))}
      </dl>
      {facts.opportunities.length > 0 ? (
        <div className="mt-5 border-t border-zinc-100 pt-4">
          <p className="text-[12.5px] font-medium text-zinc-500">
            Opportunities
          </p>
          <ul className="mt-2 space-y-2 text-[13px] leading-5 text-zinc-700">
            {facts.opportunities.map((opportunity) => (
              <li key={opportunity.summary}>{opportunity.summary}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionCard>
  );
}
