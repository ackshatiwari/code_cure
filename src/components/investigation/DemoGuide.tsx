"use client";

import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { buttonClass, cx } from "@/components/ui/styles";

export interface DemoStep {
  id: string;
  label: string;
  hint: string;
  done: boolean;
}

/**
 * Compact hints for the rehearsed presentation. Steps complete only when the
 * presenter actually performs the action; nothing is clicked or scored for them.
 */
export function DemoGuide({ steps, onRestart }: { steps: DemoStep[]; onRestart: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const current = steps.find((s) => !s.done);
  return (
    <aside aria-label="Guided demo" className="rounded-[var(--radius-panel)] border border-primary/40 bg-primary-soft/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-meta font-semibold uppercase tracking-wide text-primary">Guided demo</p>
          <p className="mt-0.5 font-semibold">{current ? current.hint : "Demo complete. Review the explanation below."}</p>
        </div>
        {confirming ? (
          <div className="flex flex-wrap items-center gap-2 text-[0.9375rem]">
            <span>Restart the demo attempt? Your regular Case 01 progress is not affected.</span>
            <button
              type="button"
              className={buttonClass("secondary", "sm")}
              onClick={() => {
                setConfirming(false);
                onRestart();
              }}
            >
              Restart demo
            </button>
            <button type="button" className={buttonClass("quiet", "sm")} onClick={() => setConfirming(false)}>
              Keep going
            </button>
          </div>
        ) : (
          <button type="button" className={buttonClass("quiet", "sm")} onClick={() => setConfirming(true)}>
            <RotateCcw size={16} strokeWidth={1.75} aria-hidden /> Restart demo
          </button>
        )}
      </div>
      <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-meta">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className={cx("inline-flex items-center gap-1.5", s.done ? "text-primary" : s === current ? "font-semibold text-ink" : "text-ink-muted")}
            aria-current={s === current ? "step" : undefined}
          >
            <span
              className={cx(
                "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.75rem] tabular",
                s.done ? "border-primary bg-primary text-surface" : "border-control bg-surface",
              )}
              aria-hidden
            >
              {s.done ? <Check size={12} strokeWidth={2.5} /> : i + 1}
            </span>
            {s.label}
            <span className="sr-only">{s.done ? " (done)" : ""}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
