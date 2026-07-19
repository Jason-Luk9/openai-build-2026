import { describe, expect, it } from "vitest";

import { RiskMatrixFactsSchema, bundledKnowledge } from "@/lib/schemas";
import { assessRisks } from "@/lib/rules/risk-assessor";

import { makeProfile } from "./test-helpers";

describe("assessRisks", () => {
  it("always includes the bank account opening delay risk", () => {
    const facts = assessRisks(makeProfile(), bundledKnowledge);

    expect(() => RiskMatrixFactsSchema.parse(facts)).not.toThrow();
    expect(facts.risks.some((risk) => risk.title === "Bank account opening delay")).toBe(true);
  });

  it("flags MAS licensing risk only for fintech", () => {
    const fintech = assessRisks(makeProfile({ industry: "fintech" }), bundledKnowledge);
    const saas = assessRisks(makeProfile({ industry: "saas" }), bundledKnowledge);

    expect(fintech.risks.some((risk) => risk.title.includes("MAS licensing"))).toBe(true);
    expect(saas.risks.some((risk) => risk.title.includes("MAS licensing"))).toBe(false);
  });

  it("flags the COMPASS small-firm risk only when there's an EP applicant below the threshold", () => {
    const smallFirmWithStaff = assessRisks(
      makeProfile({ foundersRelocating: 2, staffRelocating: 3 }),
      bundledKnowledge,
    );
    const noStaff = assessRisks(
      makeProfile({ foundersRelocating: 2, staffRelocating: 0 }),
      bundledKnowledge,
    );
    const largeFirm = assessRisks(
      makeProfile({ foundersRelocating: 5, staffRelocating: 25 }),
      bundledKnowledge,
    );

    expect(smallFirmWithStaff.risks.some((risk) => risk.title.includes("crosses 25 PMETs"))).toBe(
      true,
    );
    expect(noStaff.risks.some((risk) => risk.title.includes("crosses 25 PMETs"))).toBe(false);
    expect(largeFirm.risks.some((risk) => risk.title.includes("crosses 25 PMETs"))).toBe(false);
  });

  it("flags GST non-compliance risk only when revenue exceeds S$1,000,000", () => {
    const below = assessRisks(
      makeProfile({ projectedSingaporeRevenue: 500000 }),
      bundledKnowledge,
    );
    const above = assessRisks(
      makeProfile({ projectedSingaporeRevenue: 1500000 }),
      bundledKnowledge,
    );

    expect(below.risks.some((risk) => risk.title === "GST registration non-compliance")).toBe(
      false,
    );
    expect(above.risks.some((risk) => risk.title === "GST registration non-compliance")).toBe(
      true,
    );
  });
});
