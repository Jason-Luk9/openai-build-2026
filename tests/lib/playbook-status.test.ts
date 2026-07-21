import { describe, expect, it } from 'vitest';

import { buildPlaybookFacts } from '@/lib/rules';
import { mockProfiles } from '@/lib/mock-profiles';
import {
  countSectionStatuses,
  getSectionStatus,
} from '@/lib/playbook-status';

describe('getSectionStatus', () => {
  it('marks entity, taxIncentives, banking, and timeline as always eligible', () => {
    const facts = buildPlaybookFacts(mockProfiles.vietstack);
    expect(getSectionStatus('entity', facts)).toBe('eligible');
    expect(getSectionStatus('taxIncentives', facts)).toBe('eligible');
    expect(getSectionStatus('banking', facts)).toBe('eligible');
    expect(getSectionStatus('timeline', facts)).toBe('eligible');
  });

  it('maps visaCompass outcome to a status', () => {
    const facts = buildPlaybookFacts(mockProfiles.vietstack);
    const expected =
      facts.visaCompass.outcome === 'pass'
        ? 'eligible'
        : facts.visaCompass.outcome === 'likely-fail'
          ? 'blocker'
          : 'not-applicable';
    expect(getSectionStatus('visaCompass', facts)).toBe(expected);
  });

  it('flags licenses when any item needs review', () => {
    const facts = buildPlaybookFacts(mockProfiles.vietstack);
    const expected = facts.licenses.items.some(
      (item) => item.status === 'review-needed',
    )
      ? 'flag'
      : 'eligible';
    expect(getSectionStatus('licenses', facts)).toBe(expected);
  });

  it('flags riskMatrix when any risk has high impact', () => {
    const facts = buildPlaybookFacts(mockProfiles['warung-digital']);
    const expected = facts.riskMatrix.risks.some(
      (risk) => risk.impact === 'high',
    )
      ? 'flag'
      : 'eligible';
    expect(getSectionStatus('riskMatrix', facts)).toBe(expected);
  });
});

describe('countSectionStatuses', () => {
  it('counts eligible and to-review sections across all seven keys', () => {
    const facts = buildPlaybookFacts(mockProfiles.payflip);
    const { eligible, toReview } = countSectionStatuses(facts);
    expect(eligible + toReview).toBeLessThanOrEqual(7);
    expect(eligible).toBeGreaterThanOrEqual(0);
    expect(toReview).toBeGreaterThanOrEqual(0);
  });
});
