import { describe, expect, it } from "vitest";

import { BankingFactsSchema, bundledKnowledge } from "@/lib/schemas";
import { buildBankingFacts } from "@/lib/rules/banking-advisor";

import { makeProfile } from "./test-helpers";

describe("buildBankingFacts", () => {
  it("always includes the foreign-owned-company account requirement", () => {
    const facts = buildBankingFacts(makeProfile({ industry: "saas" }), bundledKnowledge);

    expect(() => BankingFactsSchema.parse(facts)).not.toThrow();
    expect(facts.requirements.some((fact) => fact.id === "dbs-foreign-owned-company-account")).toBe(
      true,
    );
  });

  it("adds the fintech licensing-check requirement only for fintech", () => {
    const fintechFacts = buildBankingFacts(makeProfile({ industry: "fintech" }), bundledKnowledge);
    const saasFacts = buildBankingFacts(makeProfile({ industry: "saas" }), bundledKnowledge);

    expect(
      fintechFacts.requirements.some((fact) => fact.id === "mas-fintech-licence-verification"),
    ).toBe(true);
    expect(
      saasFacts.requirements.some((fact) => fact.id === "mas-fintech-licence-verification"),
    ).toBe(false);
  });
});
