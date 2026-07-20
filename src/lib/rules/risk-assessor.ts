import type { BundledKnowledge, Profile, RiskMatrixFacts } from "@/lib/schemas";

const GST_REGISTRATION_THRESHOLD = 1_000_000;

function asNumber(value: string | number | boolean): number {
  return typeof value === "number" ? value : Number(value);
}

export function assessRisks(
  profile: Profile,
  knowledge: BundledKnowledge,
): RiskMatrixFacts {
  const risks: RiskMatrixFacts["risks"] = [];

  const foreignOwnedFact = knowledge.banking.commonRequirements.find(
    (fact) => fact.id === "dbs-foreign-owned-company-account",
  );
  if (foreignOwnedFact) {
    risks.push({
      title: "Bank account opening delay",
      likelihood: "medium",
      impact: "medium",
      mitigation:
        "Prepare ACRA incorporation documents and signatory identity/address verification before approaching banks, since foreign-owned companies undergo enhanced due diligence.",
      sourceReferences: [
        { factId: foreignOwnedFact.id, source: foreignOwnedFact.source },
      ],
    });
  }

  if (profile.industry === "fintech") {
    const fintechFact = knowledge.banking.industryFlags.fintech.find(
      (fact) => fact.id === "mas-fintech-licence-verification",
    );
    const licenceFact = knowledge.licenses.industries.fintech[0]?.facts[0];
    if (fintechFact) {
      risks.push({
        title: "MAS licensing delay or rejection",
        likelihood: "high",
        impact: "high",
        mitigation:
          "Engage MAS's licensing assessment process early and confirm the licence category (Standard vs Major Payment Institution) before committing to a launch date.",
        sourceReferences: [
          { factId: fintechFact.id, source: fintechFact.source },
          ...(licenceFact
            ? [{ factId: licenceFact.id, source: licenceFact.source }]
            : []),
        ],
      });
    }
  }

  const totalRelocatingHeadcount =
    profile.foundersRelocating + profile.staffRelocating;
  const smallFirmThreshold = asNumber(
    knowledge.compass.smallFirmPmetThreshold.value,
  );
  if (totalRelocatingHeadcount < smallFirmThreshold && profile.staffRelocating > 0) {
    risks.push({
      title: "COMPASS diversity flag once the firm crosses 25 PMETs",
      likelihood: "low",
      impact: "medium",
      mitigation:
        "The neutral C3/C4 scoring only applies below the small-firm PMET threshold. As headcount grows past it, plan nationality diversity and local-hiring support ahead of time so future Employment Pass applications don't lose points.",
      sourceReferences: [
        {
          factId: knowledge.compass.smallFirmPmetThreshold.id,
          source: knowledge.compass.smallFirmPmetThreshold.source,
        },
        {
          factId: knowledge.compass.smallFirmNeutralScore.id,
          source: knowledge.compass.smallFirmNeutralScore.source,
        },
      ],
    });
  }

  if (profile.projectedSingaporeRevenue > GST_REGISTRATION_THRESHOLD) {
    const gstThresholdFact = knowledge.taxIncentives.globalRules.find(
      (fact) => fact.id === "iras-gst-registration-threshold",
    );
    if (gstThresholdFact) {
      risks.push({
        title: "GST registration non-compliance",
        likelihood: "medium",
        impact: "medium",
        mitigation:
          "Projected revenue exceeds the S$1 million GST threshold — register with IRAS ahead of time to avoid late-registration penalties.",
        sourceReferences: [
          { factId: gstThresholdFact.id, source: gstThresholdFact.source },
        ],
      });
    }
  }

  return { risks };
}
