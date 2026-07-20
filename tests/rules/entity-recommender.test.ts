import { describe, expect, it } from "vitest";

import { EntityFactsSchema, bundledKnowledge, type EntityPurpose } from "@/lib/schemas";
import { recommendEntity } from "@/lib/rules/entity-recommender";

import { makeProfile } from "./test-helpers";

const ENTITY_PURPOSES: EntityPurpose[] = [
  "local-operations",
  "regional-hq",
  "holding-investment",
  "rd-ip-hub",
];

describe("recommendEntity", () => {
  for (const entityPurpose of ENTITY_PURPOSES) {
    it(`recommends a private company limited by shares for "${entityPurpose}"`, () => {
      const profile = makeProfile({ entityPurpose });
      const facts = recommendEntity(profile, bundledKnowledge);

      expect(() => EntityFactsSchema.parse(facts)).not.toThrow();
      expect(facts.recommendation.summary).toContain(
        "private company limited by shares",
      );
      expect(facts.alternatives).toHaveLength(0);
      expect(facts.regulatoryFacts.length).toBeGreaterThan(0);
    });
  }

  it("cites the qualifying EntrePass fact when evidence is provided", () => {
    const profile = makeProfile({
      entrePassEvidence: { hasVcBacking: true, hasIp: false, hasTrackRecord: false },
    });
    const facts = recommendEntity(profile, bundledKnowledge);

    expect(facts.regulatoryFacts.some((fact) => fact.id === "mom-entrepass-vc-funding")).toBe(
      true,
    );
    expect(facts.recommendation.summary).toContain("EntrePass");
  });

  it("omits EntrePass facts when no evidence is provided", () => {
    const profile = makeProfile();
    const facts = recommendEntity(profile, bundledKnowledge);

    expect(facts.regulatoryFacts.some((fact) => fact.id.startsWith("mom-entrepass"))).toBe(
      false,
    );
    expect(facts.recommendation.summary).not.toContain("EntrePass");
  });
});
