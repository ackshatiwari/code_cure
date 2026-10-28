import { getGlossaryEntry } from "@/content/glossary";
import { formatNumber } from "@/lib/risk-math";
import {
  canAnswerQuestions,
  originLabels,
  type AnalysisField,
  type DecoderAnalysis,
  type Statement,
} from "@/lib/schemas/analysis";

export const basisLabels: Record<Statement["basis"], string> = {
  explicit_statement: "Stated in the text",
  inference: "Inference from the text",
  general_context: "General research context, not from this text",
  not_reported: "Not reported in the pasted abstract",
};

export const contextLabels: Record<DecoderAnalysis["studyContext"]["value"], string> = {
  humans: "People",
  animals: "Animals",
  cells: "Cells in a lab",
  mixed: "Mixed (more than one model)",
  not_reported: "Not reported in the pasted abstract",
};

export const canAnswerStatusLabels = {
  reported: "Reported",
  not_established: "Not established here",
  not_reported: "Not reported",
} as const;

export function fieldText(f: AnalysisField) {
  if (f.status === "reported") return f.value ?? "Reported";
  if (f.status === "not_applicable") return `Not applicable${f.value ? ` (${f.value})` : ""}`;
  return "Not reported in the pasted abstract";
}

function statements(title: string, items: Statement[]) {
  if (items.length === 0) return [];
  return [
    "",
    title,
    ...items.map((s) => {
      const refs = s.sourceSentenceIds.length ? ` [${s.sourceSentenceIds.join(", ")}]` : "";
      const why = s.justification ? ` Why: ${s.justification}` : "";
      return `- ${s.text} (${basisLabels[s.basis]})${refs}${why}`;
    }),
  ];
}

/** Plain text for copying. Coverage and provenance always travel with the explanation. */
export function analysisToPlainText(a: DecoderAnalysis): string {
  const lines: string[] = [
    "Paper2People: decoded abstract",
    `Origin: ${originLabels[a.origin]}`,
    "Coverage: Based on the pasted abstract only, not the full paper or current scientific consensus.",
  ];
  if (a.provenanceNote) lines.push(`Provenance: ${a.provenanceNote}`);
  if (a.userTitle) lines.push(`Title (as entered, not verified): ${a.userTitle}`);
  lines.push("", "Summary", a.summary);
  if (a.plainLanguageQuestion) lines.push("", "What researchers asked", a.plainLanguageQuestion);
  lines.push(
    "",
    "Who or what was studied",
    `- Studied: ${contextLabels[a.studyContext.value]}`,
    `- Design: ${a.studyDesign.value ?? "Not reported"} (${a.studyDesign.status === "explicit" ? "stated" : a.studyDesign.status === "inferred" ? "inferred" : "not reported"})`,
    `- Population or model: ${fieldText(a.populationOrModel)}`,
    `- Sample size: ${fieldText(a.sampleSize)}`,
    `- Comparison: ${fieldText(a.comparison)}`,
    `- Follow-up: ${fieldText(a.followUp)}`,
  );
  lines.push(...statements("What they found", a.findings));
  for (const r of a.numericResults) {
    lines.push(`- ${r.description}: ${r.reportedValue}${r.timeWindow ? ` (${r.timeWindow})` : ""}${r.uncertainty ? `; uncertainty: ${r.uncertainty}` : ""} [reported]`);
  }
  for (const c of a.calculations) {
    lines.push(
      `- Calculated by Paper2People from the reported counts: ${formatNumber(c.baselineRiskPercent)}% vs ${formatNumber(c.comparisonRiskPercent)}%; absolute difference ${formatNumber(c.percentagePoints)} percentage points (${formatNumber(c.perThousand)} per 1,000)${c.relativeReductionPercent === null ? "" : `; relative reduction ${formatNumber(c.relativeReductionPercent)}%`}`,
    );
  }
  lines.push(...statements("What the evidence does support", a.supportedConclusions));
  lines.push(...statements("What this study doesn't prove", a.doesNotEstablish));
  lines.push(...statements("Limitations the authors report", a.reportedLimitations));
  lines.push(...statements("General design considerations", a.designConsiderations));
  lines.push(...statements("Questions this text leaves unanswered", a.unansweredQuestions));
  if (a.canThisAnswer.length) {
    lines.push("", "Can this answer…");
    for (const c of a.canThisAnswer) lines.push(`- ${canAnswerQuestions[c.id]} ${canAnswerStatusLabels[c.status]}. ${c.reason}`);
  }
  const terms = a.glossaryTermIds.map((id) => getGlossaryEntry(id)).filter((e) => e !== undefined);
  if (terms.length) {
    lines.push("", "Research terms");
    for (const t of terms) lines.push(`- ${t.term}: ${t.definition}`);
  }
  lines.push("", "Original text", ...a.sourceSentences.map((s) => `[${s.id}] ${s.text}`));
  lines.push("", "Educational use only. Not medical advice.");
  return lines.join("\n");
}
