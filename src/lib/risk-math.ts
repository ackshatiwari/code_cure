/**
 * Pure helpers for comparing two observed risks from counts.
 *
 * Calculations use integer cross-multiplication and a single division so results
 * such as 0.5 percentage points come out exactly, not as 0.49999… This module only
 * works from event counts and denominators. It deliberately has no way to turn a
 * hazard ratio or odds ratio into an absolute risk: that needs baseline event rates
 * and a justified method, which a pasted abstract rarely supplies.
 */

export type RiskInputError =
  | "missing_denominator"
  | "non_integer"
  | "negative_value"
  | "events_exceed_total"
  | "not_a_number";

export type Result<T> = { ok: true; value: T } | { ok: false; error: RiskInputError; message: string };

export interface GroupCounts {
  events: number | null | undefined;
  total: number | null | undefined;
}

const messages: Record<RiskInputError, string> = {
  missing_denominator: "A risk needs a denominator: the number of people the count is out of.",
  non_integer: "Counts of people must be whole numbers.",
  negative_value: "Counts cannot be negative.",
  events_exceed_total: "The number of events cannot be larger than the group size.",
  not_a_number: "Both a count and a group size are needed.",
};

function fail<T>(error: RiskInputError): Result<T> {
  return { ok: false, error, message: messages[error] };
}

function validate(g: GroupCounts): Result<{ events: number; total: number }> {
  const { events, total } = g;
  if (total === null || total === undefined || total === 0) return fail("missing_denominator");
  if (events === null || events === undefined) return fail("not_a_number");
  if (!Number.isFinite(events) || !Number.isFinite(total)) return fail("not_a_number");
  if (!Number.isInteger(events) || !Number.isInteger(total)) return fail("non_integer");
  if (events < 0 || total < 0) return fail("negative_value");
  if (events > total) return fail("events_exceed_total");
  return { ok: true, value: { events, total } };
}

/** Observed risk as a proportion (0–1). */
export function riskFromCounts(g: GroupCounts): Result<number> {
  const v = validate(g);
  if (!v.ok) return v;
  return { ok: true, value: v.value.events / v.value.total };
}

export interface RiskComparison {
  baselineRisk: number;
  comparisonRisk: number;
  /** baseline − comparison, as a proportion. Positive means fewer events in the comparison group. */
  absoluteDifference: number;
  percentagePoints: number;
  /** Difference in events per 1,000 people over the same period. */
  perThousand: number;
  /**
   * (baseline − comparison) ÷ baseline. Null when the baseline risk is zero, because a
   * relative change from zero is undefined, not infinite or 100%.
   */
  relativeReduction: number | null;
}

/**
 * Compares a baseline (e.g. comparison/control) group with another group.
 * Both groups must be observed over the same time window; the caller labels it.
 */
export function compareRisks(baseline: GroupCounts, other: GroupCounts): Result<RiskComparison> {
  const a = validate(baseline);
  if (!a.ok) return a;
  const b = validate(other);
  if (!b.ok) return b;
  const { events: e1, total: n1 } = a.value;
  const { events: e2, total: n2 } = b.value;
  const crossDiff = e1 * n2 - e2 * n1;
  const absoluteDifference = crossDiff / (n1 * n2);
  return {
    ok: true,
    value: {
      baselineRisk: e1 / n1,
      comparisonRisk: e2 / n2,
      absoluteDifference,
      percentagePoints: (crossDiff * 100) / (n1 * n2),
      perThousand: (crossDiff * 1000) / (n1 * n2),
      relativeReduction: e1 === 0 ? null : crossDiff / (e1 * n2),
    },
  };
}

/** Formats a number with at most `maxDecimals`, trimming trailing zeros (1.50 → "1.5"). */
export function formatNumber(value: number, maxDecimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Number(value.toFixed(maxDecimals));
  return rounded.toLocaleString("en-US", { maximumFractionDigits: maxDecimals });
}

/** Formats a proportion as a percentage string: 0.015 → "1.5%". */
export function formatPercent(proportion: number, maxDecimals = 2): string {
  return `${formatNumber(proportion * 100, maxDecimals)}%`;
}
