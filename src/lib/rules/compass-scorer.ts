import type {
  BundledKnowledge,
  CompassCriterionFacts,
  Profile,
  RegulatoryFact,
  VisaCompassFacts,
} from "@/lib/schemas";

/**
 * compass.json only carries prose descriptions for C1/C2/C5/C6 (no numeric
 * point tables), and Profile's intake fields carry no candidate salary, age,
 * qualifications, or shortage-occupation status. These are scored against a
 * fixed "qualifying benchmark" assumption instead — the assessment text
 * below states that assumption explicitly rather than presenting it as a
 * verified fact.
 */
const QUALIFYING_BENCHMARK_SCORES: Record<"C1" | "C2" | "C5" | "C6", number> = {
  C1: 20,
  C2: 10,
  C5: 0,
  C6: 0,
};

const QUALIFYING_BENCHMARK_ASSESSMENTS: Record<
  "C1" | "C2" | "C5" | "C6",
  string
> = {
  C1: "Assumes the Employment Pass applicant's offered salary is at least at the qualifying floor for the sector — confirm the actual offered salary before applying.",
  C2: "Assumes the applicant holds a recognised degree — confirm the applicant's actual qualifications before applying.",
  C5: "Assumes the role is not on the Shortage Occupation List — recheck against the current list before applying.",
  C6: "Assumes the company does not yet qualify for the Strategic Economic Priorities bonus — reassess once the company's SEP eligibility is confirmed.",
};

function asNumber(value: RegulatoryFact["value"]): number {
  return typeof value === "number" ? value : Number(value);
}

export function scoreCompass(
  profile: Profile,
  knowledge: BundledKnowledge,
): VisaCompassFacts {
  const { compass } = knowledge;
  const totalRelocatingHeadcount =
    profile.foundersRelocating + profile.staffRelocating;
  const smallFirmThreshold = asNumber(compass.smallFirmPmetThreshold.value);
  const smallFirmNeutralScore = asNumber(compass.smallFirmNeutralScore.value);
  const isSmallFirm = totalRelocatingHeadcount < smallFirmThreshold;

  const financialServicesContext = compass.salaryContexts.find(
    (context) => context.context === "financial-services",
  );
  const nonFinancialServicesContext = compass.salaryContexts.find(
    (context) => context.context === "non-financial-services",
  );
  const salaryContextFacts =
    (profile.industry === "fintech"
      ? financialServicesContext?.facts
      : nonFinancialServicesContext?.facts) ?? [];

  const criteria: CompassCriterionFacts[] = compass.criteria.map(
    (criterion): CompassCriterionFacts => {
      if (criterion.id === "C3" || criterion.id === "C4") {
        const score = isSmallFirm ? smallFirmNeutralScore : 0;
        const assessment = isSmallFirm
          ? `Below the ${smallFirmThreshold}-PMET small-firm threshold (${totalRelocatingHeadcount} relocating PMETs), so ${criterion.id} defaults to a neutral ${score}-point score instead of being assessed directly.`
          : `At or above the ${smallFirmThreshold}-PMET small-firm threshold (${totalRelocatingHeadcount} relocating PMETs), so ${criterion.id} is assessed directly rather than defaulted — the actual diversity/local-hiring facts still need review, shown here as a conservative 0 pending that review.`;

        return {
          id: criterion.id,
          label: criterion.name,
          score,
          maximumScore: 20,
          assessment,
          neutralBySmallFirmRule: isSmallFirm,
          regulatoryFacts: criterion.facts,
        };
      }

      const key = criterion.id;
      const regulatoryFacts =
        key === "C1" ? [...criterion.facts, ...salaryContextFacts] : criterion.facts;

      return {
        id: key,
        label: criterion.name,
        score: QUALIFYING_BENCHMARK_SCORES[key],
        maximumScore: 20,
        assessment: QUALIFYING_BENCHMARK_ASSESSMENTS[key],
        regulatoryFacts,
      };
    },
  );

  const totalScore = criteria.reduce((sum, criterion) => sum + criterion.score, 0);
  const passThreshold = asNumber(compass.passThreshold.value);

  const outcome: VisaCompassFacts["outcome"] =
    profile.staffRelocating === 0
      ? "not-applicable"
      : totalScore >= passThreshold
        ? "pass"
        : "likely-fail";

  return {
    isSmallFirm,
    passThreshold: 40,
    totalScore,
    outcome,
    criteria,
    regulatoryFacts: [
      compass.passThreshold,
      compass.smallFirmPmetThreshold,
      compass.smallFirmNeutralScore,
    ],
  };
}
