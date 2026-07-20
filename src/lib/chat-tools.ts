import { tool } from 'ai';
import { z } from 'zod';

import type { Profile } from '@/lib/schemas';
import {
  checkHeadcountWhatIf,
  checkSalaryWhatIf,
  checkTaxRevenueWhatIf,
  HeadcountWhatIfInputSchema,
  lookupProfileLicenses,
  SalaryWhatIfInputSchema,
  TaxRevenueWhatIfInputSchema,
} from '@/lib/rules/what-if';

export function buildChatTools(profile: Profile) {
  return {
    checkSalaryCompass: tool({
      description:
        'Run a deterministic lower-bound Employment Pass salary check for the current profile industry. Do not describe this as an exact age-specific decision.',
      inputSchema: SalaryWhatIfInputSchema,
      execute: ({ monthlySalary }) => checkSalaryWhatIf(profile, monthlySalary),
    }),
    checkHeadcountCompass: tool({
      description:
        'Evaluate the sourced small-firm COMPASS treatment for a hypothetical total PMET and local PMET headcount.',
      inputSchema: HeadcountWhatIfInputSchema,
      execute: (input) => checkHeadcountWhatIf(profile, input),
    }),
    checkTaxRevenue: tool({
      description:
        'Check a hypothetical projected Singapore revenue against the sourced GST registration threshold and return applicable tax facts.',
      inputSchema: TaxRevenueWhatIfInputSchema,
      execute: ({ projectedSingaporeRevenue }) =>
        checkTaxRevenueWhatIf(profile, projectedSingaporeRevenue),
    }),
    lookupProfileLicences: tool({
      description:
        'Look up the current profile industry licence facts. Exact business-activity classification is not supported by this tool.',
      inputSchema: z.object({}).strict(),
      execute: () => lookupProfileLicenses(profile),
    }),
  };
}
