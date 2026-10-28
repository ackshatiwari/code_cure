import { getGlossaryEntry } from "@/content/glossary";
import { compareRisks } from "@/lib/risk-math";
import {
  ANALYSIS_SCHEMA_VERSION,
  modelAnalysisSchema,
  type AnalysisOrigin,
  type DecoderAnalysis,
  type ModelAnalysis,
} from "@/lib/schemas/analysis";
import type { SourceSentence } from "./source-segmentation";

export type ValidationResult = { ok: true; analysis: ModelAnalysis } | { ok: false; problems: string[] };

/** Model-written links, DOIs and bare domains are not allowed anywhere in an explanation. */
const EXTERNAL_REFERENCE =
  /\bhttps?:\/\/|\bwww\.|\bdoi\s*[:.]|\bdoi\.org\b|\b10\.\d{4,9}\/\S+|\b[a-z0-9-]+\.(?:com|org|net|gov|edu|io)\b/i;

function collectStrings(value: unknown, path: string, out: Array<[string, string]>) {
  if (typeof value === "string") out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => collectStrings(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === "sourceSentenceIds") continue;
      collectStrings(v, path ? `${path}.${k}` : k, out);
    }
  }
}

function collectIds(value: unknown, out: string[]) {
  if (Array.isArray(value)) value.forEach((v) => collectIds(v, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === "sourceSentenceIds" && Array.isArray(v)) out.push(...v.filter((x): x is string => typeof x === "string"));
      else collectIds(v, out);
    }
  }
}

/** True when a number appears in the text, allowing thousands separators ("1,000"). */
function numberAppearsIn(n: number, text: string) {
  const plain = String(n);
  const grouped = n.toLocaleString("en-US");
  const re = new RegExp(`(?<![\\d.,])(?:${plain}|${grouped.replace(/,/g, "[,\\s]?")})(?![\\d]|[.,]\\d)`);
  return re.test(text);
}

/**
 * Runtime validation that runs after (and independently of) structured output.
 * Formatting correctness is not scientific correctness; this only enforces the
 * grounding contract: known sentence IDs and no invented external references.
 */
export function validateModelAnalysis(raw: unknown, sentences: SourceSentence[]): ValidationResult {
  const parsed = modelAnalysisSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      problems: parsed.error.issues.slice(0, 12).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    };
  }
  const analysis = parsed.data;
  const problems: string[] = [];
  const known = new Set(sentences.map((s) => s.id));

  const ids: string[] = [];
  collectIds(analysis, ids);
  const unknown = [...new Set(ids.filter((id) => !known.has(id)))];
  if (unknown.length > 0) problems.push(`Unknown source sentence IDs: ${unknown.slice(0, 8).join(", ")}`);

  const strings: Array<[string, string]> = [];
  collectStrings(analysis, "", strings);
  for (const [path, s] of strings) {
    if (EXTERNAL_REFERENCE.test(s)) problems.push(`${path} contains a link, DOI or external reference`);
  }

  if (problems.length > 0) return { ok: false, problems };

  // Non-fatal clean-up: drop glossary IDs the app doesn't know, and drop group counts
  // that are impossible or can't be found in the sentences they cite.
  const byId = new Map(sentences.map((s) => [s.id, s.text]));
  const cleaned: ModelAnalysis = {
    ...analysis,
    glossaryTermIds: [...new Set(analysis.glossaryTermIds)].filter((id) => getGlossaryEntry(id) !== undefined),
    numericResults: analysis.numericResults.map((r) => {
      if (!r.groupCounts) return r;
      const cited = r.sourceSentenceIds.map((id) => byId.get(id) ?? "").join(" ");
      const g = r.groupCounts;
      const nums = [g.baselineEvents, g.baselineTotal, g.comparisonEvents, g.comparisonTotal];
      const grounded = nums.every((n) => numberAppearsIn(n, cited));
      const valid = compareRisks(
        { events: g.baselineEvents, total: g.baselineTotal },
        { events: g.comparisonEvents, total: g.comparisonTotal },
      ).ok;
      return grounded && valid ? r : { ...r, groupCounts: null };
    }),
  };
  return { ok: true, analysis: cleaned };
}

export interface AssembleOptions {
  origin: AnalysisOrigin;
  provenanceNote: string | null;
  userTitle: string | null;
  sourceText: string;
  sentences: SourceSentence[];
}

/** Adds application-controlled fields. Origin and coverage never come from a model. */
export function assembleAnalysis(model: ModelAnalysis, opts: AssembleOptions): DecoderAnalysis {
  const calculations: DecoderAnalysis["calculations"] = [];
  model.numericResults.forEach((r, i) => {
    if (!r.groupCounts) return;
    const g = r.groupCounts;
    const cmp = compareRisks(
      { events: g.baselineEvents, total: g.baselineTotal },
      { events: g.comparisonEvents, total: g.comparisonTotal },
    );
    if (!cmp.ok) return;
    calculations.push({
      numericResultIndex: i,
      baselineRiskPercent: cmp.value.baselineRisk * 100,
      comparisonRiskPercent: cmp.value.comparisonRisk * 100,
      percentagePoints: cmp.value.percentagePoints,
      perThousand: cmp.value.perThousand,
      relativeReductionPercent: cmp.value.relativeReduction === null ? null : cmp.value.relativeReduction * 100,
    });
  });
  return {
    ...model,
    schemaVersion: ANALYSIS_SCHEMA_VERSION,
    origin: opts.origin,
    coverage: "pasted_abstract",
    provenanceNote: opts.provenanceNote,
    userTitle: opts.userTitle,
    sourceText: opts.sourceText,
    sourceSentences: opts.sentences,
    calculations,
  };
}
