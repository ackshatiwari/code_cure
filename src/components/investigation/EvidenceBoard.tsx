"use client";

import { X } from "lucide-react";
import { useId } from "react";
import type { CuratedCase, Relation } from "@/lib/schemas/case";
import type { CaseProgress } from "@/lib/investigation";
import { relationMeta, relationOrder, RelationLabel } from "@/components/evidence/relations";
import { cx } from "@/components/ui/styles";

/**
 * Canonical interaction: select a clue, choose its relation, see it grouped under
 * that relation. Works with click, touch and keyboard; no drag required.
 */
export function EvidenceBoard({
  caseData,
  progress,
  selectedClueId,
  onSelect,
  onAssign,
  onUnassign,
  locked,
}: {
  caseData: CuratedCase;
  progress: CaseProgress;
  selectedClueId: string | null;
  onSelect: (clueId: string | null) => void;
  onAssign: (clueId: string, relation: Relation) => void;
  onUnassign: (clueId: string) => void;
  locked: boolean;
}) {
  const uid = useId();
  const clues = caseData.clues;
  const opened = clues.filter((c) => progress.openedClueIds.includes(c.id));
  const unplaced = opened.filter((c) => progress.relations[c.id] === undefined);
  const unopenedCount = clues.length - opened.length;
  const selected = clues.find((c) => c.id === selectedClueId && progress.openedClueIds.includes(c.id)) ?? null;
  const placedCount = clues.filter((c) => progress.relations[c.id] !== undefined).length;

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-panel)] bg-ink px-4 py-3.5 text-surface">
        <p className="text-meta font-semibold uppercase tracking-wide text-surface/75">The exact claim</p>
        <p className="mt-1 font-serif text-[1.0625rem] leading-snug">“{caseData.claimText}”</p>
      </div>

      <p className="margin-note">
        Judge each clue against this claim&apos;s wording. An open question isn&apos;t automatically evidence against it, and a
        trustworthy source can still be irrelevant to a particular inference.
      </p>

      <p className="text-meta font-semibold tabular" aria-live="off">
        {placedCount} of {clues.length} clues placed
      </p>

      {!locked && (
        <section aria-labelledby={`${uid}-to-place`}>
          <h3 id={`${uid}-to-place`} className="font-sans text-[1rem] font-semibold">
            Clues to place
          </h3>
          {unplaced.length === 0 ? (
            <p className="mt-1 text-[0.9375rem] text-ink-muted">
              {unopenedCount > 0
                ? `Read ${unopenedCount === 1 ? "the remaining clue" : `the ${unopenedCount} remaining clues`} in Evidence to place ${unopenedCount === 1 ? "it" : "them"} here.`
                : "All clues are placed. You can still change any of them."}
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {unplaced.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={selected?.id === c.id}
                    onClick={() => onSelect(c.id)}
                    className={cx(
                      "min-h-11 rounded-[var(--radius-control)] border px-3 py-2 text-left text-[0.9375rem] font-semibold transition-colors duration-[var(--duration-fast)]",
                      selected?.id === c.id ? "border-primary bg-primary-soft text-primary" : "border-control bg-surface hover:bg-primary-soft",
                    )}
                  >
                    {c.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {unopenedCount > 0 && unplaced.length > 0 && (
            <p className="mt-2 text-meta text-ink-muted">
              {unopenedCount} {unopenedCount === 1 ? "clue hasn't" : "clues haven't"} been read yet.
            </p>
          )}
        </section>
      )}

      {selected && !locked && (
        <section aria-labelledby={`${uid}-chooser`} className="rounded-[var(--radius-panel)] border border-primary bg-surface p-4">
          <h3 id={`${uid}-chooser`} className="font-sans text-[1rem] font-semibold">
            How does “{selected.title}” relate to the claim?
          </h3>
          <div className="mt-3 grid gap-2" role="group" aria-label="Relation to the claim">
            {relationOrder.map((r) => {
              const m = relationMeta[r];
              const current = progress.relations[selected.id] === r;
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={current}
                  onClick={() => onAssign(selected.id, r)}
                  className={cx(
                    "flex min-h-12 items-center gap-2 rounded-[var(--radius-control)] border px-3 text-left font-semibold transition-colors duration-[var(--duration-fast)]",
                    current ? m.soft : "border-control bg-surface hover:bg-surface-muted",
                    m.tone,
                  )}
                >
                  <m.Icon size={20} strokeWidth={1.75} aria-hidden />
                  {m.label}
                </button>
              );
            })}
          </div>
          <button type="button" className="mt-2 min-h-11 text-meta text-ink-muted underline underline-offset-2" onClick={() => onSelect(null)}>
            Cancel
          </button>
        </section>
      )}

      <div className="relative space-y-3 border-l-2 border-rule pl-4">
        {relationOrder.map((r) => {
          const placed = clues.filter((c) => progress.relations[c.id] === r);
          return (
            <section
              key={r}
              aria-labelledby={`${uid}-group-${r}`}
              className="relative rounded-[var(--radius-panel)] border border-rule bg-surface p-3 before:absolute before:-left-[18px] before:top-5 before:h-0.5 before:w-4 before:bg-rule"
            >
              <h3 id={`${uid}-group-${r}`} className="font-sans text-[0.9375rem]">
                <RelationLabel relation={r} />
              </h3>
              {placed.length === 0 ? (
                <p className="mt-1 text-meta text-ink-muted">No clues here yet.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {placed.map((c) => (
                    <li key={c.id} className="flex items-stretch gap-1.5">
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => onSelect(c.id)}
                        aria-label={`${c.title}. Change relation`}
                        className={cx(
                          "min-h-11 flex-1 rounded-[var(--radius-control)] border px-3 py-1.5 text-left text-[0.9375rem] font-semibold",
                          selected?.id === c.id ? "border-primary bg-primary-soft" : "border-rule bg-canvas hover:border-control",
                          "disabled:cursor-default disabled:hover:border-rule",
                        )}
                      >
                        {c.title}
                      </button>
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => onUnassign(c.id)}
                          aria-label={`Remove ${c.title} from the board`}
                          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)] border border-rule hover:border-critical hover:text-critical"
                        >
                          <X size={16} strokeWidth={1.75} aria-hidden />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
