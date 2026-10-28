import { curatedCaseSchema, type CuratedCase, type Topic } from "@/lib/schemas/case";
import { case01 } from "./case-01";
import { case02 } from "./case-02";
import { case03 } from "./case-03";
import { case04 } from "./case-04";
import { case05 } from "./case-05";

/** Parsed at import so a malformed fixture fails the build instead of rendering. */
export const cases: CuratedCase[] = [case01, case02, case03, case04, case05].map((c) => curatedCaseSchema.parse(c));

export const DEMO_CASE_SLUG = "missing-denominator";

export function getCase(slug: string): CuratedCase | undefined {
  return cases.find((c) => c.slug === slug);
}

export const topicLabels: Record<Topic, string> = {
  prevention: "Prevention",
  screening: "Screening",
  research: "Research",
};

export function formatCaseNumber(n: number) {
  return `CASE ${String(n).padStart(2, "0")}`;
}
