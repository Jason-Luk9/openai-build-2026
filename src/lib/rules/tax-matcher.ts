import type { BundledKnowledge, Profile, TaxIncentivesFacts } from "@/lib/schemas";

const DEI_FACT_ID = "edb-development-expansion-incentive";
const DEI_ELIGIBLE_PURPOSES: ReadonlySet<Profile["entityPurpose"]> = new Set([
  "regional-hq",
  "rd-ip-hub",
]);

export function matchTaxIncentives(
  profile: Profile,
  knowledge: BundledKnowledge,
): TaxIncentivesFacts {
  const { globalRules, industryOpportunities } = knowledge.taxIncentives;

  const opportunities: TaxIncentivesFacts["opportunities"] = [];

  const deiFact = globalRules.find((fact) => fact.id === DEI_FACT_ID);
  if (deiFact && DEI_ELIGIBLE_PURPOSES.has(profile.entityPurpose)) {
    opportunities.push({
      summary:
        "Apply to EDB for the Development and Expansion Incentive to secure a concessionary 5-15% tax rate on qualifying regional/global HQ income once operations are established. Approval is discretionary, not automatic.",
      sourceReferences: [{ factId: deiFact.id, source: deiFact.source }],
    });
  }

  for (const fact of industryOpportunities[profile.industry]) {
    opportunities.push({
      summary: fact.description ?? fact.label,
      sourceReferences: [{ factId: fact.id, source: fact.source }],
    });
  }

  return {
    regulatoryFacts: globalRules,
    opportunities,
  };
}
