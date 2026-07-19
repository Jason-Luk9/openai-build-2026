import { describe, expect, it } from "vitest";

import { TaxIncentivesFactsSchema, bundledKnowledge } from "@/lib/schemas";
import { matchTaxIncentives } from "@/lib/rules/tax-matcher";

import { makeProfile } from "./test-helpers";

describe("matchTaxIncentives", () => {
  it("always cites the universal global-rule facts", () => {
    const facts = matchTaxIncentives(makeProfile(), bundledKnowledge);

    expect(() => TaxIncentivesFactsSchema.parse(facts)).not.toThrow();
    expect(facts.regulatoryFacts.map((fact) => fact.id)).toEqual(
      expect.arrayContaining([
        "iras-corporate-tax-rate",
        "iras-gst-rate",
        "iras-startup-tax-exemption",
        "iras-gst-registration-threshold",
      ]),
    );
  });

  it("surfaces the DEI opportunity for regional-hq and rd-ip-hub purposes", () => {
    const regionalHq = matchTaxIncentives(
      makeProfile({ entityPurpose: "regional-hq" }),
      bundledKnowledge,
    );
    const rdIpHub = matchTaxIncentives(
      makeProfile({ entityPurpose: "rd-ip-hub" }),
      bundledKnowledge,
    );

    for (const facts of [regionalHq, rdIpHub]) {
      expect(
        facts.opportunities.some((opportunity) =>
          opportunity.sourceReferences.some(
            (ref) => ref.factId === "edb-development-expansion-incentive",
          ),
        ),
      ).toBe(true);
    }
  });

  it("does not surface the DEI opportunity for local-operations or holding-investment purposes", () => {
    const localOps = matchTaxIncentives(
      makeProfile({ entityPurpose: "local-operations" }),
      bundledKnowledge,
    );
    const holding = matchTaxIncentives(
      makeProfile({ entityPurpose: "holding-investment" }),
      bundledKnowledge,
    );

    for (const facts of [localOps, holding]) {
      expect(
        facts.opportunities.some((opportunity) =>
          opportunity.sourceReferences.some(
            (ref) => ref.factId === "edb-development-expansion-incentive",
          ),
        ),
      ).toBe(false);
    }
  });
});
