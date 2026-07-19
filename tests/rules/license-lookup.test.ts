import { describe, expect, it } from "vitest";

import { LicensesFactsSchema, bundledKnowledge, type Industry } from "@/lib/schemas";
import { lookupLicenses } from "@/lib/rules/license-lookup";

import { makeProfile } from "./test-helpers";

const INDUSTRIES: Industry[] = [
  "fnb",
  "saas",
  "fintech",
  "retail",
  "medical-devices",
  "generic",
];

describe("lookupLicenses", () => {
  for (const industry of INDUSTRIES) {
    it(`returns at least one licence item for "${industry}"`, () => {
      const facts = lookupLicenses(makeProfile({ industry }), bundledKnowledge);

      expect(() => LicensesFactsSchema.parse(facts)).not.toThrow();
      expect(facts.items.length).toBeGreaterThan(0);
    });
  }

  it("marks the F&B Food Shop Licence as required", () => {
    const facts = lookupLicenses(makeProfile({ industry: "fnb" }), bundledKnowledge);
    expect(facts.items[0]).toMatchObject({
      name: "Food Shop Licence",
      status: "required",
    });
  });

  it("marks the fintech Payment Services Act review as review-needed", () => {
    const facts = lookupLicenses(makeProfile({ industry: "fintech" }), bundledKnowledge);
    expect(facts.items[0]?.status).toBe("review-needed");
  });
});
