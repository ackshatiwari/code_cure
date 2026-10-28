import { describe, expect, it } from "vitest";
import { cases, getCase } from "@/content/cases";
import {
  canSubmit,
  initialProgress,
  investigationReducer,
  submitBlockers,
  type CaseProgress,
  type InvestigationAction,
} from "@/lib/investigation";
import type { CuratedCase, Relation } from "@/lib/schemas/case";
import { scoreAttempt } from "@/lib/scoring";

function wrong(c: CuratedCase, accepted: Relation[]): Relation {
  return (["supports", "challenges", "open_question"] as Relation[]).find((r) => !accepted.includes(r))!;
}

function play(c: CuratedCase, actions: InvestigationAction[], start: CaseProgress = initialProgress(c)) {
  return actions.reduce((p, a) => investigationReducer(c, p, a), start);
}

function correctRun(c: CuratedCase): InvestigationAction[] {
  return [
    ...c.clues.map((cl) => ({ type: "open_clue" as const, clueId: cl.id })),
    ...c.answerKey.clues.map((k) => ({ type: "assign" as const, clueId: k.clueId, relation: k.accepted[0] })),
    { type: "select", field: "verdictId", optionId: c.answerKey.verdictId },
    { type: "select", field: "reasonId", optionId: c.answerKey.reasonId },
    { type: "select", field: "headlineId", optionId: c.answerKey.headlineId },
    { type: "submit", submittedAt: "2026-10-28T00:00:00.000Z" },
  ];
}

describe("scoring", () => {
  it.each(cases.map((c) => [c.slug, c] as const))("all-correct scores 100 for %s", (_slug, c) => {
    const p = play(c, correctRun(c));
    expect(p.submission?.score.total).toBe(100);
  });

  it.each(cases.map((c) => [c.slug, c] as const))("all-incorrect scores 0 for %s", (_slug, c) => {
    const relations = Object.fromEntries(c.answerKey.clues.map((k) => [k.clueId, wrong(c, k.accepted)]));
    const score = scoreAttempt(c, {
      relations,
      verdictId: c.verdictOptions.find((o) => o.id !== c.answerKey.verdictId)!.id,
      reasonId: c.reasonOptions.find((o) => o.id !== c.answerKey.reasonId)!.id,
      headlineId: c.headlineOptions.find((o) => o.id !== c.answerKey.headlineId)!.id,
    });
    expect(score.total).toBe(0);
  });

  it("rounds the board subtotal once: 0, 7, 13, 20", () => {
    const c = getCase("missing-denominator")!;
    const subtotals = [0, 1, 2, 3].map((n) => {
      const relations = Object.fromEntries(
        c.answerKey.clues.map((k, i) => [k.clueId, i < n ? k.accepted[0] : wrong(c, k.accepted)]),
      );
      return scoreAttempt(c, { relations, verdictId: null, reasonId: null, headlineId: null }).board;
    });
    expect(subtotals).toEqual([0, 7, 13, 20]);
  });

  it("gives full board credit for accepted alternative relations", () => {
    for (const c of cases) {
      const relations = Object.fromEntries(
        c.answerKey.clues.map((k) => [k.clueId, k.accepted[k.accepted.length - 1]]),
      );
      expect(scoreAttempt(c, { relations, verdictId: null, reasonId: null, headlineId: null }).board).toBe(20);
    }
    const c2 = getCase("link-not-cause")!;
    expect(c2.answerKey.clues.find((k) => k.clueId === "adjustment-not-described")!.accepted).toEqual([
      "open_question",
      "challenges",
    ]);
  });

  it("keeps Case 05 Supported without demanding a randomized smoking trial", () => {
    const c5 = getCase("supported-conclusion")!;
    expect(c5.answerKey.verdictId).toBe("supported");
    const trialReason = c5.reasonOptions.find((o) => o.id === "needs-smoking-trial")!;
    expect(c5.answerKey.reasonId).not.toBe(trialReason.id);
    expect(c5.studyView.kind).toBe("source_summary");
  });
});

describe("investigation state machine", () => {
  const c = getCase("missing-denominator")!;

  it("moves not_started → investigating → ready_for_verdict → submitted → reviewing", () => {
    let p = initialProgress(c);
    expect(p.status).toBe("not_started");
    p = investigationReducer(c, p, { type: "open_clue", clueId: c.clues[0].id });
    expect(p.status).toBe("investigating");
    p = play(c, correctRun(c).slice(0, -4), p);
    expect(p.status).toBe("ready_for_verdict");
    expect(canSubmit(c, p)).toBe(false);
    p = play(c, correctRun(c).slice(-4), p);
    expect(p.status).toBe("submitted");
    p = investigationReducer(c, p, { type: "review" });
    expect(p.status).toBe("reviewing");
    expect(p.submission?.score.total).toBe(100);
  });

  it("requires a clue to be opened before it can be assigned", () => {
    const p = investigationReducer(c, initialProgress(c), { type: "assign", clueId: c.clues[0].id, relation: "supports" });
    expect(p.relations).toEqual({});
  });

  it("explains every blocker before submission", () => {
    expect(submitBlockers(c, initialProgress(c))).toEqual([
      "Open 3 more clues.",
      "Place 3 more clues on the board.",
      "Choose a verdict.",
      "Choose the main reasoning.",
      "Choose a rewritten headline.",
    ]);
  });

  it("allows changing and removing assignments before submission", () => {
    let p = play(c, [{ type: "open_clue", clueId: "the-counts" }, { type: "assign", clueId: "the-counts", relation: "supports" }]);
    p = investigationReducer(c, p, { type: "assign", clueId: "the-counts", relation: "challenges" });
    expect(p.relations["the-counts"]).toBe("challenges");
    p = investigationReducer(c, p, { type: "unassign", clueId: "the-counts" });
    expect(p.relations["the-counts"]).toBeUndefined();
  });

  it("ignores repeated submission and freezes the attempt", () => {
    const submitted = play(c, correctRun(c));
    const again = investigationReducer(c, submitted, { type: "submit", submittedAt: "later" });
    expect(again).toBe(submitted);
    const edited = investigationReducer(c, submitted, { type: "select", field: "verdictId", optionId: "supported" });
    expect(edited.verdictId).toBe(c.answerKey.verdictId);
  });

  it("practice again preserves the first-attempt score and does not duplicate completion", () => {
    const first = play(c, correctRun(c));
    const practice = investigationReducer(c, first, { type: "practice_again" });
    expect(practice.attemptNumber).toBe(2);
    expect(practice.submission).toBeNull();
    expect(practice.firstSubmission?.score.total).toBe(100);
    const wrongRun = play(c, [
      ...c.clues.map((cl) => ({ type: "open_clue" as const, clueId: cl.id })),
      ...c.clues.map((cl) => ({ type: "assign" as const, clueId: cl.id, relation: "supports" as const })),
      { type: "select", field: "verdictId", optionId: "supported" },
      { type: "select", field: "reasonId", optionId: "arithmetic-holds" },
      { type: "select", field: "headlineId", optionId: "twenty-five-per-hundred" },
      { type: "submit", submittedAt: "t2" },
    ], practice);
    expect(wrongRun.firstSubmission?.score.total).toBe(100);
    expect(wrongRun.latestSubmission?.score.total).toBe(7);
    expect(wrongRun.firstSubmission?.attemptNumber).toBe(1);
  });

  it("does not change the score when reviewing", () => {
    const submitted = play(c, correctRun(c));
    const reviewed = investigationReducer(c, submitted, { type: "review" });
    expect(reviewed.submission).toEqual(submitted.submission);
  });
});
