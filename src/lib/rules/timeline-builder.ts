import type { BundledKnowledge, Profile, TimelineFacts } from "@/lib/schemas";

import { findQualifyingEntrePassFacts } from "./entity-recommender";

const GST_REGISTRATION_THRESHOLD = 1_000_000;

export function buildTimeline(
  profile: Profile,
  knowledge: BundledKnowledge,
): TimelineFacts {
  const entityEntry = knowledge.entities.entities.find(
    (entity) => entity.purpose === profile.entityPurpose,
  );
  const bankingFact = knowledge.banking.commonRequirements.find(
    (fact) => fact.id === "dbs-foreign-owned-company-account",
  );
  const gstThresholdFact = knowledge.taxIncentives.globalRules.find(
    (fact) => fact.id === "iras-gst-registration-threshold",
  );

  if (!entityEntry || !bankingFact || !gstThresholdFact) {
    throw new Error(
      "Expected the knowledge base to include the facts timeline-builder depends on.",
    );
  }

  const entityFact = entityEntry.facts[0];
  if (!entityFact) {
    throw new Error(
      `Expected at least one fact for entity purpose "${profile.entityPurpose}".`,
    );
  }

  const steps: TimelineFacts["steps"] = [
    {
      week: 1,
      action: `Reserve the company name and incorporate a ${entityEntry.recommendation.toLowerCase()} with ACRA.`,
      sourceReferences: [{ factId: entityFact.id, source: entityFact.source }],
    },
  ];

  for (const item of knowledge.licenses.industries[profile.industry]) {
    const fact = item.facts[0];
    if (!fact) continue;
    steps.push({
      week: 2,
      action: `Apply for the ${item.name}.`,
      sourceReferences: [{ factId: fact.id, source: fact.source }],
    });
  }

  steps.push({
    week: 3,
    action:
      "Open a corporate bank account, allowing extra time for foreign-owned-company due diligence.",
    sourceReferences: [{ factId: bankingFact.id, source: bankingFact.source }],
  });

  const entrePassFacts = findQualifyingEntrePassFacts(profile, knowledge);
  if (entrePassFacts.length > 0) {
    steps.push({
      week: 4,
      action: "Submit the EntrePass application with supporting evidence.",
      sourceReferences: entrePassFacts.map((fact) => ({
        factId: fact.id,
        source: fact.source,
      })),
    });
  }

  if (profile.staffRelocating > 0) {
    steps.push({
      week: 4,
      action:
        "Submit Employment Pass application(s) for relocating staff under COMPASS.",
      sourceReferences: [
        {
          factId: knowledge.compass.passThreshold.id,
          source: knowledge.compass.passThreshold.source,
        },
      ],
    });
  }

  if (profile.projectedSingaporeRevenue > GST_REGISTRATION_THRESHOLD) {
    steps.push({
      week: 6,
      action:
        "Register for GST ahead of crossing the S$1 million taxable-turnover threshold.",
      sourceReferences: [
        { factId: gstThresholdFact.id, source: gstThresholdFact.source },
      ],
    });
  }

  return { steps };
}
