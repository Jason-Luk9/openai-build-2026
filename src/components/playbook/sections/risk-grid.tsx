'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

import { SectionCard } from '@/components/playbook/section-card';
import { sourcesFromReferences } from '@/components/playbook/source-utils';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { cn } from '@/lib/utils';
import type { RegulatoryFact, RiskMatrixFacts } from '@/lib/schemas';

const likelihoods = ['high', 'medium', 'low'] as const;
const impacts = ['low', 'medium', 'high'] as const;
const severityClasses = {
  low: 'border-emerald-200 bg-emerald-50',
  medium: 'border-amber-200 bg-amber-50',
  high: 'border-red-200 bg-red-50',
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
}: {
  facts: RiskMatrixFacts;
  factCatalog: RegulatoryFact[];
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
      <p className="mb-4 text-[13px] leading-5 text-zinc-600">
        Likelihood runs high to low from top to bottom. Impact runs low to high
        from left to right.
      </p>
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[5.5rem_repeat(3,minmax(0,1fr))] gap-2">
            <div />
            <div className="text-center text-[12.5px] font-semibold text-zinc-600">
              Low impact
            </div>
            <div className="text-center text-[12.5px] font-semibold text-zinc-600">
              Medium impact
            </div>
            <div className="text-center text-[12.5px] font-semibold text-zinc-600">
              High impact
            </div>
            {likelihoods.flatMap((likelihood) => [
              <div
                className="flex items-center text-[12.5px] font-semibold text-zinc-600"
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
                      <span className="text-[12px] text-zinc-500">
                        No identified risks
                      </span>
                    ) : (
                      risks.map((risk) => (
                        <div className="mb-2 last:mb-0" key={risk.title}>
                          <p className="text-[12.5px] font-semibold leading-4 text-zinc-950">
                            {risk.title}
                          </p>
                          <button
                            aria-expanded={expanded === risk.title}
                            className="mt-1 rounded-sm text-[12px] font-medium text-zinc-700 underline decoration-zinc-400 underline-offset-2 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
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
                            <p className="mt-1 text-[12px] leading-4 text-zinc-700">
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
    </SectionCard>
  );
}
