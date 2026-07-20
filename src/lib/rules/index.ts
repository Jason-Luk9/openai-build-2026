import {
  bundledKnowledge,
  type PlaybookFacts,
  type Profile,
} from '@/lib/schemas';

import { buildBankingFacts } from './banking-advisor';
import { recommendEntity } from './entity-recommender';
import { lookupLicenses } from './license-lookup';
import { assessRisks } from './risk-assessor';
import { scoreCompass } from './compass-scorer';
import { matchTaxIncentives } from './tax-matcher';
import { buildTimeline } from './timeline-builder';
import {
  checkHeadcountWhatIf,
  checkSalaryWhatIf,
  checkTaxRevenueWhatIf,
  lookupProfileLicenses,
} from './what-if';

export function buildPlaybookFacts(profile: Profile): PlaybookFacts {
  return {
    entity: recommendEntity(profile, bundledKnowledge),
    visaCompass: scoreCompass(profile, bundledKnowledge),
    licenses: lookupLicenses(profile, bundledKnowledge),
    taxIncentives: matchTaxIncentives(profile, bundledKnowledge),
    banking: buildBankingFacts(profile, bundledKnowledge),
    timeline: buildTimeline(profile, bundledKnowledge),
    riskMatrix: assessRisks(profile, bundledKnowledge),
  };
}

export {
  assessRisks,
  buildBankingFacts,
  buildTimeline,
  lookupLicenses,
  matchTaxIncentives,
  recommendEntity,
  scoreCompass,
  checkHeadcountWhatIf,
  checkSalaryWhatIf,
  checkTaxRevenueWhatIf,
  lookupProfileLicenses,
};
