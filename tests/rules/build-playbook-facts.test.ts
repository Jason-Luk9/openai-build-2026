import { describe, expect, it } from "vitest";

import { PlaybookFactsSchema } from "@/lib/schemas";
import { buildPlaybookFacts } from "@/lib/rules";
import { mockProfileIds, mockProfiles } from "@/lib/mock-profiles";

describe("buildPlaybookFacts", () => {
  for (const id of mockProfileIds) {
    it(`produces valid, non-empty facts across all 7 sections for "${id}"`, () => {
      const facts = buildPlaybookFacts(mockProfiles[id]);

      expect(() => PlaybookFactsSchema.parse(facts)).not.toThrow();

      expect(facts.entity.regulatoryFacts.length).toBeGreaterThan(0);
      expect(facts.visaCompass.regulatoryFacts.length).toBeGreaterThan(0);
      expect(facts.licenses.items.length).toBeGreaterThan(0);
      expect(facts.taxIncentives.regulatoryFacts.length).toBeGreaterThan(0);
      expect(facts.banking.requirements.length).toBeGreaterThan(0);
      expect(facts.timeline.steps.length).toBeGreaterThan(0);
      expect(facts.riskMatrix.risks.length).toBeGreaterThan(0);
    });
  }
});
