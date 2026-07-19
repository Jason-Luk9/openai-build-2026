import type { BankingFacts, BundledKnowledge, Profile } from "@/lib/schemas";

const FOREIGN_OWNED_ACCOUNT_FACT_ID = "dbs-foreign-owned-company-account";

export function buildBankingFacts(
  profile: Profile,
  knowledge: BundledKnowledge,
): BankingFacts {
  const { commonRequirements, industryFlags } = knowledge.banking;
  const industryRequirements = industryFlags[profile.industry];
  const requirements = [...commonRequirements, ...industryRequirements];

  const foreignOwnedFact = commonRequirements.find(
    (fact) => fact.id === FOREIGN_OWNED_ACCOUNT_FACT_ID,
  );
  if (!foreignOwnedFact) {
    throw new Error(
      "Expected banking.commonRequirements to include the foreign-owned-company account fact.",
    );
  }

  const recommendations: BankingFacts["recommendations"] = [
    {
      summary:
        "Prepare ACRA incorporation documents and signatory identity/address verification ahead of time — foreign-owned companies undergo enhanced due diligence and a longer account-opening review.",
      sourceReferences: [
        { factId: foreignOwnedFact.id, source: foreignOwnedFact.source },
      ],
    },
  ];

  for (const fact of industryRequirements) {
    recommendations.push({
      summary: `${fact.description ?? fact.label} — verify current status via MAS's Financial Institutions Directory before opening an account.`,
      sourceReferences: [{ factId: fact.id, source: fact.source }],
    });
  }

  return { requirements, recommendations };
}
