import { CASE_01_ABSTRACT } from "@/content/cases/case-01";
import { CASE_02_ABSTRACT } from "@/content/cases/case-02";
import { CASE_03_ABSTRACT } from "@/content/cases/case-03";
import { assembleAnalysis, validateModelAnalysis } from "@/lib/analysis/response-validation";
import { normalizeInput, segmentSource } from "@/lib/analysis/source-segmentation";
import type { AnalysisField, DecoderAnalysis, ModelAnalysis } from "@/lib/schemas/analysis";

/**
 * Prewritten, schema-validated analyses of fixed teaching abstracts. They are only
 * shown when the decoder's input exactly matches one of these texts; edited or
 * unrelated text never receives a sample analysis.
 *
 * Sentence IDs refer to the deterministic segmentation of each text:
 * Case 01 → S1–S5, Case 02 → S1–S5, Case 03 → S1–S4 (checked by tests).
 */

const reported = (value: string, ids: string[]): AnalysisField => ({ status: "reported", value, sourceSentenceIds: ids });
const notReported: AnalysisField = { status: "not_reported", value: null, sourceSentenceIds: [] };
const notApplicable = (value: string): AnalysisField => ({ status: "not_applicable", value, sourceSentenceIds: [] });

const rctAnalysis: ModelAnalysis = {
  inputKind: "study_abstract",
  inputKindNote: "A fictional teaching abstract describing a randomized comparison of two groups.",
  plainLanguageQuestion:
    "Over five years, did people assigned to an unnamed intervention have a measured cancer outcome less often than people in a comparison group?",
  summary:
    "In this fictional example, the measured outcome occurred in 20 of 1,000 people in the comparison group and 15 of 1,000 in the intervention group over five years. That is a 25% relative reduction, but an absolute difference of 0.5 percentage points. The abstract supplies no measure of uncertainty and no information on harms.",
  studyContext: { value: "humans", sourceSentenceIds: ["S1"] },
  studyDesign: {
    value: "Randomized comparison of two groups",
    status: "explicit",
    justification: "The abstract says participants were assigned in a randomized teaching example.",
    sourceSentenceIds: ["S1"],
  },
  populationOrModel: reported("Adults aged 50–69 (fictional)", ["S1"]),
  sampleSize: reported("2,000 participants, 1,000 per group", ["S1"]),
  eligibility: notReported,
  setting: notReported,
  comparison: reported("Unnamed intervention versus a comparison group", ["S1"]),
  followUp: reported("Five years", ["S2"]),
  findings: [
    {
      text: "The measured cancer outcome occurred in 20 of 1,000 people in the comparison group and 15 of 1,000 in the intervention group.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S2"],
      justification: null,
    },
    {
      text: "The authors report a 25% relative reduction and a 0.5 percentage-point absolute difference.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S4"],
      justification: null,
    },
  ],
  numericResults: [
    {
      description: "People with the measured outcome in each group",
      measureType: "event_counts",
      reportedValue: "20 (comparison) and 15 (intervention), out of 1,000 each",
      units: "participants",
      timeWindow: "Five years of follow-up",
      uncertainty: null,
      groupCounts: {
        baselineLabel: "Comparison group",
        baselineEvents: 20,
        baselineTotal: 1000,
        comparisonLabel: "Intervention group",
        comparisonEvents: 15,
        comparisonTotal: 1000,
      },
      sourceSentenceIds: ["S1", "S2"],
    },
    {
      description: "Observed relative reduction",
      measureType: "relative_risk_or_reduction",
      reportedValue: "25%",
      units: null,
      timeWindow: "Five years",
      uncertainty: null,
      groupCounts: null,
      sourceSentenceIds: ["S4"],
    },
    {
      description: "Observed absolute difference",
      measureType: "absolute_difference",
      reportedValue: "0.5 percentage points",
      units: "percentage points",
      timeWindow: "Five years",
      uncertainty: null,
      groupCounts: null,
      sourceSentenceIds: ["S4"],
    },
  ],
  supportedConclusions: [
    {
      text: "In this fictional example, fewer people in the intervention group had the measured outcome over five years: 15 versus 20 per 1,000.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S2"],
      justification: null,
    },
    {
      text: "Because groups were randomly assigned, the comparison is designed to make the groups similar apart from the intervention.",
      basis: "inference",
      sourceSentenceIds: ["S1"],
      justification: "Random assignment is the reported design.",
    },
  ],
  doesNotEstablish: [
    {
      text: "That 25 fewer people out of every 100 avoided the outcome. The absolute difference is 5 per 1,000.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S2", "S4"],
      justification: "25% is a relative figure; the counts give the absolute difference.",
    },
    {
      text: "Any real-world effect of a real intervention.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S1"],
      justification: "The abstract describes itself as a fictional teaching example with an unnamed intervention.",
    },
    {
      text: "How precise the estimate is, or whether chance could easily explain the difference.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S5"],
      justification: "No confidence interval or significance assessment is supplied.",
    },
    {
      text: "Whether the intervention caused harms.",
      basis: "not_reported",
      sourceSentenceIds: ["S5"],
      justification: "Adverse events are not supplied. That is not the same as no harms.",
    },
  ],
  reportedLimitations: [
    {
      text: "The abstract states that confidence intervals, a significance assessment and adverse-event information are not supplied.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S5"],
      justification: null,
    },
  ],
  designConsiderations: [
    {
      text: "With 20 and 15 events, the counts are small, so a confidence interval would be needed to judge how precise the 25% figure is.",
      basis: "general_context",
      sourceSentenceIds: ["S2"],
      justification: "Small event counts generally give wide uncertainty around relative estimates.",
    },
    {
      text: "One trial in adults aged 50–69 may not apply to other ages or settings.",
      basis: "general_context",
      sourceSentenceIds: ["S1"],
      justification: null,
    },
  ],
  unansweredQuestions: [
    { text: "What were the harms or side effects, if any?", basis: "not_reported", sourceSentenceIds: ["S5"], justification: null },
    {
      text: "Did the difference persist, grow or shrink after five years?",
      basis: "not_reported",
      sourceSentenceIds: ["S2"],
      justification: null,
    },
    { text: "Which cancer outcome was measured, and how was it confirmed?", basis: "not_reported", sourceSentenceIds: [], justification: null },
  ],
  canThisAnswer: [
    { id: "association", status: "reported", reason: "The groups differ in how often the outcome occurred.", sourceSentenceIds: ["S2"] },
    {
      id: "causal",
      status: "reported",
      reason: "Random assignment supports a causal reading for the measured outcome in this fictional trial, though precision isn't reported.",
      sourceSentenceIds: ["S1", "S5"],
    },
    { id: "human_outcomes", status: "reported", reason: "Participants were adults (fictional).", sourceSentenceIds: ["S1"] },
    {
      id: "longer_life",
      status: "not_reported",
      reason: "The abstract reports a cancer outcome, not survival or deaths.",
      sourceSentenceIds: ["S2"],
    },
    {
      id: "applies_to_everyone",
      status: "not_established",
      reason: "Only adults aged 50–69 were included, in one fictional study.",
      sourceSentenceIds: ["S1"],
    },
  ],
  missingFields: ["Confidence intervals", "Statistical significance", "Adverse events", "Setting", "Eligibility criteria", "Specific outcome definition"],
  glossaryTermIds: ["randomized-controlled-trial", "relative-risk", "absolute-risk", "percentage-point", "confidence-interval", "statistical-significance"],
};

const observationalAnalysis: ModelAnalysis = {
  inputKind: "study_abstract",
  inputKindNote: "A fictional teaching summary of an observational follow-up study.",
  plainLanguageQuestion: "Over six years, were cancer diagnoses less common among adults who chose to drink Beverage Q regularly?",
  summary:
    "In this fictional example, researchers followed 1,200 adults for six years and observed fewer cancer diagnoses among people who reported drinking Beverage Q. Participants chose their own habits, and the Beverage Q group also smoked less and exercised more. The summary doesn't say whether the analysis accounted for those differences.",
  studyContext: { value: "humans", sourceSentenceIds: ["S1"] },
  studyDesign: {
    value: "Observational follow-up study",
    status: "explicit",
    justification: "The summary describes itself as observational, and participants chose their own habits.",
    sourceSentenceIds: ["S1", "S2"],
  },
  populationOrModel: reported("1,200 adults (fictional)", ["S1"]),
  sampleSize: reported("1,200 adults", ["S1"]),
  eligibility: notReported,
  setting: notReported,
  comparison: reported("Regular Beverage Q drinkers versus non-drinkers (self-chosen)", ["S2", "S3"]),
  followUp: reported("Six years", ["S1"]),
  findings: [
    {
      text: "Fewer cancer diagnoses were observed among people who reported regularly drinking Beverage Q.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S3"],
      justification: null,
    },
    {
      text: "The Beverage Q group included fewer people who smoked and more people who exercised regularly.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S4"],
      justification: null,
    },
  ],
  numericResults: [],
  supportedConclusions: [
    {
      text: "In this fictional study, Beverage Q drinking was associated with fewer observed cancer diagnoses over six years.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S3"],
      justification: null,
    },
    {
      text: "The association could be a reason for further research.",
      basis: "general_context",
      sourceSentenceIds: [],
      justification: "Observational associations often prompt studies that can test causes more directly.",
    },
  ],
  doesNotEstablish: [
    {
      text: "That Beverage Q prevented cancer.",
      basis: "inference",
      sourceSentenceIds: ["S2", "S4"],
      justification: "People chose their own habits, and the groups also differed in smoking and exercise, which could explain some of the difference.",
    },
    {
      text: "How large the difference was.",
      basis: "not_reported",
      sourceSentenceIds: ["S3"],
      justification: "No counts, effect size or interval are reported.",
    },
    {
      text: "That the researchers did no adjustment for group differences.",
      basis: "not_reported",
      sourceSentenceIds: ["S5"],
      justification: "The summary doesn't describe adjustment; that isn't evidence it wasn't done.",
    },
  ],
  reportedLimitations: [
    {
      text: "The summary says it does not describe adjustment for group differences or report a causal analysis.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S5"],
      justification: null,
    },
  ],
  designConsiderations: [
    {
      text: "Smoking and exercise are possible confounders: both differ between groups and could relate to cancer risk.",
      basis: "inference",
      sourceSentenceIds: ["S4"],
      justification: "A factor linked to both the habit and the outcome can create or hide an apparent relationship.",
    },
    {
      text: "Self-reported drinking habits may be measured imprecisely.",
      basis: "general_context",
      sourceSentenceIds: ["S3"],
      justification: null,
    },
  ],
  unansweredQuestions: [
    { text: "How many diagnoses occurred in each group?", basis: "not_reported", sourceSentenceIds: ["S3"], justification: null },
    {
      text: "Did the difference remain after accounting for smoking, exercise and other factors?",
      basis: "not_reported",
      sourceSentenceIds: ["S5"],
      justification: null,
    },
    { text: "Which cancers were diagnosed?", basis: "not_reported", sourceSentenceIds: [], justification: null },
  ],
  canThisAnswer: [
    { id: "association", status: "reported", reason: "Fewer diagnoses were observed in one group.", sourceSentenceIds: ["S3"] },
    {
      id: "causal",
      status: "not_established",
      reason: "Habits were self-chosen, groups differed, and no adjustment or causal analysis is described.",
      sourceSentenceIds: ["S2", "S4", "S5"],
    },
    { id: "human_outcomes", status: "reported", reason: "The outcome is cancer diagnoses in adults (fictional).", sourceSentenceIds: ["S1", "S3"] },
    { id: "longer_life", status: "not_reported", reason: "Diagnoses were reported, not deaths or survival.", sourceSentenceIds: ["S3"] },
    { id: "applies_to_everyone", status: "not_established", reason: "One fictional group of 1,200 adults.", sourceSentenceIds: ["S1"] },
  ],
  missingFields: ["Counts per group", "Effect size", "Confidence interval", "Adjustment method", "Setting", "Eligibility criteria"],
  glossaryTermIds: ["observational-study", "association", "causation", "confounder"],
};

const cellAnalysis: ModelAnalysis = {
  inputKind: "study_abstract",
  inputKindNote: "A fictional teaching summary of a laboratory cell-culture experiment.",
  plainLanguageQuestion: "Does Compound X lower the viability of one type of cultured cancer cell in the lab?",
  summary:
    "In this fictional lab experiment, Compound X lowered cell viability in one cultured cancer-cell line after 48 hours compared with untreated cells. No animals or people were studied, so the result says nothing yet about safety, dose or benefit in humans.",
  studyContext: { value: "cells", sourceSentenceIds: ["S1", "S3"] },
  studyDesign: {
    value: "Laboratory cell-culture experiment with untreated controls",
    status: "explicit",
    justification: null,
    sourceSentenceIds: ["S1", "S2"],
  },
  populationOrModel: reported("One cultured cancer-cell line", ["S1"]),
  sampleSize: notReported,
  eligibility: notApplicable("No participants; a cell-line experiment."),
  setting: reported("Laboratory", ["S1"]),
  comparison: reported("Untreated control cells", ["S2"]),
  followUp: reported("48 hours (laboratory time point)", ["S2"]),
  findings: [
    {
      text: "After 48 hours, treated cells showed lower viability than untreated control cells.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S2"],
      justification: null,
    },
  ],
  numericResults: [],
  supportedConclusions: [
    {
      text: "In this fictional experiment, Compound X had a measurable effect on one cancer-cell line in a dish.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S2"],
      justification: null,
    },
    {
      text: "The result could justify further laboratory research.",
      basis: "general_context",
      sourceSentenceIds: [],
      justification: "Early lab findings are how research questions are identified.",
    },
  ],
  doesNotEstablish: [
    {
      text: "That Compound X treats or cures cancer in people.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S3"],
      justification: "No people were studied.",
    },
    {
      text: "A safe or effective dose for humans.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S4"],
      justification: "Human safety and dosing are not reported.",
    },
    {
      text: "That the effect would hold in other cell types or in a living body.",
      basis: "inference",
      sourceSentenceIds: ["S1"],
      justification: "Only one cell line was tested, outside a body.",
    },
    {
      text: "That Compound X would fail in people.",
      basis: "general_context",
      sourceSentenceIds: [],
      justification: "Missing human evidence is not evidence of failure.",
    },
  ],
  reportedLimitations: [
    {
      text: "The summary says no animals or human participants were studied, and human safety, dosing and clinical outcomes are not reported.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S3", "S4"],
      justification: null,
    },
  ],
  designConsiderations: [
    {
      text: "A viability assay is a laboratory measurement, not a clinical outcome such as symptoms or survival.",
      basis: "general_context",
      sourceSentenceIds: ["S2"],
      justification: null,
    },
    {
      text: "The size of the effect is described only qualitatively.",
      basis: "explicit_statement",
      sourceSentenceIds: ["S2"],
      justification: null,
    },
  ],
  unansweredQuestions: [
    { text: "How large was the drop in viability, and was it repeated?", basis: "not_reported", sourceSentenceIds: ["S2"], justification: null },
    { text: "Is Compound X safe in animals or people, and at what dose?", basis: "not_reported", sourceSentenceIds: ["S4"], justification: null },
    { text: "Does it affect healthy cells too?", basis: "not_reported", sourceSentenceIds: [], justification: null },
  ],
  canThisAnswer: [
    {
      id: "association",
      status: "reported",
      reason: "Treated cells differed from untreated cells in viability.",
      sourceSentenceIds: ["S2"],
    },
    {
      id: "causal",
      status: "reported",
      reason: "A controlled lab comparison supports a causal reading for the viability measurement in this cell line only.",
      sourceSentenceIds: ["S1", "S2"],
    },
    { id: "human_outcomes", status: "not_established", reason: "No people were studied.", sourceSentenceIds: ["S3"] },
    { id: "longer_life", status: "not_reported", reason: "Only a cell-viability measure was reported.", sourceSentenceIds: ["S2", "S4"] },
    { id: "applies_to_everyone", status: "not_established", reason: "One cell line in a dish.", sourceSentenceIds: ["S1"] },
  ],
  missingFields: ["Effect size", "Number of replicates", "Dose tested", "Effect on healthy cells", "Animal or human data"],
  glossaryTermIds: ["preclinical-research", "cell-culture", "surrogate-outcome"],
};

export interface DecoderSample {
  id: string;
  label: string;
  description: string;
  title: string;
  text: string;
  provenanceNote: string;
  caseSlug: string;
  analysis: ModelAnalysis;
}

export const decoderSamples: DecoderSample[] = [
  {
    id: "fictional-rct-relative-risk",
    label: "Relative risk sample",
    description: "A randomized comparison reported as both a relative and an absolute change.",
    title: "Fictional teaching abstract: an unnamed intervention and a cancer outcome",
    text: CASE_01_ABSTRACT,
    provenanceNote: "Fictional teaching example — not a real study",
    caseSlug: "missing-denominator",
    analysis: rctAnalysis,
  },
  {
    id: "fictional-observational-beverage",
    label: "Observational study sample",
    description: "A follow-up study where people chose their own habits.",
    title: "Fictional teaching summary: Beverage Q and cancer diagnoses",
    text: CASE_02_ABSTRACT,
    provenanceNote: "Fictional teaching example — not a real study",
    caseSlug: "link-not-cause",
    analysis: observationalAnalysis,
  },
  {
    id: "fictional-cell-study",
    label: "Cell-study sample",
    description: "A laboratory experiment in one cancer-cell line.",
    title: "Fictional teaching summary: Compound X in cultured cells",
    text: CASE_03_ABSTRACT,
    provenanceNote: "Fictional teaching example — not a real study",
    caseSlug: "dish-to-person",
    analysis: cellAnalysis,
  },
];

export function getDecoderSample(id: string) {
  return decoderSamples.find((s) => s.id === id);
}

/** Exact-match lookup on normalized text. Any edit means the text is no longer the sample. */
export function findSampleForText(text: string): DecoderSample | undefined {
  const normalized = normalizeInput(text);
  return decoderSamples.find((s) => normalizeInput(s.text) === normalized);
}

export function buildSampleAnalysis(sample: DecoderSample): DecoderAnalysis {
  const sourceText = normalizeInput(sample.text);
  const sentences = segmentSource(sourceText);
  const result = validateModelAnalysis(sample.analysis, sentences);
  if (!result.ok) throw new Error(`Sample ${sample.id} failed validation: ${result.problems.join("; ")}`);
  return assembleAnalysis(result.analysis, {
    origin: "prewritten_sample",
    provenanceNote: sample.provenanceNote,
    userTitle: sample.title,
    sourceText,
    sentences,
  });
}
