import { z } from "zod";

import bankingJson from "@/lib/knowledge/banking.json";
import compassJson from "@/lib/knowledge/compass.json";
import countryContextJson from "@/lib/knowledge/country-context.json";
import entitiesJson from "@/lib/knowledge/entities.json";
import licensesJson from "@/lib/knowledge/licenses.json";
import taxIncentivesJson from "@/lib/knowledge/tax-incentives.json";

const nonEmptyText = (field: string) =>
  z.string({ error: `Enter ${field}.` }).trim().min(1, `Enter ${field}.`);

const evidenceDetailSchema = z
  .string({ error: "Supporting details must be text." })
  .trim()
  .min(3, "Supporting details must be at least 3 characters.")
  .max(500, "Supporting details must be 500 characters or fewer.")
  .refine(
    (value) => !/(?:https?:\/\/|www\.)/i.test(value),
    "Do not include links in supporting details.",
  )
  .refine(
    (value) => !/\b[\w-]+\.(?:pdf|doc|docx|png|jpe?g)\b/i.test(value),
    "Do not include document references in supporting details.",
  );

export const HomeCountrySchema = z.enum(
  [
    "brunei",
    "cambodia",
    "indonesia",
    "laos",
    "malaysia",
    "myanmar",
    "philippines",
    "thailand",
    "vietnam",
  ],
  { error: "Choose your ASEAN home country." },
);

export const IndustrySchema = z.enum(
  ["fnb", "saas", "fintech", "retail", "medical-devices", "generic"],
  { error: "Choose the industry that best describes your business." },
);

export const EntityPurposeSchema = z.enum(
  ["local-operations", "regional-hq", "holding-investment", "rd-ip-hub"],
  { error: "Choose what you want the Singapore entity to do." },
);

export const EntrePassEvidenceSchema = z
  .object({
    hasVcBacking: z.boolean({
      error: "Tell us whether you have qualifying VC backing.",
    }),
    vcBackingDetails: evidenceDetailSchema.optional(),
    hasIp: z.boolean({
      error: "Tell us whether you have qualifying intellectual property.",
    }),
    ipDetails: evidenceDetailSchema.optional(),
    hasTrackRecord: z.boolean({
      error:
        "Tell us whether you have a qualifying entrepreneurial track record.",
    }),
    trackRecordDetails: evidenceDetailSchema.optional(),
  })
  .strict();

export const ProfileSchema = z
  .object({
    homeCountry: HomeCountrySchema,
    industry: IndustrySchema,
    entityPurpose: EntityPurposeSchema,
    foundersRelocating: z
      .number({ error: "Enter the number of founders relocating." })
      .int("Founder count must be a whole number.")
      .nonnegative("Founder count cannot be negative."),
    staffRelocating: z
      .number({ error: "Enter the number of staff relocating." })
      .int("Staff count must be a whole number.")
      .nonnegative("Staff count cannot be negative."),
    projectedSingaporeRevenue: z
      .number({ error: "Enter projected Singapore revenue in S$." })
      .finite("Projected Singapore revenue must be a valid amount.")
      .nonnegative("Projected Singapore revenue cannot be negative."),
    entrePassEvidence: EntrePassEvidenceSchema,
  })
  .strict();

export const SourceSchema = z
  .object({
    url: z.url({ error: "A regulatory source must have a valid URL." }),
    lastVerified: z.iso.date({
      error: "A regulatory source must have a YYYY-MM-DD verification date.",
    }),
  })
  .strict();

export const SourceReferenceSchema = z
  .object({
    factId: nonEmptyText("a source fact ID"),
    source: SourceSchema,
  })
  .strict();

export const RegulatoryFactSchema = z
  .object({
    id: nonEmptyText("a fact ID"),
    label: nonEmptyText("a fact label"),
    value: z.union([z.string(), z.number(), z.boolean()]),
    description: z.string().trim().min(1).max(600).optional(),
    source: SourceSchema,
  })
  .strict();

const DerivedRecommendationSchema = z
  .object({
    summary: nonEmptyText("a recommendation"),
    sourceReferences: z
      .array(SourceReferenceSchema)
      .min(1, "A recommendation must identify its source facts."),
  })
  .strict();

export const EntityFactsSchema = z
  .object({
    recommendation: DerivedRecommendationSchema,
    alternatives: z.array(DerivedRecommendationSchema).max(3),
    regulatoryFacts: z.array(RegulatoryFactSchema).min(1),
  })
  .strict();

const StandardCompassCriterionFactsSchema = z
  .object({
    id: z.enum(["C1", "C2", "C5", "C6"]),
    label: nonEmptyText("a COMPASS criterion label"),
    score: z.number().int().min(0).max(20),
    maximumScore: z.number().int().min(0).max(20),
    assessment: nonEmptyText("a COMPASS assessment"),
    regulatoryFacts: z.array(RegulatoryFactSchema).min(1),
  })
  .strict();

const FirmCompassCriterionFactsSchema = z
  .object({
    id: z.enum(["C3", "C4"]),
    label: nonEmptyText("a COMPASS criterion label"),
    score: z.number().int().min(0).max(20),
    maximumScore: z.literal(20),
    assessment: nonEmptyText("a COMPASS assessment"),
    neutralBySmallFirmRule: z.boolean(),
    regulatoryFacts: z.array(RegulatoryFactSchema).min(1),
  })
  .strict();

export const CompassCriterionFactsSchema = z.union([
  StandardCompassCriterionFactsSchema,
  FirmCompassCriterionFactsSchema,
]);

export const VisaCompassFactsSchema = z
  .object({
    isSmallFirm: z.boolean(),
    passThreshold: z.literal(40),
    totalScore: z.number().int().min(0).max(80),
    outcome: z.enum(["pass", "likely-fail", "not-applicable"]),
    criteria: z.array(CompassCriterionFactsSchema).length(6),
    regulatoryFacts: z.array(RegulatoryFactSchema).min(1),
  })
  .strict()
  .superRefine((value, context) => {
    for (const criterion of value.criteria) {
      if (
        criterion.id === "C3" ||
        criterion.id === "C4"
          ? criterion.neutralBySmallFirmRule !== value.isSmallFirm
          : false
      ) {
        context.addIssue({
          code: "custom",
          message:
            "C3 and C4 must mark the neutral rule when the company is a small firm.",
        });
      }
    }
  });

export const LicensesFactsSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            name: nonEmptyText("a licence name"),
            status: z.enum(["required", "review-needed", "not-identified"]),
            regulatoryFacts: z.array(RegulatoryFactSchema).min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const TaxIncentivesFactsSchema = z
  .object({
    regulatoryFacts: z.array(RegulatoryFactSchema).min(1),
    opportunities: z.array(DerivedRecommendationSchema),
  })
  .strict();

export const BankingFactsSchema = z
  .object({
    requirements: z.array(RegulatoryFactSchema).min(1),
    recommendations: z.array(DerivedRecommendationSchema).min(1),
  })
  .strict();

export const TimelineFactsSchema = z
  .object({
    steps: z
      .array(
        z
          .object({
            week: z.number().int().positive(),
            action: nonEmptyText("a timeline action"),
            sourceReferences: z.array(SourceReferenceSchema).min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const RiskMatrixFactsSchema = z
  .object({
    risks: z
      .array(
        z
          .object({
            title: nonEmptyText("a risk title"),
            likelihood: z.enum(["low", "medium", "high"]),
            impact: z.enum(["low", "medium", "high"]),
            mitigation: nonEmptyText("a risk mitigation"),
            sourceReferences: z.array(SourceReferenceSchema).min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const PlaybookFactsSchema = z
  .object({
    entity: EntityFactsSchema,
    visaCompass: VisaCompassFactsSchema,
    licenses: LicensesFactsSchema,
    taxIncentives: TaxIncentivesFactsSchema,
    banking: BankingFactsSchema,
    timeline: TimelineFactsSchema,
    riskMatrix: RiskMatrixFactsSchema,
  })
  .strict();

export const NarrativeSectionSchema = z
  .object({
    summary: nonEmptyText("a narrative summary").max(1_200),
    callout: z.string().trim().min(1).max(300).optional(),
    nextSteps: z.array(nonEmptyText("a next step").max(240)).max(3),
  })
  .strict();

export const NarrativesSchema = z
  .object({
    entity: NarrativeSectionSchema,
    visaCompass: NarrativeSectionSchema,
    licenses: NarrativeSectionSchema,
    taxIncentives: NarrativeSectionSchema,
    banking: NarrativeSectionSchema,
    timeline: NarrativeSectionSchema,
    riskMatrix: NarrativeSectionSchema,
  })
  .strict();

export const StreamingNarrativesSchema = NarrativesSchema.partial();

const EntityKnowledgeEntrySchema = z
  .object({
    purpose: EntityPurposeSchema,
    recommendation: nonEmptyText("an entity recommendation"),
    facts: z.array(RegulatoryFactSchema).min(1),
  })
  .strict();

export const EntitiesKnowledgeSchema = z
  .object({
    entities: z.array(EntityKnowledgeEntrySchema).length(4),
    entrePassEligibility: z.array(RegulatoryFactSchema).min(1),
  })
  .strict();

export const CompassKnowledgeSchema = z
  .object({
    passThreshold: RegulatoryFactSchema,
    smallFirmPmetThreshold: RegulatoryFactSchema,
    criteria: z
      .array(
        z
          .object({
            id: z.enum(["C1", "C2", "C3", "C4", "C5", "C6"]),
            name: nonEmptyText("a COMPASS criterion name"),
            facts: z.array(RegulatoryFactSchema).min(1),
          })
          .strict(),
      )
      .length(6),
    salaryContexts: z
      .array(
        z
          .object({
            context: z.enum(["financial-services", "non-financial-services"]),
            facts: z.array(RegulatoryFactSchema).min(1),
          })
          .strict(),
      )
      .length(2),
  })
  .strict();

const LicenseKnowledgeItemSchema = z
  .object({
    name: nonEmptyText("a licence name"),
    status: z.enum(["required", "review-needed", "not-identified"]),
    facts: z.array(RegulatoryFactSchema).min(1),
  })
  .strict();

export const LicensesKnowledgeSchema = z
  .object({
    industries: z.record(IndustrySchema, z.array(LicenseKnowledgeItemSchema).min(1)),
  })
  .strict();

export const TaxIncentivesKnowledgeSchema = z
  .object({
    globalRules: z.array(RegulatoryFactSchema).min(1),
    industryOpportunities: z.record(
      IndustrySchema,
      z.array(RegulatoryFactSchema),
    ),
  })
  .strict();

export const BankingKnowledgeSchema = z
  .object({
    commonRequirements: z.array(RegulatoryFactSchema).min(1),
    industryFlags: z.record(IndustrySchema, z.array(RegulatoryFactSchema)),
  })
  .strict();

const CountryContextEntrySchema = z
  .object({
    country: HomeCountrySchema,
    facts: z.array(RegulatoryFactSchema).min(1),
  })
  .strict();

export const CountryContextKnowledgeSchema = z
  .object({ countries: z.record(HomeCountrySchema, CountryContextEntrySchema) })
  .strict();

export const bundledKnowledge = {
  entities: EntitiesKnowledgeSchema.parse(entitiesJson),
  compass: CompassKnowledgeSchema.parse(compassJson),
  licenses: LicensesKnowledgeSchema.parse(licensesJson),
  taxIncentives: TaxIncentivesKnowledgeSchema.parse(taxIncentivesJson),
  banking: BankingKnowledgeSchema.parse(bankingJson),
  countryContext: CountryContextKnowledgeSchema.parse(countryContextJson),
};

export type Profile = z.infer<typeof ProfileSchema>;
export type EntrePassEvidence = z.infer<typeof EntrePassEvidenceSchema>;
export type HomeCountry = z.infer<typeof HomeCountrySchema>;
export type Industry = z.infer<typeof IndustrySchema>;
export type EntityPurpose = z.infer<typeof EntityPurposeSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type RegulatoryFact = z.infer<typeof RegulatoryFactSchema>;
export type PlaybookFacts = z.infer<typeof PlaybookFactsSchema>;
export type Narratives = z.infer<typeof NarrativesSchema>;
export type StreamingNarratives = z.infer<typeof StreamingNarrativesSchema>;
export type NarrativeSection = z.infer<typeof NarrativeSectionSchema>;
export type VisaCompassFacts = z.infer<typeof VisaCompassFactsSchema>;
export type EntitiesKnowledge = z.infer<typeof EntitiesKnowledgeSchema>;
export type CompassKnowledge = z.infer<typeof CompassKnowledgeSchema>;
export type LicensesKnowledge = z.infer<typeof LicensesKnowledgeSchema>;
export type TaxIncentivesKnowledge = z.infer<typeof TaxIncentivesKnowledgeSchema>;
export type BankingKnowledge = z.infer<typeof BankingKnowledgeSchema>;
export type CountryContextKnowledge = z.infer<typeof CountryContextKnowledgeSchema>;
export type BundledKnowledge = typeof bundledKnowledge;
