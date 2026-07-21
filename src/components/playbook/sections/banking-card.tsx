import { Building } from 'lucide-react';

import { NarrativeBlock, SectionCard } from '@/components/playbook/section-card';
import { sourcesFromFacts } from '@/components/playbook/source-utils';
import { SourceMark, SourcesFooter } from '@/components/playbook/sources-footer';
import { formatNumber } from '@/lib/format';
import type { BankingFacts, NarrativeSection } from '@/lib/schemas';

export function BankingCard({
  facts,
  narrative,
}: {
  facts: BankingFacts;
  narrative?: NarrativeSection;
}) {
  const sources = sourcesFromFacts(facts.requirements);
  return (
    <SectionCard
      footer={<SourcesFooter sources={sources} />}
      icon={Building}
      title="Banking"
    >
      <div className="space-y-4">
        <div>
          <p className="font-mono text-[12.5px] font-medium text-muted-foreground">
            Account requirements
          </p>
          <ul className="mt-2 space-y-2 text-[13px] leading-5 text-foreground">
            {facts.requirements.map((fact) => (
              <li key={fact.id}>
                <span className="font-medium text-foreground">{fact.label}:</span>
                <SourceMark fact={fact} sources={sources} />{' '}
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
        <div className="border-t border-border pt-4">
          <p className="font-mono text-[12.5px] font-medium text-muted-foreground">
            Recommended next steps
          </p>
          <ul className="mt-2 space-y-2 text-[13px] leading-5 text-foreground">
            {facts.recommendations.map((recommendation) => (
              <li key={recommendation.summary}>{recommendation.summary}</li>
            ))}
          </ul>
        </div>
      </div>
      <NarrativeBlock narrative={narrative} />
    </SectionCard>
  );
}
