"use client";

import { useId, useState } from "react";
import type { CuratedCase } from "@/lib/schemas/case";
import { compareRisks, formatNumber, formatPercent } from "@/lib/risk-math";
import { announce } from "@/components/ui/Announcer";
import { cx } from "@/components/ui/styles";

type RiskExample = NonNullable<CuratedCase["riskExample"]>;
type View = "relative" | "absolute";

/** Picks an axis maximum and step so the scale starts at zero and is never truncated. */
function niceScale(maxPercent: number) {
  const steps = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25];
  const step = steps.find((s) => maxPercent / s <= 6) ?? 25;
  const max = Math.max(step, Math.ceil((maxPercent * 1.15) / step) * step);
  const ticks: number[] = [];
  for (let t = 0; t <= max + 1e-9; t += step) ticks.push(Number(t.toFixed(4)));
  return { max, ticks };
}

export function RiskInContext({ example }: { example: RiskExample }) {
  const [view, setView] = useState<View>("absolute");
  const name = useId();
  const [baseline, other] = example.groups;
  const cmp = compareRisks(baseline, other);
  if (!cmp.ok) return <p className="text-critical">{cmp.message}</p>;
  const r = cmp.value;
  const basePct = r.baselineRisk * 100;
  const otherPct = r.comparisonRisk * 100;
  const { max, ticks } = niceScale(Math.max(basePct, otherPct));
  const w = (pct: number) => `${(pct / max) * 100}%`;
  const rel = r.relativeReduction;

  const choose = (v: View) => {
    setView(v);
    announce(
      v === "relative"
        ? `Relative view: ${formatPercent(rel ?? 0)} of the comparison group's risk.`
        : `Absolute view: ${formatNumber(r.percentagePoints)} percentage points, ${formatNumber(r.perThousand)} per 1,000.`,
    );
  };

  return (
    <figure className="rounded-[var(--radius-panel)] border border-rule bg-surface p-4 sm:p-5" aria-labelledby={`${name}-title`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h4 id={`${name}-title`} className="font-serif text-xl font-semibold">
          Risk in context
        </h4>
        <span className="text-meta text-ink-muted">Over {example.years} years · same people in both views</span>
      </div>

      <fieldset className="mt-3">
        <legend className="text-meta font-semibold">Show the difference as</legend>
        <div className="mt-1.5 inline-grid grid-cols-2 rounded-[var(--radius-control)] border border-control p-1">
          {(["relative", "absolute"] as const).map((v) => (
            <label
              key={v}
              className={cx(
                "flex min-h-11 cursor-pointer items-center justify-center rounded-[6px] px-4 text-control font-semibold transition-colors duration-[var(--duration-fast)] has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary",
                view === v ? "bg-primary text-surface" : "text-ink hover:bg-primary-soft",
              )}
            >
              <input type="radio" name={name} value={v} checked={view === v} onChange={() => choose(v)} className="sr-only" />
              {v === "relative" ? "Relative change" : "Absolute change"}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Bars share a zero baseline and a numeric scale. */}
      <div className="mt-5 space-y-4" aria-hidden="true">
        {[
          { g: baseline, pct: basePct, isBase: true },
          { g: other, pct: otherPct, isBase: false },
        ].map(({ g, pct, isBase }) => (
          <div key={g.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-[0.9375rem]">
              <span className="font-semibold">{g.label}</span>
              <span className="tabular">
                {g.events.toLocaleString("en-US")} per {g.total.toLocaleString("en-US")} ({formatPercent(pct / 100)})
              </span>
            </div>
            <div className="relative mt-1 h-7 rounded-[4px] bg-surface-muted">
              <div className={cx("absolute inset-y-0 left-0 rounded-[4px]", isBase ? "bg-ink/70" : "bg-primary")} style={{ width: w(pct) }} />
              {isBase && view === "relative" && (
                <>
                  {[0.25, 0.5, 0.75].map((q) => (
                    <div key={q} className="absolute inset-y-0 w-px bg-surface" style={{ left: w(pct * q) }} />
                  ))}
                </>
              )}
              {!isBase && (
                <div
                  className={cx(
                    "absolute inset-y-0 rounded-r-[4px] border-2 border-dashed",
                    view === "absolute" ? "border-caution bg-caution-soft" : "border-caution bg-[repeating-linear-gradient(45deg,var(--caution-soft)_0_6px,transparent_6px_10px)]",
                  )}
                  style={{ left: w(otherPct), width: w(basePct - otherPct) }}
                />
              )}
            </div>
          </div>
        ))}
        <div className="relative h-6 border-t border-control text-meta text-ink-muted tabular">
          {ticks.map((t) => (
            <span key={t} className="absolute top-1 -translate-x-1/2" style={{ left: w(t) }}>
              {formatNumber(t)}%
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 annotation-caution p-3.5" aria-live="off">
        {view === "absolute" ? (
          <p>
            <strong className="tabular">
              {formatNumber(r.percentagePoints)} percentage points
            </strong>{" "}
            lower: {formatNumber(r.perThousand)} fewer per 1,000 people over {example.years} years (
            {formatPercent(r.baselineRisk)} − {formatPercent(r.comparisonRisk)}).
          </p>
        ) : rel === null ? (
          <p>A relative change can&apos;t be calculated because the comparison group had no events.</p>
        ) : (
          <p>
            <strong className="tabular">{formatPercent(rel)} lower</strong> relative to the comparison group: the gap of{" "}
            {formatPercent(r.absoluteDifference)} is {formatPercent(rel)} of the comparison group&apos;s{" "}
            {formatPercent(r.baselineRisk)}. The bar above is split into quarters to show it.
          </p>
        )}
      </div>

      <NaturalFrequency example={example} />

      <figcaption className="mt-4 text-[0.9375rem] text-ink-muted">
        The underlying counts never change: {baseline.events} of {baseline.total.toLocaleString("en-US")} in the{" "}
        {baseline.label.toLowerCase()} and {other.events} of {other.total.toLocaleString("en-US")} in the {other.label.toLowerCase()}, over{" "}
        {example.years} years. That is a {rel === null ? "non-calculable" : formatPercent(rel)} relative reduction and a{" "}
        {formatNumber(r.percentagePoints)} percentage-point absolute difference.
      </figcaption>
    </figure>
  );
}

const COLS = 50;
const CELL = 8;

function FrequencyGrid({ events, total, missing = 0, label }: { events: number; total: number; missing?: number; label: string }) {
  const rows = Math.ceil(total / COLS);
  const id = useId().replace(/:/g, "");
  const cellAt = (i: number) => ({ x: (i % COLS) * CELL + 1, y: Math.floor(i / COLS) * CELL + 1 });
  return (
    <svg
      viewBox={`0 0 ${COLS * CELL} ${rows * CELL}`}
      className="h-auto w-full max-w-[400px]"
      role="img"
      aria-label={label}
    >
      <defs>
        <pattern id={`p${id}`} width={CELL} height={CELL} patternUnits="userSpaceOnUse">
          <rect x="1" y="1" width={CELL - 2} height={CELL - 2} rx="1" fill="#D8D8CD" />
        </pattern>
      </defs>
      <rect width={COLS * CELL} height={rows * CELL} fill={`url(#p${id})`} />
      {Array.from({ length: events }, (_, i) => {
        const { x, y } = cellAt(i);
        return <rect key={i} x={x} y={y} width={CELL - 2} height={CELL - 2} rx="1" fill="#182D2A" />;
      })}
      {Array.from({ length: missing }, (_, j) => {
        const { x, y } = cellAt(events + j);
        return <rect key={`m${j}`} x={x - 0.5} y={y - 0.5} width={CELL - 1} height={CELL - 1} rx="1" fill="#FBF0DB" stroke="#855419" strokeWidth="1" />;
      })}
    </svg>
  );
}

function NaturalFrequency({ example }: { example: RiskExample }) {
  const [baseline, other] = example.groups;
  const fewer = Math.max(0, baseline.events - other.events);
  const sameDenominator = baseline.total === other.total;
  return (
    <div className="mt-5">
      <h5 className="font-sans text-[1rem] font-semibold">As counts out of {baseline.total.toLocaleString("en-US")} people</h5>
      <p className="text-meta text-ink-muted">
        Each square is one person. Dark squares had the {example.outcomeLabel} during the {example.years} years.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[0.9375rem]">
            <span className="font-semibold">{baseline.label}:</span> <span className="tabular">{baseline.events}</span> of{" "}
            {baseline.total.toLocaleString("en-US")}
          </p>
          <FrequencyGrid events={baseline.events} total={baseline.total} label={`${baseline.events} of ${baseline.total} people in the ${baseline.label.toLowerCase()} had the outcome.`} />
        </div>
        <div>
          <p className="text-[0.9375rem]">
            <span className="font-semibold">{other.label}:</span> <span className="tabular">{other.events}</span> of{" "}
            {other.total.toLocaleString("en-US")}
            {sameDenominator && fewer > 0 && <span className="text-caution"> ({fewer} fewer, outlined)</span>}
          </p>
          <FrequencyGrid
            events={other.events}
            total={other.total}
            missing={sameDenominator ? fewer : 0}
            label={`${other.events} of ${other.total} people in the ${other.label.toLowerCase()} had the outcome${sameDenominator && fewer > 0 ? `; ${fewer} fewer than the comparison group` : ""}.`}
          />
        </div>
      </div>
    </div>
  );
}
