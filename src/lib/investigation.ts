import { z } from "zod";
import { relationSchema, type CuratedCase, type Relation } from "@/lib/schemas/case";
import { scoreAttempt, type ScoreBreakdown } from "@/lib/scoring";

export const investigationStatusSchema = z.enum([
  "not_started",
  "investigating",
  "ready_for_verdict",
  "submitted",
  "reviewing",
]);
export type InvestigationStatus = z.infer<typeof investigationStatusSchema>;

const scoreSchema = z.object({
  verdict: z.number(),
  reason: z.number(),
  board: z.number(),
  headline: z.number(),
  total: z.number(),
  boardCorrect: z.number(),
  boardTotal: z.number(),
  clueResults: z.array(
    z.object({
      clueId: z.string(),
      chosen: relationSchema.nullable(),
      accepted: z.array(relationSchema),
      correct: z.boolean(),
    }),
  ),
}) satisfies z.ZodType<ScoreBreakdown>;

export const submissionSchema = z.object({
  attemptNumber: z.number().int().positive(),
  relations: z.record(z.string(), relationSchema),
  verdictId: z.string(),
  reasonId: z.string(),
  headlineId: z.string(),
  score: scoreSchema,
  submittedAt: z.string(),
});
export type Submission = z.infer<typeof submissionSchema>;

export const caseProgressSchema = z.object({
  caseId: z.string(),
  caseVersion: z.number().int().positive(),
  status: investigationStatusSchema,
  attemptNumber: z.number().int().positive(),
  openedClueIds: z.array(z.string()),
  relations: z.record(z.string(), relationSchema),
  verdictId: z.string().nullable(),
  reasonId: z.string().nullable(),
  headlineId: z.string().nullable(),
  /** The frozen snapshot of the current attempt, once submitted. */
  submission: submissionSchema.nullable(),
  /** Never overwritten after the first scored submission. */
  firstSubmission: submissionSchema.nullable(),
  /** Most recent scored submission, which survives starting a new practice attempt. */
  latestSubmission: submissionSchema.nullable(),
});
export type CaseProgress = z.infer<typeof caseProgressSchema>;

export type InvestigationAction =
  | { type: "open_clue"; clueId: string }
  | { type: "assign"; clueId: string; relation: Relation }
  | { type: "unassign"; clueId: string }
  | { type: "select"; field: "verdictId" | "reasonId" | "headlineId"; optionId: string }
  | { type: "submit"; submittedAt: string }
  | { type: "review" }
  | { type: "practice_again" }
  | { type: "reset" };

export function initialProgress(c: CuratedCase): CaseProgress {
  return {
    caseId: c.id,
    caseVersion: c.version,
    status: "not_started",
    attemptNumber: 1,
    openedClueIds: [],
    relations: {},
    verdictId: null,
    reasonId: null,
    headlineId: null,
    submission: null,
    firstSubmission: null,
    latestSubmission: null,
  };
}

export function isLocked(p: CaseProgress) {
  return p.status === "submitted" || p.status === "reviewing";
}

export function boardComplete(c: CuratedCase, p: CaseProgress) {
  return c.clues.every((clue) => p.openedClueIds.includes(clue.id) && p.relations[clue.id] !== undefined);
}

export function answersComplete(p: CaseProgress) {
  return p.verdictId !== null && p.reasonId !== null && p.headlineId !== null;
}

export function canSubmit(c: CuratedCase, p: CaseProgress) {
  return !isLocked(p) && boardComplete(c, p) && answersComplete(p);
}

/** Visible helper text explaining why submission is not yet available. */
export function submitBlockers(c: CuratedCase, p: CaseProgress): string[] {
  const out: string[] = [];
  const unopened = c.clues.filter((cl) => !p.openedClueIds.includes(cl.id)).length;
  const unassigned = c.clues.filter((cl) => p.relations[cl.id] === undefined).length;
  if (unopened > 0) out.push(`Open ${unopened === 1 ? "1 more clue" : `${unopened} more clues`}.`);
  if (unassigned > 0) out.push(`Place ${unassigned === 1 ? "1 more clue" : `${unassigned} more clues`} on the board.`);
  if (p.verdictId === null) out.push("Choose a verdict.");
  if (p.reasonId === null) out.push("Choose the main reasoning.");
  if (p.headlineId === null) out.push("Choose a rewritten headline.");
  return out;
}

function withWorkingStatus(c: CuratedCase, p: CaseProgress): CaseProgress {
  return { ...p, status: boardComplete(c, p) ? "ready_for_verdict" : "investigating" };
}

export function investigationReducer(c: CuratedCase, p: CaseProgress, action: InvestigationAction): CaseProgress {
  switch (action.type) {
    case "open_clue": {
      if (isLocked(p) || !c.clues.some((cl) => cl.id === action.clueId)) return p;
      if (p.openedClueIds.includes(action.clueId)) return p.status === "not_started" ? withWorkingStatus(c, p) : p;
      return withWorkingStatus(c, { ...p, openedClueIds: [...p.openedClueIds, action.clueId] });
    }
    case "assign": {
      if (isLocked(p) || !p.openedClueIds.includes(action.clueId)) return p;
      if (p.relations[action.clueId] === action.relation) return p;
      return withWorkingStatus(c, { ...p, relations: { ...p.relations, [action.clueId]: action.relation } });
    }
    case "unassign": {
      if (isLocked(p) || p.relations[action.clueId] === undefined) return p;
      const relations = { ...p.relations };
      delete relations[action.clueId];
      return withWorkingStatus(c, { ...p, relations });
    }
    case "select": {
      if (isLocked(p)) return p;
      const options =
        action.field === "verdictId" ? c.verdictOptions : action.field === "reasonId" ? c.reasonOptions : c.headlineOptions;
      if (!options.some((o) => o.id === action.optionId)) return p;
      const next = { ...p, [action.field]: action.optionId };
      return p.status === "not_started" ? withWorkingStatus(c, next) : next;
    }
    case "submit": {
      // Locked attempts ignore repeat submissions, so completion and score cannot multiply.
      if (!canSubmit(c, p)) return p;
      const answers = { relations: p.relations, verdictId: p.verdictId, reasonId: p.reasonId, headlineId: p.headlineId };
      const submission: Submission = {
        attemptNumber: p.attemptNumber,
        relations: { ...p.relations },
        verdictId: p.verdictId!,
        reasonId: p.reasonId!,
        headlineId: p.headlineId!,
        score: scoreAttempt(c, answers),
        submittedAt: action.submittedAt,
      };
      return {
        ...p,
        status: "submitted",
        submission,
        firstSubmission: p.firstSubmission ?? submission,
        latestSubmission: submission,
      };
    }
    case "review":
      return p.status === "submitted" ? { ...p, status: "reviewing" } : p;
    case "practice_again": {
      if (!isLocked(p)) return p;
      return {
        ...initialProgress(c),
        attemptNumber: p.attemptNumber + 1,
        firstSubmission: p.firstSubmission,
        latestSubmission: p.latestSubmission,
      };
    }
    case "reset":
      return initialProgress(c);
  }
}
