import { z } from 'zod';

import {
  bundledKnowledge,
  type Profile,
  type RegulatoryFact,
} from '@/lib/schemas';

import { lookupLicenses } from './license-lookup';
import { scoreCompass } from './compass-scorer';
import { matchTaxIncentives } from './tax-matcher';

const nonNegativeNumber = z.number().finite().nonnegative();

export const SalaryWhatIfInputSchema = z
  .object({ monthlySalary: nonNegativeNumber })
  .strict();

export const HeadcountWhatIfInputSchema = z
  .object({
    totalPmet: z.number().int().nonnegative(),
    localPmet: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.localPmet > value.totalPmet) {
      context.addIssue({
        code: 'custom',
        message: 'Local PMET headcount cannot exceed total PMET headcount.',
        path: ['localPmet'],
      });
    }
  });

export const TaxRevenueWhatIfInputSchema = z
  .object({ projectedSingaporeRevenue: nonNegativeNumber })
  .strict();

const sourceSchema = z.object({
  label: z.string(),
  url: z.url(),
  lastVerified: z.iso.date(),
});

const baseResultSchema = z.object({
  kind: z.enum(['salary', 'headcount', 'tax', 'licenses']),
  status: z.enum(['clear', 'flag', 'review-needed']),
  title: z.string().min(1),
  summary: z.string().min(1),
  details: z.array(z.string().min(1)),
  sources: z.array(sourceSchema),
});

export const WhatIfResultSchema = baseResultSchema.strict();
export type WhatIfResult = z.infer<typeof WhatIfResultSchema>;

function sourceFor(fact: RegulatoryFact) {
  return {
    label: fact.label,
    url: fact.source.url,
    lastVerified: fact.source.lastVerified,
  };
}

function uniqueSources(facts: RegulatoryFact[]) {
  return facts
    .map(sourceFor)
    .filter(
      (source, index, all) =>
        all.findIndex((candidate) => candidate.url === source.url) === index,
    );
}

function firstMonthlyFloor(fact: RegulatoryFact) {
  const match = String(fact.value).match(/S\$\s*([\d,]+)/);
  return match?.[1] ? Number(match[1].replaceAll(',', '')) : null;
}

export function resolveSalaryFloor(profile: Profile) {
  const context =
    profile.industry === 'fintech'
      ? 'financial-services'
      : 'non-financial-services';
  const contextFacts =
    bundledKnowledge.compass.salaryContexts.find(
      (entry) => entry.context === context,
    )?.facts ?? [];
  const floorFact = contextFacts.find((fact) =>
    fact.id.includes('salary-floor'),
  );
  const floor = floorFact ? firstMonthlyFloor(floorFact) : null;
  return { context, contextFacts, floor };
}

export function checkSalaryWhatIf(
  profile: Profile,
  monthlySalary: number,
): WhatIfResult {
  const { context, contextFacts, floor } = resolveSalaryFloor(profile);

  if (floor === null) {
    return WhatIfResultSchema.parse({
      kind: 'salary',
      status: 'review-needed',
      title: 'Salary check needs confirmation',
      summary:
        'The current knowledge base does not contain a machine-readable salary floor for this sector.',
      details: [
        'Confirm the applicant age and current Employment Pass salary requirement with MOM before applying.',
      ],
      sources: uniqueSources(contextFacts),
    });
  }

  const status = monthlySalary < floor ? 'flag' : 'review-needed';
  return WhatIfResultSchema.parse({
    kind: 'salary',
    status,
    title: 'Salary lower-bound check',
    summary:
      monthlySalary < floor
        ? `S$${monthlySalary.toLocaleString('en-SG')} per month is below the lowest sourced ${context} Employment Pass floor of S$${floor.toLocaleString('en-SG')} per month.`
        : `S$${monthlySalary.toLocaleString('en-SG')} per month is at or above the lowest sourced ${context} Employment Pass floor of S$${floor.toLocaleString('en-SG')} per month.`,
    details: [
      'This is a lower-bound check, not an age-specific Employment Pass decision or a numeric COMPASS C1 score.',
      'The supplied knowledge states that the floor rises progressively by applicant age; confirm the applicant-specific requirement with MOM.',
    ],
    sources: uniqueSources(contextFacts),
  });
}

export function checkHeadcountWhatIf(
  profile: Profile,
  input: z.infer<typeof HeadcountWhatIfInputSchema>,
): WhatIfResult {
  const facts = scoreCompass(profile, bundledKnowledge, {
    totalPmet: input.totalPmet,
  });
  const firmFacts = facts.criteria
    .filter((criterion) => criterion.id === 'C3' || criterion.id === 'C4')
    .flatMap((criterion) => criterion.regulatoryFacts);
  const thresholdFact = facts.regulatoryFacts.find((fact) =>
    fact.id.includes('pmet-threshold'),
  );
  const neutralFact = facts.regulatoryFacts.find((fact) =>
    fact.id.includes('neutral-score'),
  );
  const sources = uniqueSources([...firmFacts, ...facts.regulatoryFacts]);

  if (facts.isSmallFirm) {
    return WhatIfResultSchema.parse({
      kind: 'headcount',
      status: 'clear',
      title: 'Small-firm COMPASS treatment applies',
      summary: `At ${input.totalPmet} PMETs, the sourced small-firm rule applies. C3 and C4 each receive the neutral score described in the knowledge base.`,
      details: [
        `Local PMETs supplied for this scenario: ${input.localPmet}.`,
        thresholdFact?.description ??
          'The small-firm PMET threshold is sourced from MOM.',
        neutralFact?.description ??
          'The neutral C3/C4 treatment is sourced from MOM.',
      ],
      sources,
    });
  }

  return WhatIfResultSchema.parse({
    kind: 'headcount',
    status: 'review-needed',
    title: 'Workforce review needed above the small-firm threshold',
    summary: `At ${input.totalPmet} PMETs, the small-firm neutral rule no longer applies.`,
    details: [
      `Local PMETs supplied for this scenario: ${input.localPmet}.`,
      'The current knowledge base does not contain enough workforce-distribution data to calculate C3/C4 points, so no hypothetical score is invented.',
    ],
    sources,
  });
}

export function resolveGstThreshold(profile: Profile) {
  const facts = matchTaxIncentives(profile, bundledKnowledge);
  const thresholdFact = facts.regulatoryFacts.find((fact) =>
    fact.id.includes('gst-registration-threshold'),
  );
  const match = thresholdFact?.value
    ? String(thresholdFact.value).match(/S\$\s*([\d,]+)\s*million/i)
    : null;
  const threshold = match?.[1]
    ? Number(match[1].replaceAll(',', '')) * 1_000_000
    : null;
  return { facts, thresholdFact, threshold };
}

export function checkTaxRevenueWhatIf(
  profile: Profile,
  projectedSingaporeRevenue: number,
): WhatIfResult {
  const { facts, thresholdFact, threshold } = resolveGstThreshold(profile);

  if (!thresholdFact || threshold === null) {
    return WhatIfResultSchema.parse({
      kind: 'tax',
      status: 'review-needed',
      title: 'Tax scenario needs confirmation',
      summary:
        'The current knowledge base does not contain a machine-readable GST threshold.',
      details: ['Confirm the applicable GST registration test with IRAS.'],
      sources: uniqueSources(facts.regulatoryFacts),
    });
  }

  const aboveThreshold = projectedSingaporeRevenue > threshold;
  return WhatIfResultSchema.parse({
    kind: 'tax',
    status: aboveThreshold ? 'flag' : 'clear',
    title: aboveThreshold
      ? 'GST registration flag'
      : 'Below GST registration threshold',
    summary: aboveThreshold
      ? `Projected Singapore revenue of S$${projectedSingaporeRevenue.toLocaleString('en-SG')} is above the sourced GST registration threshold.`
      : `Projected Singapore revenue of S$${projectedSingaporeRevenue.toLocaleString('en-SG')} is not above the sourced GST registration threshold.`,
    details: [
      thresholdFact.description ?? String(thresholdFact.value),
      'This scenario does not estimate corporate tax payable because profit and chargeable-income inputs are not part of the profile.',
    ],
    sources: uniqueSources(facts.regulatoryFacts),
  });
}

const industryLabels: Partial<Record<Profile['industry'], string>> = {
  fnb: 'food & beverage',
  saas: 'B2B SaaS',
  fintech: 'fintech',
  retail: 'retail',
  'medical-devices': 'medical device',
};

function asNumber(value: RegulatoryFact['value']): number {
  return typeof value === 'number' ? value : Number(value);
}

function formatSgdMillions(value: number): string {
  return value >= 1_000_000
    ? `${(value / 1_000_000).toLocaleString('en-SG', { maximumFractionDigits: 2 })} million`
    : value.toLocaleString('en-SG');
}

export function buildSuggestedQuestions(profile: Profile): string[] {
  const questions: string[] = [];

  const { floor } = resolveSalaryFloor(profile);
  questions.push(
    floor === null
      ? 'What if we pay the applicant S$7,000 per month?'
      : `What if we pay the applicant S$${floor.toLocaleString('en-SG')} per month?`,
  );

  const smallFirmThreshold = asNumber(
    bundledKnowledge.compass.smallFirmPmetThreshold.value,
  );
  const currentTotalPmet = profile.foundersRelocating + profile.staffRelocating;
  const localPmetGuess = Math.round(smallFirmThreshold * 0.4);
  questions.push(
    `What changes if we grow from ${currentTotalPmet} to ${smallFirmThreshold} PMETs with ${localPmetGuess} local PMETs?`,
  );

  const { threshold } = resolveGstThreshold(profile);
  const currentRevenue = profile.projectedSingaporeRevenue;
  const revenueTarget =
    threshold === null
      ? null
      : currentRevenue < threshold
        ? threshold
        : Math.round((currentRevenue * 1.5) / 100_000) * 100_000;
  questions.push(
    revenueTarget === null
      ? 'What if projected Singapore revenue reaches S$1.2 million?'
      : `What if projected Singapore revenue grows from S$${formatSgdMillions(currentRevenue)} to S$${formatSgdMillions(revenueTarget)}?`,
  );

  const industryLabel = industryLabels[profile.industry];
  questions.push(
    industryLabel
      ? `Which licences are flagged for ${industryLabel} businesses?`
      : 'Which licences are flagged for this industry?',
  );

  return questions;
}

export function lookupProfileLicenses(profile: Profile): WhatIfResult {
  const facts = lookupLicenses(profile, bundledKnowledge);
  const sourceFacts = facts.items.flatMap((item) => item.regulatoryFacts);
  return WhatIfResultSchema.parse({
    kind: 'licenses',
    status: facts.items.some((item) => item.status === 'required')
      ? 'flag'
      : 'review-needed',
    title: 'Profile-industry licence lookup',
    summary: facts.items
      .map((item) => `${item.name}: ${item.status}.`)
      .join(' '),
    details: [
      'Exact licence requirements can depend on the specific business activity; use the linked government directory for final confirmation.',
    ],
    sources: uniqueSources(sourceFacts),
  });
}
