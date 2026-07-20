import { Building2 } from 'lucide-react';

import { AgencyBadge } from '@/components/playbook/agency-badge';
import { SectionCard } from '@/components/playbook/section-card';
import { sourcesFromFacts } from '@/components/playbook/source-utils';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { formatNumber } from '@/lib/format';
import type { EntityFacts } from '@/lib/schemas';

export function EntityCard({ facts }: { facts: EntityFacts }) {
  return (
    <SectionCard
      agencies={<AgencyBadge agency="ACRA" />}
      footer={
        <SourcesFooter sources={sourcesFromFacts(facts.regulatoryFacts)} />
      }
      icon={Building2}
      title="Entity"
    >
      <p className="text-[14.5px] leading-6 text-zinc-700">
        {facts.recommendation.summary}
      </p>
      {facts.alternatives.length > 0 ? (
        <div className="mt-4 border-t border-zinc-100 pt-4">
          <p className="text-[12.5px] font-medium text-zinc-500">
            Alternatives
          </p>
          <ul className="mt-2 space-y-2 text-[13px] leading-5 text-zinc-700">
            {facts.alternatives.map((alternative) => (
              <li key={alternative.summary}>{alternative.summary}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <dl className="mt-5 divide-y divide-zinc-100 border-y border-zinc-100">
        {facts.regulatoryFacts.map((fact) => (
          <div className="flex gap-4 py-3" key={fact.id}>
            <dt className="min-w-0 text-[13px] leading-5 text-zinc-600">
              {fact.label}
            </dt>
            <dd className="ml-auto text-right text-[13px] font-medium text-zinc-950 tabular-nums">
              {typeof fact.value === 'number'
                ? formatNumber(fact.value)
                : String(fact.value)}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}
