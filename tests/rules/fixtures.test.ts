import { describe, expect, it } from "vitest";

import { NarrativesSchema } from "@/lib/schemas";
import { buildPlaybookFacts } from "@/lib/rules";
import { mockProfileIds, mockProfiles, type MockProfileId } from "@/lib/mock-profiles";

import payflipFixture from "@/lib/fixtures/payflip.json";
import vietstackFixture from "@/lib/fixtures/vietstack.json";
import warungDigitalFixture from "@/lib/fixtures/warung-digital.json";

const fixturesById: Record<MockProfileId, unknown> = {
  "warung-digital": warungDigitalFixture,
  vietstack: vietstackFixture,
  payflip: payflipFixture,
};

/**
 * Pulls out currency amounts, percentages, and other multi-digit numbers
 * from narrative prose, ignoring small structural numbers (week/criterion
 * labels like "week 1" or "C5") that aren't regulatory claims.
 */
function extractClaimedNumbers(text: string): string[] {
  const matches = text.match(/(?<![A-Za-z])(?:S\$)?\d[\d,]*(?:\.\d+)?%?/g) ?? [];
  return matches
    .map((match) => match.replace(/^S\$/, "").replace(/%$/, "").replace(/,/g, ""))
    .filter((match) => Number(match) >= 3);
}

describe("narrative fixtures", () => {
  for (const id of mockProfileIds) {
    const fixture = fixturesById[id];

    it(`${id} fixture validates against NarrativesSchema`, () => {
      expect(() => NarrativesSchema.parse(fixture)).not.toThrow();
    });

    it(`${id} fixture doesn't introduce numbers absent from its computed facts`, () => {
      const narratives = NarrativesSchema.parse(fixture);
      const facts = buildPlaybookFacts(mockProfiles[id]);
      const groundTruth = (
        JSON.stringify(facts) + JSON.stringify(mockProfiles[id])
      ).replace(/,/g, "");

      for (const section of Object.values(narratives)) {
        const text = [section.summary, section.callout, ...section.nextSteps]
          .filter((value): value is string => Boolean(value))
          .join(" ");

        for (const number of extractClaimedNumbers(text)) {
          expect(
            groundTruth.includes(number),
            `expected "${number}" (from: "${text}") to trace back to a fact or profile input`,
          ).toBe(true);
        }
      }
    });
  }
});
