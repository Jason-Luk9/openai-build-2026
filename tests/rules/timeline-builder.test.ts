import { describe, expect, it } from "vitest";

import { TimelineFactsSchema, bundledKnowledge } from "@/lib/schemas";
import { buildTimeline } from "@/lib/rules/timeline-builder";

import { makeProfile } from "./test-helpers";

describe("buildTimeline", () => {
  it("always opens with incorporation in week 1", () => {
    const facts = buildTimeline(makeProfile(), bundledKnowledge);

    expect(() => TimelineFactsSchema.parse(facts)).not.toThrow();
    expect(facts.steps[0]).toMatchObject({ week: 1 });
    expect(facts.steps[0]?.action).toContain("incorporate");
  });

  it("adds a GST registration step only when revenue exceeds S$1,000,000", () => {
    const below = buildTimeline(
      makeProfile({ projectedSingaporeRevenue: 500000 }),
      bundledKnowledge,
    );
    const above = buildTimeline(
      makeProfile({ projectedSingaporeRevenue: 1500000 }),
      bundledKnowledge,
    );

    expect(below.steps.some((step) => step.action.includes("Register for GST"))).toBe(false);
    expect(above.steps.some((step) => step.action.includes("Register for GST"))).toBe(true);
  });

  it("adds an EntrePass step only when qualifying evidence is provided", () => {
    const withoutEvidence = buildTimeline(makeProfile(), bundledKnowledge);
    const withEvidence = buildTimeline(
      makeProfile({
        entrePassEvidence: { hasVcBacking: false, hasIp: true, hasTrackRecord: false },
      }),
      bundledKnowledge,
    );

    expect(withoutEvidence.steps.some((step) => step.action.includes("EntrePass"))).toBe(false);
    expect(withEvidence.steps.some((step) => step.action.includes("EntrePass"))).toBe(true);
  });

  it("adds an Employment Pass step only when staff are relocating", () => {
    const noStaff = buildTimeline(
      makeProfile({ staffRelocating: 0 }),
      bundledKnowledge,
    );
    const withStaff = buildTimeline(
      makeProfile({ staffRelocating: 3 }),
      bundledKnowledge,
    );

    expect(noStaff.steps.some((step) => step.action.includes("Employment Pass"))).toBe(false);
    expect(withStaff.steps.some((step) => step.action.includes("Employment Pass"))).toBe(true);
  });
});
