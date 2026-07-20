import { describe, expect, it } from "vitest";

import { VisaCompassFactsSchema, bundledKnowledge } from "@/lib/schemas";
import { scoreCompass } from "@/lib/rules/compass-scorer";

import { makeProfile } from "./test-helpers";

describe("scoreCompass", () => {
  it("defaults C3/C4 to the neutral score for a small firm (< 25 relocating PMETs)", () => {
    const profile = makeProfile({ foundersRelocating: 2, staffRelocating: 8 });
    const facts = scoreCompass(profile, bundledKnowledge);

    expect(() => VisaCompassFactsSchema.parse(facts)).not.toThrow();
    expect(facts.isSmallFirm).toBe(true);

    const c3 = facts.criteria.find((criterion) => criterion.id === "C3");
    const c4 = facts.criteria.find((criterion) => criterion.id === "C4");
    expect(c3).toMatchObject({ score: 10, neutralBySmallFirmRule: true });
    expect(c4).toMatchObject({ score: 10, neutralBySmallFirmRule: true });
  });

  it("does not default C3/C4 for a firm at or above the 25-PMET threshold", () => {
    const profile = makeProfile({ foundersRelocating: 5, staffRelocating: 20 });
    const facts = scoreCompass(profile, bundledKnowledge);

    expect(facts.isSmallFirm).toBe(false);
    const c3 = facts.criteria.find((criterion) => criterion.id === "C3");
    const c4 = facts.criteria.find((criterion) => criterion.id === "C4");
    expect(c3).toMatchObject({ score: 0, neutralBySmallFirmRule: false });
    expect(c4).toMatchObject({ score: 0, neutralBySmallFirmRule: false });
  });

  it("passes when the total score is at or above the 40-point threshold", () => {
    const profile = makeProfile({ foundersRelocating: 1, staffRelocating: 1 });
    const facts = scoreCompass(profile, bundledKnowledge);

    expect(facts.totalScore).toBeGreaterThanOrEqual(40);
    expect(facts.outcome).toBe("pass");
  });

  it("is not-applicable when no staff are relocating (no Employment Pass applicant)", () => {
    const profile = makeProfile({ foundersRelocating: 2, staffRelocating: 0 });
    const facts = scoreCompass(profile, bundledKnowledge);

    expect(facts.outcome).toBe("not-applicable");
  });

  it("cites the financial-services salary floor for fintech and the general floor otherwise", () => {
    const fintechFacts = scoreCompass(makeProfile({ industry: "fintech" }), bundledKnowledge);
    const saasFacts = scoreCompass(makeProfile({ industry: "saas" }), bundledKnowledge);

    const fintechC1 = fintechFacts.criteria.find((criterion) => criterion.id === "C1");
    const saasC1 = saasFacts.criteria.find((criterion) => criterion.id === "C1");

    expect(
      fintechC1?.regulatoryFacts.some(
        (fact) => fact.id === "mom-ep-salary-floor-financial-services",
      ),
    ).toBe(true);
    expect(
      saasC1?.regulatoryFacts.some((fact) => fact.id === "mom-ep-salary-floor-general"),
    ).toBe(true);
  });
});
