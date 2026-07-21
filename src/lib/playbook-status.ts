import type { PlaybookFacts } from '@/lib/schemas';
import type { Status } from '@/components/playbook/status-chip';

export type SectionKey =
  | 'entity'
  | 'visaCompass'
  | 'licenses'
  | 'taxIncentives'
  | 'banking'
  | 'timeline'
  | 'riskMatrix';

const sectionKeys: SectionKey[] = [
  'entity',
  'visaCompass',
  'licenses',
  'taxIncentives',
  'banking',
  'timeline',
  'riskMatrix',
];

export function getSectionStatus(
  key: SectionKey,
  facts: PlaybookFacts,
): Status {
  switch (key) {
    case 'entity':
    case 'taxIncentives':
    case 'banking':
    case 'timeline':
      return 'eligible';
    case 'visaCompass':
      if (facts.visaCompass.outcome === 'pass') return 'eligible';
      if (facts.visaCompass.outcome === 'likely-fail') return 'blocker';
      return 'not-applicable';
    case 'licenses':
      return facts.licenses.items.some(
        (item) => item.status === 'review-needed',
      )
        ? 'flag'
        : 'eligible';
    case 'riskMatrix':
      return facts.riskMatrix.risks.some((risk) => risk.impact === 'high')
        ? 'flag'
        : 'eligible';
  }
}

export function countSectionStatuses(facts: PlaybookFacts) {
  const statuses = sectionKeys.map((key) => getSectionStatus(key, facts));
  return {
    eligible: statuses.filter((status) => status === 'eligible').length,
    toReview: statuses.filter(
      (status) => status === 'flag' || status === 'blocker',
    ).length,
  };
}
