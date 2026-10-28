import { z } from "zod";

/** Stable ID used across content: lower-case words separated by hyphens. */
export const idSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "IDs use lower-case words joined by hyphens");

export const sourceRoleSchema = z.enum([
  "study_source",
  "public_health_summary",
  "methods_background",
  "fictional_teaching_material",
]);
export type SourceRole = z.infer<typeof sourceRoleSchema>;

export const sourceSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  organization: z.string().min(1),
  /** Real external URL. Null for fictional teaching material that lives only in this app. */
  url: z.url().nullable(),
  role: sourceRoleSchema,
  /** Date shown on the source page (published, updated or reviewed), as displayed there. */
  publicationDate: z.string().nullable(),
  publicationDateLabel: z.enum(["Published", "Updated", "Reviewed"]).nullable(),
  /** ISO date when someone actually opened the page and checked the statement below. */
  checkedAt: z.iso.date().nullable(),
  supports: z.string().min(1),
  scopeLimitations: z.array(z.string().min(1)),
});
export type Source = z.infer<typeof sourceSchema>;

export const relationSchema = z.enum(["supports", "challenges", "open_question"]);
export type Relation = z.infer<typeof relationSchema>;

export const topicSchema = z.enum(["prevention", "screening", "research"]);
export type Topic = z.infer<typeof topicSchema>;

export const materialOriginSchema = z.enum([
  "fictional_teaching_example",
  "hypothetical_illustration",
  "real_source_summary",
]);
export type MaterialOrigin = z.infer<typeof materialOriginSchema>;

export const claimFragmentSchema = z.object({
  id: idSchema,
  text: z.string().min(1),
});

export const clueKindSchema = z.enum(["study_details", "numbers_outcome", "missing_context"]);

export const clueSchema = z.object({
  id: idSchema,
  kind: clueKindSchema,
  title: z.string().min(1),
  /** Paragraphs. Supplies the ingredients for reasoning without announcing the verdict. */
  body: z.array(z.string().min(1)).min(1),
  /** Optional verbatim excerpt from the case material, shown with a bracket treatment. */
  excerpt: z.string().optional(),
  sourceIds: z.array(idSchema),
  claimFragmentIds: z.array(idSchema),
  materialOrigin: materialOriginSchema,
  glossaryTermIds: z.array(idSchema),
});
export type Clue = z.infer<typeof clueSchema>;

export const optionSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  /** Shown after submission for this option, whether or not it was chosen. */
  explanation: z.string().min(1),
});
export type AnswerOption = z.infer<typeof optionSchema>;

export const verdictIdSchema = z.enum([
  "supported",
  "misleading",
  "unsupported",
  "not-enough-information",
]);
export type VerdictId = z.infer<typeof verdictIdSchema>;

const fieldValueSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("reported"), value: z.string().min(1) }),
  z.object({ status: z.literal("not_reported"), note: z.string().optional() }),
  z.object({ status: z.literal("not_applicable"), note: z.string().min(1) }),
]);
export type FieldValue = z.infer<typeof fieldValueSchema>;

export const studyViewSchema = z.object({
  kind: z.literal("study"),
  heading: z.string(),
  /** The full fictional abstract or illustration text. */
  text: z.string().min(1),
  question: z.string(),
  context: z.enum(["humans", "animals", "cells", "mixed", "not_reported", "not_applicable"]),
  design: z.object({
    value: z.string(),
    status: z.enum(["explicit", "inferred", "not_reported"]),
  }),
  fields: z.array(z.object({ label: z.string(), value: fieldValueSchema })),
});

export const sourceSummaryViewSchema = z.object({
  kind: z.literal("source_summary"),
  heading: z.string(),
  sourceType: z.string(),
  explanation: z.string(),
  statements: z.array(
    z.object({ sourceId: idSchema, text: z.string().min(1), quoted: z.boolean() }),
  ),
  fields: z.array(z.object({ label: z.string(), value: fieldValueSchema })),
});

export const caseStudyViewSchema = z.discriminatedUnion("kind", [
  studyViewSchema,
  sourceSummaryViewSchema,
]);
export type CaseStudyView = z.infer<typeof caseStudyViewSchema>;

export const limitItemSchema = z.object({
  text: z.string().min(1),
  /** Why the limit follows from the material. */
  justification: z.string().optional(),
});

export const curatedCaseSchema = z
  .object({
    id: idSchema,
    slug: idSchema,
    version: z.number().int().positive(),
    number: z.number().int().positive(),
    title: z.string().min(1),
    topic: topicSchema,
    skill: z.string().min(1),
    estimatedMinutes: z.number().int().positive(),
    learningObjective: z.string().min(1),
    claimText: z.string().min(1),
    claimFragments: z.array(claimFragmentSchema).min(1),
    postAuthor: z.string().min(1),
    fictionalPostLabel: z.string().min(1),
    materialType: z.enum(["fictional_study", "fictional_illustration", "real_source_summary"]),
    provenanceLabel: z.string().min(1),
    clues: z.array(clueSchema).length(3),
    studyView: caseStudyViewSchema,
    sourceIds: z.array(idSchema).min(1),
    glossaryTermIds: z.array(idSchema),
    verdictOptions: z.array(optionSchema.extend({ id: verdictIdSchema })).length(4),
    reasonOptions: z.array(optionSchema).min(3),
    headlineOptions: z.array(optionSchema).min(3),
    answerKey: z.object({
      verdictId: verdictIdSchema,
      reasonId: idSchema,
      headlineId: idSchema,
      clues: z.array(
        z.object({
          clueId: idSchema,
          /** First entry is the primary relation; others are accepted alternatives. */
          accepted: z.array(relationSchema).min(1),
          explanation: z.string().min(1),
          alternativeNote: z.string().optional(),
        }),
      ),
    }),
    verdictScope: z.string().min(1),
    supportedConclusion: z.array(limitItemSchema).min(1),
    notEstablished: z.array(limitItemSchema).min(1),
    debrief: z.array(z.string().min(1)).min(1),
    correctedHeadline: z.string().min(1),
    relatedCaseSlug: idSchema.nullable(),
    decoderSampleId: idSchema.nullable(),
    riskExample: z
      .object({
        years: z.number().positive(),
        outcomeLabel: z.string(),
        groups: z
          .array(z.object({ id: idSchema, label: z.string(), events: z.number().int(), total: z.number().int() }))
          .length(2),
      })
      .nullable(),
    timelineExample: z
      .object({
        axisStart: z.number().int(),
        axisEnd: z.number().int(),
        paths: z
          .array(z.object({ id: idSchema, label: z.string(), diagnosisAge: z.number().int(), endAge: z.number().int() }))
          .length(2),
      })
      .nullable(),
  })
  .superRefine((c, ctx) => {
    const fragmentIds = new Set(c.claimFragments.map((f) => f.id));
    const clueIds = new Set(c.clues.map((cl) => cl.id));
    for (const clue of c.clues) {
      for (const f of clue.claimFragmentIds) {
        if (!fragmentIds.has(f)) ctx.addIssue({ code: "custom", message: `Clue ${clue.id} links unknown fragment ${f}` });
      }
    }
    const keyed = new Set(c.answerKey.clues.map((k) => k.clueId));
    for (const id of clueIds) {
      if (!keyed.has(id)) ctx.addIssue({ code: "custom", message: `Clue ${id} has no answer key entry` });
    }
    for (const id of keyed) {
      if (!clueIds.has(id)) ctx.addIssue({ code: "custom", message: `Answer key references unknown clue ${id}` });
    }
    if (!c.reasonOptions.some((o) => o.id === c.answerKey.reasonId)) {
      ctx.addIssue({ code: "custom", message: `Unknown reason ${c.answerKey.reasonId}` });
    }
    if (!c.headlineOptions.some((o) => o.id === c.answerKey.headlineId)) {
      ctx.addIssue({ code: "custom", message: `Unknown headline ${c.answerKey.headlineId}` });
    }
    const allOptionIds = [...c.reasonOptions, ...c.headlineOptions].map((o) => o.id);
    if (new Set(allOptionIds).size !== allOptionIds.length) {
      ctx.addIssue({ code: "custom", message: "Option IDs must be unique within a case" });
    }
  });
export type CuratedCase = z.infer<typeof curatedCaseSchema>;
