"use client";

import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { formatCaseNumber, getCase } from "@/content/cases";
import { verdictDefinitions } from "@/content/cases/verdicts";
import { getDecoderSample } from "@/content/samples";
import type { AnswerOption, CuratedCase } from "@/lib/schemas/case";
import { SCORE_WEIGHTS } from "@/lib/scoring";
import { useCaseProgress, type ProgressMode } from "@/lib/progress-store";
import type { Submission } from "@/lib/investigation";
import { LimitsPanel } from "@/components/evidence/LimitsPanel";
import { ProvenanceTag } from "@/components/evidence/ProvenanceTag";
import { RelationLabel } from "@/components/evidence/relations";
import { SourceList } from "@/components/evidence/SourceList";
import { TermList } from "@/components/glossary/TermButton";
import { buttonClass, cx, linkClass } from "@/components/ui/styles";
import { ClaimPost } from "./ClaimPost";
import { StorageNote } from "./StorageNote";

function feedbackLine(c: CuratedCase, s: Submission) {
  const verdictRight = s.verdictId === c.answerKey.verdictId;
  const reasonRight = s.reasonId === c.answerKey.reasonId;
  if (verdictRight && reasonRight) return "You kept the conclusion within the evidence.";
  const chosenReason = c.reasonOptions.find((o) => o.id === s.reasonId);
  if (chosenReason && /only|limitation/i.test(chosenReason.label)) {
    return "You identified a limitation. Recheck the exact wording of the claim.";
  }
  if (c.answerKey.verdictId === "supported") return "This claim holds up. Here's why the evidence supports it as worded.";
  return "This conclusion goes further than the evidence. Here's the missing step.";
}

function ChoiceReview({ title, options, chosenId, correctId }: { title: string; options: AnswerOption[]; chosenId: string | null; correctId: string }) {
  const chosen = options.find((o) => o.id === chosenId);
  const correct = options.find((o) => o.id === correctId)!;
  const right = chosenId === correctId;
  return (
    <div className="border-t border-rule py-4">
      <h3 className="font-sans text-[1.0625rem] font-semibold">{title}</h3>
      {chosen && (
        <p className="mt-2">
          <span className={cx("inline-flex items-center gap-1 font-semibold", right ? "text-primary" : "text-caution")}>
            {right ? <Check size={16} strokeWidth={2} aria-hidden /> : <RotateCcw size={16} strokeWidth={1.75} aria-hidden />}
            {right ? "Your choice matches" : "Your choice, to reconsider"}:
          </span>{" "}
          {chosen.label}
        </p>
      )}
      {chosen && <p className="mt-1 text-[0.9375rem] text-ink-muted">{chosen.explanation}</p>}
      {!right && (
        <>
          <p className="mt-3">
            <span className="font-semibold">Best fit:</span> {correct.label}
          </p>
          <p className="mt-1 text-[0.9375rem] text-ink-muted">{correct.explanation}</p>
        </>
      )}
    </div>
  );
}

export function ResultView({ slug, mode = "standard" }: { slug: string; mode?: ProgressMode }) {
  const c = getCase(slug)!;
  const router = useRouter();
  const { hydrated, storage, progress, dispatch } = useCaseProgress(c, mode);
  const [explanationOnly, setExplanationOnly] = useState(false);
  const uid = useId();
  const caseHref = mode === "demo" ? "/demo" : `/cases/${c.slug}`;
  const submission = progress.submission ?? progress.latestSubmission;
  const showingOlder = !progress.submission && !!progress.latestSubmission;

  useEffect(() => {
    if (progress.status === "submitted") dispatch({ type: "review" });
  }, [progress.status, dispatch]);

  if (!hydrated) {
    return (
      <div className="container-page py-10" aria-busy="true">
        <p className="case-id">{formatCaseNumber(c.number)}</p>
        <h1 className="mt-2 text-[2rem]">{c.title}: results</h1>
        <div className="mt-6 space-y-3">
          <div className="skeleton h-8 w-2/3" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!submission && !explanationOnly) {
    return (
      <div className="container-page py-10">
        <p className="case-id">
          {formatCaseNumber(c.number)} / {c.title.toUpperCase()}
        </p>
        <h1 className="mt-2 text-[2rem] lg:text-[2.375rem]">{c.title}: results</h1>
        <div className="reading mt-6 space-y-4">
          <p>
            There&apos;s no submitted attempt for this investigation on this device yet, so there is no score to show.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={caseHref} className={buttonClass("primary")}>
              Start this investigation <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
            </Link>
            <button type="button" className={buttonClass("secondary")} onClick={() => setExplanationOnly(true)}>
              Read the explanation
            </button>
          </div>
          <p className="text-meta text-ink-muted">Reading the explanation first won&apos;t record a score or count as completing the case.</p>
        </div>
      </div>
    );
  }

  const verdict = verdictDefinitions[c.answerKey.verdictId];
  const sample = c.decoderSampleId ? getDecoderSample(c.decoderSampleId) : undefined;
  const related = c.relatedCaseSlug ? getCase(c.relatedCaseSlug) : undefined;
  const first = progress.firstSubmission;

  return (
    <div className="container-page py-8 md:py-10">
      <header className="max-w-3xl">
        <p className="case-id">
          {formatCaseNumber(c.number)} / {c.title.toUpperCase()}
        </p>
        <h1 className="mt-2 text-[1.75rem] sm:text-[2rem] lg:text-[2.375rem]">
          {submission ? "Your results" : "The explanation"}: {c.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <ProvenanceTag tone={c.materialType === "real_source_summary" ? "real" : "fictional"}>{c.provenanceLabel}</ProvenanceTag>
          {!submission && <span className="text-meta font-semibold text-ink-muted">Explanation only · no attempt recorded</span>}
        </div>
        {submission && <StorageNote hydrated={hydrated} storage={storage} className="mt-2" />}
      </header>

      {mode === "demo" && submission && (
        <aside aria-label="Guided demo" className="mt-6 rounded-[var(--radius-panel)] border border-primary/40 bg-primary-soft/70 p-4">
          <p className="text-meta font-semibold uppercase tracking-wide text-primary">Guided demo · last step</p>
          <p className="mt-0.5 font-semibold">Show the explanation, then open the same abstract in the decoder.</p>
          {sample && (
            <Link href={`/decode?sample=${sample.id}`} className={buttonClass("primary", "sm", "mt-3")}>
              Open this abstract in the decoder <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
            </Link>
          )}
        </aside>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-10">
          {/* 1. Verdict and scope */}
          <section aria-labelledby={`${uid}-verdict`}>
            <h2 id={`${uid}-verdict`} className="text-[1.5rem]">
              Verdict: {verdict.label}
            </h2>
            <p className="reading mt-2 text-[1.125rem]">{c.verdictScope}</p>
            <p className="mt-2 text-meta text-ink-muted">
              {verdict.label} means: {verdict.definition}
            </p>
            {submission && <p className="margin-note mt-4 reading">{feedbackLine(c, submission)}</p>}
          </section>

          <div className="space-y-3">
            <h2 className="text-[1.5rem]">The headline says, and the evidence supports</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1.5 text-meta font-semibold text-ink-muted">The headline says</p>
                <ClaimPost caseData={c} compact />
              </div>
              <div>
                <p className="mb-1.5 text-meta font-semibold text-ink-muted">The evidence supports</p>
                <p className="rounded-[var(--radius-panel)] border border-primary/40 bg-primary-soft p-4 font-serif text-[1.1875rem] leading-snug">
                  {c.correctedHeadline}
                </p>
              </div>
            </div>
          </div>

          {/* 2–3. Supports / does not establish */}
          <LimitsPanel
            idPrefix={`${uid}-limits`}
            supported={c.supportedConclusion}
            notEstablished={c.notEstablished}
            limitsHeading="What it does not establish"
          />

          <section aria-labelledby={`${uid}-debrief`} className="reading">
            <h2 id={`${uid}-debrief`} className="text-[1.5rem]">
              The reasoning, step by step
            </h2>
            <div className="mt-3 space-y-3">
              {c.debrief.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-4">
              <TermList termIds={c.glossaryTermIds} label="Terms in this case" />
            </div>
          </section>

          {/* 4. Player choices */}
          <section aria-labelledby={`${uid}-choices`}>
            <h2 id={`${uid}-choices`} className="text-[1.5rem]">
              {submission ? "Your choices and explanations" : "Each clue and answer, explained"}
            </h2>
            {showingOlder && (
              <p className="mt-2 text-[0.9375rem] text-ink-muted">
                You&apos;ve started a new practice attempt. This shows your most recent submitted attempt.
              </p>
            )}
            <h3 className="mt-4 font-sans text-[1.0625rem] font-semibold">The evidence board</h3>
            <ul className="mt-2 space-y-3">
              {c.clues.map((clue) => {
                const key = c.answerKey.clues.find((k) => k.clueId === clue.id)!;
                const chosen = submission?.relations[clue.id];
                const right = chosen !== undefined && key.accepted.includes(chosen);
                return (
                  <li key={clue.id} className="rounded-[var(--radius-panel)] border border-rule bg-surface p-4">
                    <p className="font-semibold">{clue.title}</p>
                    <dl className="mt-2 grid gap-x-4 gap-y-1 text-[0.9375rem] sm:grid-cols-[auto_1fr]">
                      {submission && (
                        <>
                          <dt className="text-ink-muted">You placed it</dt>
                          <dd className="flex flex-wrap items-center gap-2">
                            {chosen ? <RelationLabel relation={chosen} /> : "Not placed"}
                            <span className={cx("inline-flex items-center gap-1 text-meta font-semibold", right ? "text-primary" : "text-caution")}>
                              {right ? <Check size={14} strokeWidth={2} aria-hidden /> : <X size={14} strokeWidth={2} aria-hidden />}
                              {right ? "Accepted" : "Reconsider"}
                            </span>
                          </dd>
                        </>
                      )}
                      <dt className="text-ink-muted">{key.accepted.length > 1 ? "Accepted relations" : "Accepted relation"}</dt>
                      <dd className="flex flex-wrap gap-x-4 gap-y-1">
                        {key.accepted.map((r) => (
                          <RelationLabel key={r} relation={r} />
                        ))}
                      </dd>
                    </dl>
                    <p className="mt-2 text-[0.9375rem]">{key.explanation}</p>
                    {key.alternativeNote && <p className="mt-1 text-[0.9375rem] text-ink-muted">{key.alternativeNote}</p>}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <ChoiceReview title="Verdict" options={c.verdictOptions} chosenId={submission?.verdictId ?? null} correctId={c.answerKey.verdictId} />
              <ChoiceReview title="Main reasoning" options={c.reasonOptions} chosenId={submission?.reasonId ?? null} correctId={c.answerKey.reasonId} />
              <ChoiceReview title="Rewritten headline" options={c.headlineOptions} chosenId={submission?.headlineId ?? null} correctId={c.answerKey.headlineId} />
            </div>
          </section>

          {/* 5. Corrected headline */}
          <section aria-labelledby={`${uid}-headline`}>
            <h2 id={`${uid}-headline`} className="text-[1.5rem]">
              Corrected headline
            </h2>
            <p className="bracket mt-3 font-serif text-[1.25rem] leading-snug">{c.correctedHeadline}</p>
          </section>

          {/* 6. Sources and provenance */}
          <section aria-labelledby={`${uid}-sources`}>
            <h2 id={`${uid}-sources`} className="text-[1.5rem]">
              Sources and provenance
            </h2>
            <p className="reading mt-2 text-[0.9375rem] text-ink-muted">
              {c.materialType === "real_source_summary"
                ? "The post is fictional; the statements it summarizes come from the real public-health sources below."
                : "The post and study material are fictional or hypothetical. The real sources below explain the methods concept; they don't contain these numbers."}
            </p>
            <div className="mt-4">
              <SourceList sourceIds={c.sourceIds} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start" aria-label="Score and next steps">
          {/* 7. Score */}
          {submission ? (
            <section aria-labelledby={`${uid}-score`} className="rounded-[var(--radius-panel)] border border-rule bg-surface p-5">
              <h2 id={`${uid}-score`} className="text-[1.25rem]">
                Learning score
              </h2>
              <p className="mt-2 font-serif text-[2.5rem] leading-none tabular">
                {submission.score.total}
                <span className="text-[1.25rem] text-ink-muted"> / 100</span>
              </p>
              <dl className="mt-4 space-y-1.5 text-[0.9375rem] tabular">
                {[
                  ["Verdict", submission.score.verdict, SCORE_WEIGHTS.verdict],
                  ["Main reasoning", submission.score.reason, SCORE_WEIGHTS.reason],
                  [`Board (${submission.score.boardCorrect} of ${submission.score.boardTotal} accepted)`, submission.score.board, SCORE_WEIGHTS.board],
                  ["Headline", submission.score.headline, SCORE_WEIGHTS.headline],
                ].map(([label, got, max]) => (
                  <div key={label as string} className="flex justify-between gap-3 border-b border-rule pb-1.5">
                    <dt>{label}</dt>
                    <dd className="font-semibold">
                      {got} / {max}
                    </dd>
                  </div>
                ))}
              </dl>
              {first && first.attemptNumber !== submission.attemptNumber && (
                <p className="mt-3 text-[0.9375rem]">
                  First attempt: <strong className="tabular">{first.score.total}</strong> · This practice (attempt {submission.attemptNumber}):{" "}
                  <strong className="tabular">{submission.score.total}</strong>
                </p>
              )}
              <p className="mt-3 text-meta text-ink-muted">
                Board points are 20 × accepted placements ÷ 3, rounded once. The score reflects this exercise only, not medical
                knowledge, intelligence or how certain the research is.
              </p>
              {progress.submission && (
                <button
                  type="button"
                  className={buttonClass("secondary", "sm", "mt-4 w-full")}
                  onClick={() => {
                    dispatch({ type: "practice_again" });
                    router.push(caseHref);
                  }}
                >
                  <RotateCcw size={16} strokeWidth={1.75} aria-hidden /> Practice again
                </button>
              )}
              {showingOlder && (
                <Link href={caseHref} className={buttonClass("secondary", "sm", "mt-4 w-full")}>
                  Continue your practice attempt
                </Link>
              )}
            </section>
          ) : (
            <section className="rounded-[var(--radius-panel)] border border-rule bg-surface p-5">
              <h2 className="text-[1.25rem]">No score recorded</h2>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">You&apos;re reading the explanation without an attempt.</p>
              <Link href={caseHref} className={buttonClass("primary", "sm", "mt-3 w-full")}>
                Start this investigation
              </Link>
            </section>
          )}

          {/* 8. Next */}
          <section aria-labelledby={`${uid}-next`} className="space-y-3">
            <h2 id={`${uid}-next`} className="text-[1.25rem]">
              Apply it elsewhere
            </h2>
            {related && (
              <Link href={`/cases/${related.slug}`} className="block rounded-[var(--radius-panel)] border border-rule bg-surface p-4 hover:border-primary">
                <span className="case-id">{formatCaseNumber(related.number)}</span>
                <span className="mt-1 block font-serif text-[1.1875rem] font-semibold">{related.title}</span>
                <span className="mt-0.5 block text-meta text-ink-muted">{related.skill}</span>
              </Link>
            )}
            {sample && (
              <Link href={`/decode?sample=${sample.id}`} className={cx(linkClass, "inline-flex items-center gap-1.5")}>
                Explore this abstract in the decoder <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
              </Link>
            )}
            <p>
              <Link href="/cases" className={linkClass}>
                All investigations
              </Link>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
