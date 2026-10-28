import { describe, expect, it } from "vitest";
import { compareRisks, formatNumber, formatPercent, riskFromCounts } from "@/lib/risk-math";

describe("Case 01 arithmetic", () => {
  const result = compareRisks({ events: 20, total: 1000 }, { events: 15, total: 1000 });
  if (!result.ok) throw new Error("expected ok");
  const r = result.value;

  it("produces 2% and 1.5% observed risks", () => {
    expect(r.baselineRisk).toBe(0.02);
    expect(r.comparisonRisk).toBe(0.015);
    expect(formatPercent(r.baselineRisk)).toBe("2%");
    expect(formatPercent(r.comparisonRisk)).toBe("1.5%");
  });

  it("produces exactly 0.5 percentage points and 5 per 1,000", () => {
    expect(r.absoluteDifference).toBe(0.005);
    expect(r.percentagePoints).toBe(0.5);
    expect(r.perThousand).toBe(5);
  });

  it("produces a 25% relative reduction", () => {
    expect(r.relativeReduction).toBe(0.25);
  });
});

describe("invalid and edge inputs never yield a misleading number", () => {
  it("rejects a missing denominator", () => {
    expect(riskFromCounts({ events: 15, total: null })).toMatchObject({ ok: false, error: "missing_denominator" });
    expect(riskFromCounts({ events: 15, total: 0 })).toMatchObject({ ok: false, error: "missing_denominator" });
    expect(compareRisks({ events: 20, total: undefined }, { events: 15, total: 1000 }).ok).toBe(false);
  });

  it("returns a null relative change for a zero baseline instead of 100% or Infinity", () => {
    const r = compareRisks({ events: 0, total: 1000 }, { events: 0, total: 1000 });
    expect(r.ok && r.value.relativeReduction).toBeNull();
    const up = compareRisks({ events: 0, total: 1000 }, { events: 3, total: 1000 });
    expect(up.ok && up.value.relativeReduction).toBeNull();
    expect(up.ok && up.value.perThousand).toBe(-3);
  });

  it("rejects negative counts, counts above the group size and non-integers", () => {
    expect(riskFromCounts({ events: -1, total: 10 })).toMatchObject({ error: "negative_value" });
    expect(riskFromCounts({ events: 11, total: 10 })).toMatchObject({ error: "events_exceed_total" });
    expect(riskFromCounts({ events: 1.5, total: 10 })).toMatchObject({ error: "non_integer" });
    expect(riskFromCounts({ events: Number.NaN, total: 10 })).toMatchObject({ error: "not_a_number" });
  });

  it("handles unequal group sizes with exact cross-multiplication", () => {
    const r = compareRisks({ events: 30, total: 1500 }, { events: 10, total: 1000 });
    expect(r.ok && r.value.percentagePoints).toBe(1);
    expect(r.ok && r.value.relativeReduction).toBe(0.5);
  });

  it("formats without spurious precision", () => {
    expect(formatNumber(0.5)).toBe("0.5");
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe("—");
  });
});
