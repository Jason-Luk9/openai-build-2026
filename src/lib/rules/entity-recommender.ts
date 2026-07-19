import type {
  BundledKnowledge,
  EntityFacts,
  Profile,
  RegulatoryFact,
} from "@/lib/schemas";

const ENTREPASS_EVIDENCE_FACT_IDS: Record<
  "hasVcBacking" | "hasIp" | "hasTrackRecord",
  string
> = {
  hasVcBacking: "mom-entrepass-vc-funding",
  hasIp: "mom-entrepass-ip",
  hasTrackRecord: "mom-entrepass-track-record",
};

/**
 * PlaybookFactsSchema has no dedicated EntrePass section — EntrePass is
 * fundamentally about who may found/run the entity, so a founder's
 * qualifying evidence surfaces alongside the entity recommendation.
 */
export function findQualifyingEntrePassFacts(
  profile: Profile,
  knowledge: BundledKnowledge,
): RegulatoryFact[] {
  const qualifyingIds = (
    Object.keys(ENTREPASS_EVIDENCE_FACT_IDS) as Array<
      keyof typeof ENTREPASS_EVIDENCE_FACT_IDS
    >
  )
    .filter((key) => profile.entrePassEvidence[key])
    .map((key) => ENTREPASS_EVIDENCE_FACT_IDS[key]);

  return knowledge.entities.entrePassEligibility.filter((fact) =>
    qualifyingIds.includes(fact.id),
  );
}

export function recommendEntity(
  profile: Profile,
  knowledge: BundledKnowledge,
): EntityFacts {
  const entry = knowledge.entities.entities.find(
    (entity) => entity.purpose === profile.entityPurpose,
  );
  if (!entry) {
    throw new Error(
      `No entity knowledge for purpose "${profile.entityPurpose}".`,
    );
  }

  const entrePassFacts = findQualifyingEntrePassFacts(profile, knowledge);
  const regulatoryFacts = [...entry.facts, ...entrePassFacts];

  const summary =
    entrePassFacts.length > 0
      ? `Incorporate a ${entry.recommendation.toLowerCase()}. The founder(s) also qualify for an EntrePass on the innovator track based on the evidence provided.`
      : `Incorporate a ${entry.recommendation.toLowerCase()}.`;

  return {
    recommendation: {
      summary,
      sourceReferences: regulatoryFacts.map((fact) => ({
        factId: fact.id,
        source: fact.source,
      })),
    },
    alternatives: [],
    regulatoryFacts,
  };
}
