"use client";

import { ArrowRight, CircleAlert } from "lucide-react";
import { useId, useRef, useState } from "react";
import { verdictDefinitions } from "@/content/cases/verdicts";
import type { AnswerOption, CuratedCase, VerdictId } from "@/lib/schemas/case";
import { canSubmit, submitBlockers, type CaseProgress } from "@/lib/investigation";
import { buttonClass, cx } from "@/components/ui/styles";
import { useHydrated } from "@/lib/use-hydrated";

type Field = "verdictId" | "reasonId" | "headlineId";

function OptionGroup({
  legend,
  hint,
  field,
  options,
  value,
  disabled,
  onSelect,
  describe,
}: {
  legend: string;
  hint?: string;
  field: Field;
  options: AnswerOption[];
  value: string | null;
  disabled: boolean;
  onSelect: (field: Field, id: string) => void;
  describe?: (o: AnswerOption) => string | undefined;
}) {
  const name = useId();
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="font-serif text-[1.3125rem] font-semibold">{legend}</legend>
      {hint && <p className="text-[0.9375rem] text-ink-muted">{hint}</p>}
      <div className="grid gap-2">
        {options.map((o) => {
          const checked = value === o.id;
          const description = describe?.(o);
          return (
            <label
              key={o.id}
              className={cx(
                "flex min-h-12 cursor-pointer gap-3 rounded-[var(--radius-control)] border px-3.5 py-3 transition-colors duration-[var(--duration-fast)]",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                checked ? "border-primary bg-primary-soft" : "border-control bg-surface hover:bg-primary-soft/50",
                disabled && "cursor-default opacity-80",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.id}
                checked={checked}
                onChange={() => onSelect(field, o.id)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
              />
              <span>
                <span className="font-semibold">{o.label}</span>
                {description && <span className="mt-0.5 block text-[0.9375rem] text-ink-muted">{description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function VerdictForm({
  caseData,
  progress,
  locked,
  onSelect,
  onSubmit,
}: {
  caseData: CuratedCase;
  progress: CaseProgress;
  locked: boolean;
  onSelect: (field: Field, id: string) => void;
  onSubmit: () => void;
}) {
  const blockersId = useId();
  const blockersRef = useRef<HTMLDivElement>(null);
  const [tried, setTried] = useState(false);
  const hydrated = useHydrated();
  const ready = canSubmit(caseData, progress);
  const blockers = submitBlockers(caseData, progress);

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onSubmit();
        else {
          setTried(true);
          blockersRef.current?.focus();
        }
      }}
    >
      <OptionGroup
        legend="1. Which verdict best fits the exact claim?"
        field="verdictId"
        options={caseData.verdictOptions}
        value={progress.verdictId}
        disabled={locked}
        onSelect={onSelect}
        describe={(o) => verdictDefinitions[o.id as VerdictId]?.definition}
      />
      <OptionGroup
        legend="2. What is the main reasoning issue, or why is the claim supported?"
        field="reasonId"
        options={caseData.reasonOptions}
        value={progress.reasonId}
        disabled={locked}
        onSelect={onSelect}
      />
      <OptionGroup
        legend="3. Which rewritten headline best matches the evidence?"
        field="headlineId"
        options={caseData.headlineOptions}
        value={progress.headlineId}
        disabled={locked}
        onSelect={onSelect}
      />

      {!locked && (
        <div className="space-y-3 border-t border-rule pt-5">
          <button
            type="submit"
            className={buttonClass("primary", "md", "w-full sm:w-auto")}
            aria-disabled={!ready}
            disabled={!hydrated}
            aria-describedby={ready ? undefined : blockersId}
          >
            Submit verdict <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
          </button>
          {!ready && (
            <div
              id={blockersId}
              ref={blockersRef}
              tabIndex={-1}
              className={cx("text-[0.9375rem]", tried ? "rounded-[var(--radius-control)] bg-critical-soft p-3 text-critical" : "text-ink-muted")}
            >
              <p className="flex items-center gap-1.5 font-semibold">
                {tried && <CircleAlert size={16} strokeWidth={1.75} aria-hidden />}
                Before you submit:
              </p>
              <ul className="mt-1 list-disc pl-5">
                {blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-meta text-ink-muted">
            Submitting freezes this attempt. You can review explanations or practice again afterwards; your first score is kept.
          </p>
        </div>
      )}
    </form>
  );
}
