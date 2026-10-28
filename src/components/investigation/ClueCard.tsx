"use client";

import { Check, ChevronRight } from "lucide-react";
import type { Clue, CuratedCase, Relation } from "@/lib/schemas/case";
import { ProvenanceTag } from "@/components/evidence/ProvenanceTag";
import { RelationLabel } from "@/components/evidence/relations";
import { SourceDrawer } from "@/components/evidence/SourceDrawer";
import { TermList } from "@/components/glossary/TermButton";
import { buttonClass, cx } from "@/components/ui/styles";
import { EarlierClock } from "@/components/visualizations/EarlierClock";
import { RiskInContext } from "@/components/visualizations/RiskInContext";

const kindLabels: Record<Clue["kind"], string> = {
  study_details: "Study details",
  numbers_outcome: "Numbers and outcome",
  missing_context: "Missing context and source check",
};

const originLabels: Record<Clue["materialOrigin"], { text: string; tone: "fictional" | "real" }> = {
  fictional_teaching_example: { text: "From the fictional teaching material", tone: "fictional" },
  hypothetical_illustration: { text: "From the hypothetical illustration", tone: "fictional" },
  real_source_summary: { text: "Summarizing real public sources", tone: "real" },
};

export function ClueCard({
  caseData,
  clue,
  index,
  opened,
  relation,
  locked,
  onOpen,
  onPlace,
  onRiskViewChange,
  highlighted,
}: {
  caseData: CuratedCase;
  clue: Clue;
  index: number;
  opened: boolean;
  relation: Relation | undefined;
  locked: boolean;
  onOpen: () => void;
  onPlace: () => void;
  onRiskViewChange?: () => void;
  highlighted: boolean;
}) {
  const bodyId = `clue-body-${clue.id}`;
  const showRisk = clue.kind === "numbers_outcome" && caseData.riskExample;
  const showTimeline = clue.kind === "numbers_outcome" && caseData.timelineExample;
  return (
    <li
      className={cx(
        "rounded-[var(--radius-panel)] border bg-surface transition-[border-color,box-shadow] duration-[var(--duration-base)]",
        highlighted ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-rule",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-meta font-semibold text-ink-muted">
            Clue {index + 1}
            <span className="sr-only"> · {kindLabels[clue.kind]}</span>
          </p>
          <h3 className="mt-1 font-sans text-[1.125rem] font-semibold leading-snug">{clue.title}</h3>
        </div>
        {opened ? (
          <span className="inline-flex items-center gap-1 text-meta font-semibold text-primary">
            <Check size={16} strokeWidth={2} aria-hidden /> Read
          </span>
        ) : (
          <button type="button" className={buttonClass("secondary", "sm")} aria-expanded={false} aria-controls={bodyId} onClick={onOpen} disabled={locked}>
            Read this clue <ChevronRight size={16} strokeWidth={1.75} aria-hidden />
          </button>
        )}
      </div>

      {opened && (
        <div id={bodyId} className="space-y-4 border-t border-rule px-4 pb-5 pt-4 sm:px-5">
          <ProvenanceTag tone={originLabels[clue.materialOrigin].tone}>{originLabels[clue.materialOrigin].text}</ProvenanceTag>
          {clue.body.map((p) => (
            <p key={p} className="reading">
              {p}
            </p>
          ))}
          {clue.excerpt && (
            <blockquote className="bracket reading font-serif text-[1.125rem] italic leading-relaxed text-ink">
              {clue.excerpt}
            </blockquote>
          )}
          {showRisk && <RiskInContextWithCallback example={caseData.riskExample!} onChange={onRiskViewChange} />}
          {showTimeline && <EarlierClock example={caseData.timelineExample!} />}
          <TermList termIds={clue.glossaryTermIds} label="Terms in this clue" />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-3">
            <SourceDrawer sourceIds={clue.sourceIds} />
            {relation ? (
              <span className="flex flex-wrap items-center gap-2 text-meta">
                On the board: <RelationLabel relation={relation} short />
                {!locked && (
                  <button type="button" className={buttonClass("quiet", "sm")} onClick={onPlace}>
                    Change
                  </button>
                )}
              </span>
            ) : (
              <button type="button" className={buttonClass("primary", "sm")} onClick={onPlace} disabled={locked}>
                Decide how it relates
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function RiskInContextWithCallback({ example, onChange }: { example: NonNullable<CuratedCase["riskExample"]>; onChange?: () => void }) {
  return (
    <div onChangeCapture={onChange}>
      <RiskInContext example={example} />
    </div>
  );
}
