import type { CuratedCase, Relation } from "@/lib/schemas/case";

export const SCORE_WEIGHTS = { verdict: 40, reason: 30, board: 20, headline: 10 } as const;

export interface AttemptAnswers {
  relations: Record<string, Relation>;
  verdictId: string | null;
  reasonId: string | null;
  headlineId: string | null;
}

export interface ClueResult {
  clueId: string;
  chosen: Relation | null;
  accepted: Relation[];
  correct: boolean;
}

export interface ScoreBreakdown {
  verdict: number;
  reason: number;
  board: number;
  headline: number;
  total: number;
  boardCorrect: number;
  boardTotal: number;
  clueResults: ClueResult[];
}

/**
 * Deterministic score out of 100. The board subtotal is rounded once:
 * 20 × accepted assignments ÷ 3. No time, hint or source-opening effects.
 */
export function scoreAttempt(c: CuratedCase, answers: AttemptAnswers): ScoreBreakdown {
  const key = c.answerKey;
  const clueResults: ClueResult[] = c.clues.map((clue) => {
    const entry = key.clues.find((k) => k.clueId === clue.id)!;
    const chosen = answers.relations[clue.id] ?? null;
    return { clueId: clue.id, chosen, accepted: entry.accepted, correct: chosen !== null && entry.accepted.includes(chosen) };
  });
  const boardCorrect = clueResults.filter((r) => r.correct).length;
  const boardTotal = c.clues.length;
  const verdict = answers.verdictId === key.verdictId ? SCORE_WEIGHTS.verdict : 0;
  const reason = answers.reasonId === key.reasonId ? SCORE_WEIGHTS.reason : 0;
  const headline = answers.headlineId === key.headlineId ? SCORE_WEIGHTS.headline : 0;
  const board = Math.round((SCORE_WEIGHTS.board * boardCorrect) / boardTotal);
  return {
    verdict,
    reason,
    board,
    headline,
    total: verdict + reason + board + headline,
    boardCorrect,
    boardTotal,
    clueResults,
  };
}
