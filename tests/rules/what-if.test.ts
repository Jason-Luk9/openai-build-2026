import { describe, expect, it } from 'vitest';

import { mockProfiles } from '@/lib/mock-profiles';
import {
  checkHeadcountWhatIf,
  checkSalaryWhatIf,
  checkTaxRevenueWhatIf,
  HeadcountWhatIfInputSchema,
  lookupProfileLicenses,
} from '@/lib/rules/what-if';

describe('what-if rules', () => {
  it('performs a sourced lower-bound salary check without claiming exact COMPASS scoring', () => {
    const result = checkSalaryWhatIf(mockProfiles.vietstack, 5_000);

    expect(result.status).toBe('flag');
    expect(result.summary).toContain('below');
    expect(result.details.join(' ')).toContain('lower-bound check');
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it('keeps an above-floor salary result in review-needed status because age-specific data is absent', () => {
    const result = checkSalaryWhatIf(mockProfiles.payflip, 7_000);

    expect(result.status).toBe('review-needed');
    expect(result.details.join(' ')).toContain('age-specific');
  });

  it('applies the neutral small-firm treatment below the sourced threshold', () => {
    const result = checkHeadcountWhatIf(mockProfiles.vietstack, {
      totalPmet: 24,
      localPmet: 10,
    });

    expect(result.status).toBe('clear');
    expect(result.summary).toContain('small-firm rule applies');
  });

  it('refuses to invent workforce scores at or above the threshold', () => {
    const result = checkHeadcountWhatIf(mockProfiles.vietstack, {
      totalPmet: 25,
      localPmet: 10,
    });

    expect(result.status).toBe('review-needed');
    expect(result.details.join(' ')).toContain(
      'no hypothetical score is invented',
    );
  });

  it('rejects local headcount greater than total headcount', () => {
    expect(() =>
      HeadcountWhatIfInputSchema.parse({ totalPmet: 3, localPmet: 4 }),
    ).toThrow();
  });

  it('checks the sourced GST threshold without estimating tax payable', () => {
    const result = checkTaxRevenueWhatIf(mockProfiles.vietstack, 1_200_000);

    expect(result.status).toBe('flag');
    expect(result.details.join(' ')).toContain(
      'does not estimate corporate tax payable',
    );
  });

  it.each(Object.values(mockProfiles))(
    'looks up profile-industry licences for %s',
    (profile) => {
      const result = lookupProfileLicenses(profile);

      expect(result.kind).toBe('licenses');
      expect(result.sources.length).toBeGreaterThan(0);
    },
  );
});
