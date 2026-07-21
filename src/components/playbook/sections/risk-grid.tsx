'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

import { NarrativeBlock, SectionCard } from '@/components/playbook/section-card';
import { sourcesFromReferences } from '@/components/playbook/source-utils';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { cn } from '@/lib/utils';
import type { NarrativeSection, RegulatoryFact, RiskMatrixFacts } from '@/lib/schemas';

const likelihoods = ['high', 'medium', 'low'] as const;
const impacts = ['low', 'medium', 'high'] as const;
const severityClasses = {
  low: 'border-success/30 bg-success-tint',
  medium: 'border-warning/30 bg-warning-tint',
  high: 'border-destructive/30 bg-destructive/10',
} as const;

function severity(likelihood: string, impact: string) {
  const levels = { low: 1, medium: 2, high: 3 } as const;
  const score =
    levels[likelihood as keyof typeof levels] +
    levels[impact as keyof typeof levels];
  return score >= 5 ? 'high' : score >= 3 ? 'medium' : 'low';
}

export function RiskGrid({
  facts,
  factCatalog,
  narrative,
}: {
  facts: RiskMatrixFacts;
  factCatalog: RegulatoryFact[];
  narrative?: NarrativeSection;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <SectionCard
      footer={
        <SourcesFooter
          sources={sourcesFromReferences(
            facts.risks.flatMap((risk) => risk.sourceReferences),
            factCatalog,
          )}
        />
      }
      icon={ShieldAlert}
      title="Risk matrix"
    >
      <p className="mb-4 text-[13px] leading-5 text-muted-foreground">
        Likelihood runs high to low from top to bottom. Impact runs low to high
        from left to right.
      </p>
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[5.5rem_repeat(3,minmax(0,1fr))] gap-2">
            <div />
            <div className="text-center font-mono text-[12.5px] font-semibold text-muted-foreground">
              Low impact
            </div>
            <div className="text-center font-mono text-[12.5px] font-semibold text-muted-foreground">
              Medium impact
            </div>
            <div className="text-center font-mono text-[12.5px] font-semibold text-muted-foreground">
              High impact
            </div>
            {likelihoods.flatMap((likelihood) => [
              <div
                className="flex items-center font-mono text-[12.5px] font-semibold text-muted-foreground"
                key={`${likelihood}-label`}
              >
                {likelihood[0]?.toUpperCase()}
                {likelihood.slice(1)} likelihood
              </div>,
              ...impacts.map((impact) => {
                const risks = facts.risks.filter(
                  (risk) =>
                    risk.likelihood === likelihood && risk.impact === impact,
                );
                const key = `${likelihood}-${impact}`;
                return (
                  <div
                    className={cn(
                      'min-h-28 rounded-lg border p-2.5',
                      severityClasses[severity(likelihood, impact)],
                    )}
                    key={key}
                  >
                    {risks.length === 0 ? (
                      <span className="font-mono text-[12px] text-muted-foreground">
                        No identified risks
                      </span>
                    ) : (
                      risks.map((risk) => (
                        <div className="mb-2 last:mb-0" key={risk.title}>
                          <p className="text-[12.5px] font-semibold leading-4 text-foreground">
                            {risk.title}
                          </p>
                          <button
                            aria-expanded={expanded === risk.title}
                            className="mt-1 cursor-pointer rounded-sm text-[12px] font-medium text-foreground underline decoration-border underline-offset-2 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            onClick={() =>
                              setExpanded(
                                expanded === risk.title ? null : risk.title,
                              )
                            }
                            type="button"
                          >
                            {expanded === risk.title
                              ? 'Hide mitigation'
                              : 'Show mitigation'}
                          </button>
                          {expanded === risk.title ? (
                            <p className="mt-1 text-[12px] leading-4 text-foreground">
                              {risk.mitigation}
                            </p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                );
              }),
            ])}
          </div>
        </div>
      </div>
      <NarrativeBlock narrative={narrative} />
    </SectionCard>
  );
}
