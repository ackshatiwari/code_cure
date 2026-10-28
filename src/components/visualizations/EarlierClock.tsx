"use client";

import { useId, useState } from "react";
import type { CuratedCase } from "@/lib/schemas/case";
import { announce } from "@/components/ui/Announcer";
import { buttonClass, cx } from "@/components/ui/styles";

type TimelineExample = NonNullable<CuratedCase["timelineExample"]>;
type Answer = "survival" | "lifespan" | "both";

const answers: Array<{ id: Answer; label: string }> = [
  { id: "survival", label: "Only the time after diagnosis" },
  { id: "lifespan", label: "Only the total lifespan" },
  { id: "both", label: "Both" },
];

export function EarlierClock({ example }: { example: TimelineExample }) {
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const name = useId();
  const { axisStart, axisEnd, paths } = example;
  const span = axisEnd - axisStart;
  const pos = (age: number) => `${((age - axisStart) / span) * 100}%`;
  const ticks = Array.from({ length: Math.floor(span / 5) + 1 }, (_, i) => axisStart + i * 5);
  const [late, early] = paths;
  const visible = revealed ? paths : [late];

  return (
    <figure className="rounded-[var(--radius-panel)] border border-rule bg-surface p-4 sm:p-5" aria-labelledby={`${name}-title`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h4 id={`${name}-title`} className="font-serif text-xl font-semibold">
          The earlier clock
        </h4>
        <span className="text-meta text-ink-muted">Hypothetical illustration · one person, two paths</span>
      </div>

      <div className="mt-4 space-y-5" aria-hidden="true">
        {visible.map((p) => (
          <div key={p.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-[0.9375rem]">
              <span className="font-semibold">{p.label}</span>
              <span className="tabular">
                Diagnosed at {p.diagnosisAge} · {p.endAge - p.diagnosisAge} years after diagnosis
              </span>
            </div>
            <div className="relative mt-1.5 h-8">
              <div className="absolute inset-y-3 left-0 right-0 rounded-full bg-surface-muted" />
              <div className="absolute inset-y-3 left-0 rounded-l-full bg-ink/25" style={{ width: pos(p.diagnosisAge) }} />
              <div
                className="absolute inset-y-1.5 rounded-[4px] bg-primary transition-[left,width] duration-[var(--duration-base)] ease-[var(--ease)]"
                style={{ left: pos(p.diagnosisAge), width: `calc(${pos(p.endAge)} - ${pos(p.diagnosisAge)})` }}
              />
              <div className="absolute inset-y-0 w-0.5 bg-ink" style={{ left: pos(p.endAge) }} />
            </div>
          </div>
        ))}
        <div className="relative h-6 border-t border-control text-meta text-ink-muted tabular">
          {ticks.map((t) => (
            <span key={t} className="absolute top-1 -translate-x-1/2" style={{ left: pos(t) }}>
              {t}
            </span>
          ))}
        </div>
        <p className="text-meta text-ink-muted">
          Age in years. Green shows time after diagnosis. The dark line marks the end of life at age {late.endAge}.
        </p>
      </div>

      <div className="sr-only">
        <p>Age axis from {axisStart} to {axisEnd}.</p>
        <ul>
          {visible.map((p) => (
            <li key={p.id}>
              {p.label}: diagnosed at age {p.diagnosisAge}, life ends at age {p.endAge}, so {p.endAge - p.diagnosisAge} years after
              diagnosis.
            </li>
          ))}
        </ul>
      </div>

      {!revealed ? (
        <button
          type="button"
          className={buttonClass("secondary", "md", "mt-4")}
          onClick={() => {
            setRevealed(true);
            announce(`Screened path shown: diagnosed at ${early.diagnosisAge}, life ends at ${early.endAge}.`);
          }}
        >
          Show the screened path
        </button>
      ) : (
        <fieldset className="mt-5">
          <legend className="font-semibold">In this illustration, what changed between the two paths?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {answers.map((a) => (
              <label
                key={a.id}
                className={cx(
                  "flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border px-3 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary",
                  answer === a.id ? "border-primary bg-primary-soft" : "border-control bg-surface hover:bg-primary-soft",
                )}
              >
                <input type="radio" name={name} checked={answer === a.id} onChange={() => setAnswer(a.id)} className="accent-[var(--primary)]" />
                {a.label}
              </label>
            ))}
          </div>
          {answer && (
            <p className={cx("mt-3", answer === "survival" ? "margin-note" : "annotation-caution p-3")} role="status">
              {answer === "survival"
                ? `Right. Time after diagnosis grew from ${late.endAge - late.diagnosisAge} to ${early.endAge - early.diagnosisAge} years, but life ends at ${early.endAge} in both paths.`
                : `Look at where each timeline ends. Both paths end at age ${late.endAge}; only the starting point of the survival clock moved.`}
            </p>
          )}
        </fieldset>
      )}

      <figcaption className="mt-4 text-[0.9375rem] text-ink-muted">
        This illustration doesn&apos;t show that screening is ineffective. It shows why survival after diagnosis alone can&apos;t
        tell you whether a screening test extends lives.
      </figcaption>
    </figure>
  );
}
