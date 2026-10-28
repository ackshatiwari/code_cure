import { z } from "zod";

/**
 * Two layers:
 * - `modelAnalysisSchema` is what a provider (or a prewritten sample) fills in.
 * - `decoderAnalysisSchema` adds fields the application controls: schema version,
 *   origin, coverage, the deterministic source sentences and calculated values.
 * A model can never set origin, coverage or the source text.
 */

export const ANALYSIS_SCHEMA_VERSION = 1;

const sentenceIds = z.array(z.string()).max(12);
const short = z.string().min(1).max(400);
const medium = z.string().min(1).max(900);

export const basisSchema = z.enum(["explicit_statement", "inference", "general_context", "not_reported"]);
export type Basis = z.infer<typeof basisSchema>;

export const statementSchema = z.object({
  text: medium,
  basis: basisSchema,
  sourceSentenceIds: sentenceIds,
  /** Why a limitation or inference follows from the reported design. */
  justification: z.string().max(600).nullable(),
});
export type Statement = z.infer<typeof statementSchema>;

export const fieldSchema = z.object({
  status: z.enum(["reported", "not_reported", "not_applicable"]),
  value: z.string().max(400).nullable(),
  sourceSentenceIds: sentenceIds,
});
export type AnalysisField = z.infer<typeof fieldSchema>;

export const measureTypeSchema = z.enum([
  "event_counts",
  "proportion",
  "relative_risk_or_reduction",
  "absolute_difference",
  "hazard_ratio",
  "odds_ratio",
  "mean_or_median",
  "other",
]);

export const numericResultSchema = z.object({
  description: short,
  measureType: measureTypeSchema,
  /** Exactly as written in the input, including its units or % sign. */
  reportedValue: z.string().min(1).max(200),
  units: z.string().max(120).nullable(),
  timeWindow: z.string().max(160).nullable(),
  uncertainty: z.string().max(200).nullable(),
  /** Only when the input states both an event count and a group size for two groups. */
  groupCounts: z
    .object({
      baselineLabel: z.string().max(120),
      baselineEvents: z.number().int(),
      baselineTotal: z.number().int(),
      comparisonLabel: z.string().max(120),
      comparisonEvents: z.number().int(),
      comparisonTotal: z.number().int(),
    })
    .nullable(),
  sourceSentenceIds: sentenceIds,
});

export const canAnswerIds = [
  "association",
  "causal",
  "human_outcomes",
  "longer_life",
  "applies_to_everyone",
] as const;

export const canAnswerSchema = z.object({
  id: z.enum(canAnswerIds),
  status: z.enum(["reported", "not_established", "not_reported"]),
  reason: short,
  sourceSentenceIds: sentenceIds,
});

export const inputKindSchema = z.enum([
  "study_abstract",
  "insufficient_information",
  "non_study_text",
  "unsupported_language",
]);
export type InputKind = z.infer<typeof inputKindSchema>;

export const modelAnalysisSchema = z.object({
  inputKind: inputKindSchema,
  inputKindNote: z.string().max(500),
  plainLanguageQuestion: z.string().max(400).nullable(),
  summary: z.string().max(900),
  studyContext: z.object({
    value: z.enum(["humans", "animals", "cells", "mixed", "not_reported"]),
    sourceSentenceIds: sentenceIds,
  }),
  studyDesign: z.object({
    value: z.string().max(200).nullable(),
    status: z.enum(["explicit", "inferred", "not_reported"]),
    justification: z.string().max(400).nullable(),
    sourceSentenceIds: sentenceIds,
  }),
  populationOrModel: fieldSchema,
  sampleSize: fieldSchema,
  eligibility: fieldSchema,
  setting: fieldSchema,
  comparison: fieldSchema,
  followUp: fieldSchema,
  findings: z.array(statementSchema).max(8),
  numericResults: z.array(numericResultSchema).max(10),
  supportedConclusions: z.array(statementSchema).max(6),
  doesNotEstablish: z.array(statementSchema).max(6),
  reportedLimitations: z.array(statementSchema).max(6),
  designConsiderations: z.array(statementSchema).max(6),
  unansweredQuestions: z.array(statementSchema).max(6),
  canThisAnswer: z.array(canAnswerSchema).max(5),
  missingFields: z.array(z.string().max(120)).max(12),
  glossaryTermIds: z.array(z.string().max(60)).max(16),
});
export type ModelAnalysis = z.infer<typeof modelAnalysisSchema>;

export const originSchema = z.enum(["prewritten_sample", "ai_generated"]);
export type AnalysisOrigin = z.infer<typeof originSchema>;

export const decoderAnalysisSchema = modelAnalysisSchema.extend({
  schemaVersion: z.literal(ANALYSIS_SCHEMA_VERSION),
  origin: originSchema,
  coverage: z.literal("pasted_abstract"),
  /** Provenance label for prewritten samples, e.g. "Fictional teaching example — not a real study". */
  provenanceNote: z.string().nullable(),
  userTitle: z.string().max(300).nullable(),
  sourceText: z.string(),
  sourceSentences: z.array(
    z.object({ id: z.string(), text: z.string(), start: z.number(), end: z.number() }),
  ),
  calculations: z.array(
    z.object({
      numericResultIndex: z.number().int(),
      baselineRiskPercent: z.number(),
      comparisonRiskPercent: z.number(),
      percentagePoints: z.number(),
      perThousand: z.number(),
      relativeReductionPercent: z.number().nullable(),
    }),
  ),
});
export type DecoderAnalysis = z.infer<typeof decoderAnalysisSchema>;

export const originLabels: Record<AnalysisOrigin, string> = {
  prewritten_sample: "Prewritten teaching example",
  ai_generated: "AI-generated explanation — check against the original text",
};

export const canAnswerQuestions: Record<(typeof canAnswerIds)[number], string> = {
  association: "Does it describe an association?",
  causal: "Does the design support a causal interpretation for the measured outcome?",
  human_outcomes: "Does it report outcomes in people?",
  longer_life: "Does it directly measure longer life or another outcome that matters to patients?",
  applies_to_everyone: "Does it establish applicability to everyone?",
};
