"use client";

import { ChevronDown, ClipboardCheck, Copy, Undo2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { getGlossaryEntry } from "@/content/glossary";
import {
  analysisToPlainText,
  basisLabels,
  canAnswerStatusLabels,
  contextLabels,
  fieldText,
} from "@/lib/analysis/plain-text";
import { formatNumber } from "@/lib/risk-math";
import { canAnswerQuestions, originLabels, type DecoderAnalysis, type Statement } from "@/lib/schemas/analysis";
import { LimitsPanel } from "@/components/evidence/LimitsPanel";
import { ProvenanceTag } from "@/components/evidence/ProvenanceTag";
import { TermButton } from "@/components/glossary/TermButton";
import { announce } from "@/components/ui/Announcer";
import { buttonClass, cx } from "@/components/ui/styles";

type ShowSource = (ids: string[], trigger: HTMLElement) => void;

function Anchors({ ids, onShow }: { ids: string[]; onShow: ShowSource }) {
  if (ids.length === 0) return null;
  return (
    <span className="ml-1 inline-flex flex-wrap gap-1 align-middle">
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={(e) => onShow([id], e.currentTarget)}
          className="inline-flex min-h-7 min-w-9 items-center justify-center rounded-[6px] border border-control bg-surface px-1.5 font-mono text-[0.8125rem] text-ink hover:border-primary hover:bg-primary-soft"
          aria-label={`Show source sentence ${id} in the original text`}
        >
          {id}
        </button>
      ))}
    </span>
  );
}

function BasisNote({ s }: { s: Statement }) {
  return (
    <span
      className={cx(
        "mt-0.5 block text-meta",
        s.basis === "general_context" ? "text-caution" : s.basis === "not_reported" ? "text-ink-muted italic" : "text-ink-muted",
      )}
    >
      {basisLabels[s.basis]}
    </span>
  );
}

function StatementList({ items, onShow, empty }: { items: Statement[]; onShow: ShowSource; empty: string }) {
  if (items.length === 0) return <p className="text-ink-muted">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((s, i) => (
        <li key={i}>
          <p>
            {s.text}
            <Anchors ids={s.sourceSentenceIds} onShow={onShow} />
          </p>
          {s.justification && <p className="text-[0.9375rem] text-ink-muted">{s.justification}</p>}
          <BasisNote s={s} />
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group border-t border-rule" open={defaultOpen}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-serif text-[1.25rem] font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown size={20} strokeWidth={1.75} className="shrink-0 transition-transform duration-[var(--duration-fast)] group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}

export function DecoderOutput({ analysis, stale }: { analysis: DecoderAnalysis; stale: boolean }) {
  const uid = useId();
  const [highlight, setHighlight] = useState<string[]>([]);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "fallback">("idle");
  const returnTo = useRef<HTMLElement | null>(null);
  const sentenceRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const isStudy = analysis.inputKind === "study_abstract";

  const showSource: ShowSource = (ids, trigger) => {
    returnTo.current = trigger;
    setSourceOpen(true);
    setHighlight(ids);
    requestAnimationFrame(() => {
      const el = sentenceRefs.current[ids[0]];
      if (el) {
        el.scrollIntoView({ block: "center" });
        el.focus({ preventScroll: true });
      }
    });
    announce(`Showing sentence ${ids.join(", ")} in the original text.`);
  };

  const backToExplanation = () => {
    const t = returnTo.current;
    if (t && t.isConnected) {
      t.scrollIntoView({ block: "center" });
      t.focus({ preventScroll: true });
    }
  };

  const copy = async () => {
    const text = analysisToPlainText(analysis);
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      announce("Explanation copied as plain text.");
    } catch {
      setCopyState("fallback");
      requestAnimationFrame(() => {
        fallbackRef.current?.focus();
        fallbackRef.current?.select();
      });
    }
  };

  const fields: Array<[string, (typeof analysis)["sampleSize"]]> = [
    ["Population or model", analysis.populationOrModel],
    ["Sample size", analysis.sampleSize],
    ["Eligibility", analysis.eligibility],
    ["Setting", analysis.setting],
    ["Comparison", analysis.comparison],
    ["Follow-up", analysis.followUp],
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
      <article aria-labelledby={`${uid}-h`} className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <ProvenanceTag tone={analysis.origin === "ai_generated" ? "ai" : "fictional"}>{originLabels[analysis.origin]}</ProvenanceTag>
          {analysis.provenanceNote && <ProvenanceTag>{analysis.provenanceNote}</ProvenanceTag>}
          <span className="text-meta font-semibold text-ink-muted">Based on the pasted abstract</span>
        </div>
        {stale && (
          <p className="mt-3 rounded-[var(--radius-control)] bg-caution-soft p-3 text-[0.9375rem] text-caution" role="status">
            You&apos;ve edited the text since this explanation was made. It still describes the earlier version; decode again to update it.
          </p>
        )}
        {analysis.userTitle && (
          <p className="mt-3 text-meta text-ink-muted">
            {analysis.origin === "ai_generated" ? "Title you entered (not verified)" : "Sample title"}:{" "}
            <span className="text-ink">{analysis.userTitle}</span>
          </p>
        )}

        <h2 id={`${uid}-h`} className="mt-4 text-[1.75rem]">
          {isStudy ? "Quick summary" : "This text couldn't be read as a study"}
        </h2>
        {!isStudy && (
          <p className="mt-2 annotation-caution reading p-3.5">
            {analysis.inputKind === "insufficient_information" && "There isn't enough information in this text to explain a study. "}
            {analysis.inputKind === "non_study_text" && "This doesn't look like a description of a research study. "}
            {analysis.inputKind === "unsupported_language" && "This text appears to be in a language the decoder doesn't support yet. "}
            {analysis.inputKindNote}
          </p>
        )}
        {analysis.plainLanguageQuestion && (
          <p className="mt-3 font-serif text-[1.3125rem] leading-snug">{analysis.plainLanguageQuestion}</p>
        )}
        {analysis.summary && <p className="reading mt-3">{analysis.summary}</p>}

        {isStudy && (
          <dl className="mt-4 grid gap-3 text-[0.9375rem] sm:grid-cols-3">
            <div className="rounded-[var(--radius-control)] bg-surface-muted p-3">
              <dt className="text-meta font-semibold text-ink-muted">Studied</dt>
              <dd className="font-semibold">
                {contextLabels[analysis.studyContext.value]}
                <Anchors ids={analysis.studyContext.sourceSentenceIds} onShow={showSource} />
              </dd>
            </div>
            <div className="rounded-[var(--radius-control)] bg-surface-muted p-3">
              <dt className="text-meta font-semibold text-ink-muted">Design</dt>
              <dd className="font-semibold">
                {analysis.studyDesign.value ?? "Not reported"}
                <span className="block text-meta font-normal text-ink-muted">
                  {analysis.studyDesign.status === "explicit" ? "Stated in the text" : analysis.studyDesign.status === "inferred" ? "Inferred, not stated" : "Not reported in the pasted abstract"}
                </span>
                <Anchors ids={analysis.studyDesign.sourceSentenceIds} onShow={showSource} />
              </dd>
            </div>
            <div className="rounded-[var(--radius-control)] bg-surface-muted p-3">
              <dt className="text-meta font-semibold text-ink-muted">Sample size</dt>
              <dd className="font-semibold">
                {fieldText(analysis.sampleSize)}
                <Anchors ids={analysis.sampleSize.sourceSentenceIds} onShow={showSource} />
              </dd>
            </div>
          </dl>
        )}

        <p className="margin-note mt-5">An abstract leaves out details. Check the original paper before drawing broader conclusions.</p>

        {isStudy && (
          <LimitsPanel
            className="mt-6"
            idPrefix={`${uid}-limits`}
            headingLevel={3}
            supported={analysis.supportedConclusions.map((s) => ({
              text: s.text,
              justification: s.justification,
              extra: (
                <p className="text-meta text-ink-muted">
                  {basisLabels[s.basis]}
                  <Anchors ids={s.sourceSentenceIds} onShow={showSource} />
                </p>
              ),
            }))}
            notEstablished={analysis.doesNotEstablish.map((s) => ({
              text: s.text,
              justification: s.justification,
              extra: (
                <p className="text-meta text-ink-muted">
                  {basisLabels[s.basis]}
                  <Anchors ids={s.sourceSentenceIds} onShow={showSource} />
                </p>
              ),
            }))}
          />
        )}

        <div className="mt-8">
          <Section title="1. What researchers asked" defaultOpen>
            <p>{analysis.plainLanguageQuestion ?? "The text doesn't state a research question clearly."}</p>
          </Section>
          {isStudy && (
            <Section title="2. Who or what was studied">
              <dl className="divide-y divide-rule border-y border-rule text-[0.9375rem]">
                {fields.map(([label, f]) => (
                  <div key={label} className="grid gap-1 py-2 sm:grid-cols-[10rem_1fr] sm:gap-4">
                    <dt className="font-semibold">{label}</dt>
                    <dd className={cx(f.status === "not_reported" && "text-caution")}>
                      {fieldText(f)}
                      <Anchors ids={f.sourceSentenceIds} onShow={showSource} />
                    </dd>
                  </div>
                ))}
              </dl>
              {analysis.missingFields.length > 0 && (
                <p className="mt-3 text-[0.9375rem]">
                  <span className="font-semibold">Not reported in the pasted abstract: </span>
                  {analysis.missingFields.join(", ")}.
                </p>
              )}
            </Section>
          )}
          {isStudy && (
            <Section title="3. What they found" defaultOpen>
              <StatementList items={analysis.findings} onShow={showSource} empty="No findings were identified in the text." />
              {analysis.numericResults.length > 0 && (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[32rem] text-left text-[0.9375rem]">
                    <caption className="mb-2 text-left text-meta font-semibold text-ink-muted">Numbers exactly as reported</caption>
                    <thead className="border-b border-control text-meta text-ink-muted">
                      <tr>
                        <th scope="col" className="py-2 pr-3 font-semibold">Result</th>
                        <th scope="col" className="py-2 pr-3 font-semibold">Reported value</th>
                        <th scope="col" className="py-2 pr-3 font-semibold">Time window</th>
                        <th scope="col" className="py-2 font-semibold">Uncertainty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rule tabular">
                      {analysis.numericResults.map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 pr-3">
                            {r.description}
                            <Anchors ids={r.sourceSentenceIds} onShow={showSource} />
                          </td>
                          <td className="py-2 pr-3 font-semibold">{r.reportedValue}</td>
                          <td className="py-2 pr-3">{r.timeWindow ?? <span className="text-caution">Not reported</span>}</td>
                          <td className="py-2">{r.uncertainty ?? <span className="text-caution">Not reported</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {analysis.calculations.map((c) => {
                const r = analysis.numericResults[c.numericResultIndex];
                const g = r.groupCounts!;
                return (
                  <div key={c.numericResultIndex} className="mt-4 rounded-[var(--radius-control)] border border-rule bg-surface-muted/60 p-4 text-[0.9375rem]">
                    <p className="text-meta font-semibold text-ink-muted">Calculated by Paper2People from the reported counts</p>
                    <p className="mt-1 tabular">
                      {g.baselineLabel}: {g.baselineEvents} of {g.baselineTotal.toLocaleString("en-US")} = {formatNumber(c.baselineRiskPercent)}%.{" "}
                      {g.comparisonLabel}: {g.comparisonEvents} of {g.comparisonTotal.toLocaleString("en-US")} = {formatNumber(c.comparisonRiskPercent)}%.
                    </p>
                    <p className="mt-1 tabular">
                      Absolute difference: <strong>{formatNumber(c.percentagePoints)} percentage points</strong> ({formatNumber(c.perThousand)} per 1,000)
                      {c.relativeReductionPercent !== null && (
                        <>
                          {" "}· Relative reduction: <strong>{formatNumber(c.relativeReductionPercent)}%</strong>
                        </>
                      )}
                      {r.timeWindow ? `, ${r.timeWindow.toLowerCase()}` : ""}.
                    </p>
                  </div>
                );
              })}
            </Section>
          )}
          {isStudy && (
            <Section title="4. Important limitations">
              <h3 className="font-sans text-[1rem] font-semibold">Reported by the authors</h3>
              <div className="mt-2">
                <StatementList items={analysis.reportedLimitations} onShow={showSource} empty="No limitations are stated in the pasted text." />
              </div>
              <h3 className="mt-5 font-sans text-[1rem] font-semibold">General design considerations</h3>
              <div className="mt-2">
                <StatementList items={analysis.designConsiderations} onShow={showSource} empty="None listed." />
              </div>
            </Section>
          )}
          <Section title="5. What remains unanswered by this text">
            <p className="mb-3 text-[0.9375rem] text-ink-muted">
              These are questions this text doesn&apos;t resolve. Other research may answer some of them.
            </p>
            <StatementList items={analysis.unansweredQuestions} onShow={showSource} empty="None listed." />
          </Section>
          {isStudy && analysis.canThisAnswer.length > 0 && (
            <Section title="6. Can this answer…">
              <ul className="divide-y divide-rule border-y border-rule">
                {analysis.canThisAnswer.map((c) => (
                  <li key={c.id} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_11rem] sm:gap-4">
                    <div>
                      <p className="font-semibold">{canAnswerQuestions[c.id]}</p>
                      <p className="text-[0.9375rem] text-ink-muted">
                        {c.reason}
                        <Anchors ids={c.sourceSentenceIds} onShow={showSource} />
                      </p>
                    </div>
                    <p
                      className={cx(
                        "font-semibold sm:text-right",
                        c.status === "reported" ? "text-primary" : c.status === "not_established" ? "text-caution" : "text-ink-muted",
                      )}
                    >
                      {canAnswerStatusLabels[c.status]}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {analysis.glossaryTermIds.length > 0 && (
            <Section title="7. Research terms in plain language">
              <dl className="space-y-3">
                {analysis.glossaryTermIds.map((id) => {
                  const e = getGlossaryEntry(id)!;
                  return (
                    <div key={id}>
                      <dt className="font-semibold">
                        <TermButton termId={id}>{e.term}</TermButton>
                      </dt>
                      <dd className="text-[0.9375rem]">{e.definition}</dd>
                    </div>
                  );
                })}
              </dl>
            </Section>
          )}
        </div>

        <div className="mt-6 border-t border-rule pt-5">
          <button type="button" className={buttonClass("secondary", "sm")} onClick={copy}>
            {copyState === "copied" ? <ClipboardCheck size={16} strokeWidth={1.75} aria-hidden /> : <Copy size={16} strokeWidth={1.75} aria-hidden />}
            {copyState === "copied" ? "Copied" : "Copy explanation"}
          </button>
          {copyState === "copied" && <p className="mt-2 text-meta text-primary">Copied as plain text, including where it came from and what it covers.</p>}
          {copyState === "fallback" && (
            <div className="mt-3">
              <label htmlFor={`${uid}-copy`} className="text-[0.9375rem] font-semibold">
                Your browser blocked copying. Select this text and copy it yourself.
              </label>
              <textarea id={`${uid}-copy`} ref={fallbackRef} readOnly rows={8} value={analysisToPlainText(analysis)} className="mt-2 w-full rounded-[var(--radius-control)] border border-control bg-surface p-3 font-mono text-[0.8125rem]" />
            </div>
          )}
        </div>
      </article>

      <aside aria-labelledby={`${uid}-src`} className="min-w-0 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-[var(--radius-panel)] border border-rule bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
            <h2 id={`${uid}-src`} className="text-[1.25rem]">
              The original text
            </h2>
            <button
              type="button"
              className={buttonClass("quiet", "sm", "lg:hidden")}
              aria-expanded={sourceOpen}
              aria-controls={`${uid}-srcbody`}
              onClick={() => setSourceOpen((o) => !o)}
            >
              {sourceOpen ? "Hide" : "Show the original text"}
            </button>
          </div>
          <div id={`${uid}-srcbody`} className={cx("px-4 py-4 lg:block lg:max-h-[75vh] lg:overflow-y-auto", !sourceOpen && "max-lg:hidden")}>
            <p className="mb-3 text-meta text-ink-muted">
              Numbered sentences come straight from the submitted text. A matching number shows where a point came from; it doesn&apos;t
              prove the interpretation is right.
            </p>
            <p className="font-serif text-[1.0625rem] leading-relaxed">
              {analysis.sourceSentences.map((s) => (
                <span key={s.id}>
                  <span
                    ref={(el) => void (sentenceRefs.current[s.id] = el)}
                    tabIndex={-1}
                    className={cx("rounded-sm", highlight.includes(s.id) && "sentence-highlight")}
                  >
                    <span className="mr-1 font-mono text-[0.75rem] text-ink-muted" aria-label={`Sentence ${s.id}`}>
                      {s.id}
                    </span>
                    {s.text}
                  </span>{" "}
                </span>
              ))}
            </p>
            {highlight.length > 0 && (
              <button type="button" className={buttonClass("secondary", "sm", "mt-4")} onClick={backToExplanation}>
                <Undo2 size={16} strokeWidth={1.75} aria-hidden /> Back to the explanation
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
