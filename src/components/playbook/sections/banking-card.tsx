import { Building } from 'lucide-react';

import { SectionCard } from '@/components/playbook/section-card';
import { sourcesFromFacts } from '@/components/playbook/source-utils';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { formatNumber } from '@/lib/format';
import type { BankingFacts } from '@/lib/schemas';

export function BankingCard({ facts }: { facts: BankingFacts }) {
  return (
    <SectionCard
      footer={<SourcesFooter sources={sourcesFromFacts(facts.requirements)} />}
      icon={Building}
      title="Banking"
    >
      <div className="space-y-4">
        <div>
          <p className="text-[12.5px] font-medium text-zinc-500">
            Account requirements
          </p>
          <ul className="mt-2 space-y-2 text-[13px] leading-5 text-zinc-700">
            {facts.requirements.map((fact) => (
              <li key={fact.id}>
                <span className="font-medium text-zinc-950">{fact.label}:</span>{' '}
                <span className="tabular-nums">
                  {typeof fact.value === 'number'
                    ? formatNumber(fact.value)
                    : String(fact.value)}
                </span>
                {fact.description ? ` — ${fact.description}` : ''}
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-zinc-100 pt-4">
          <p className="text-[12.5px] font-medium text-zinc-500">
            Recommended next steps
          </p>
          <ul className="mt-2 space-y-2 text-[13px] leading-5 text-zinc-700">
            {facts.recommendations.map((recommendation) => (
              <li key={recommendation.summary}>{recommendation.summary}</li>
            ))}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
