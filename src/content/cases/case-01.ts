import type { CuratedCase } from "@/lib/schemas/case";
import { verdictOptions } from "./verdicts";

export const CASE_01_ABSTRACT =
  "In a fictional randomized teaching example, 2,000 adults aged 50–69 were assigned to an unnamed intervention or a comparison group, with 1,000 participants in each group. During five years of follow-up, the measured cancer outcome occurred in 20 participants in the comparison group and 15 in the intervention group. These counts correspond to observed risks of 2.0% and 1.5%, respectively. The observed relative reduction was 25%, and the observed absolute difference was 0.5 percentage points. Confidence intervals, a statistical significance assessment, and adverse-event information are not supplied in this teaching abstract.";

export const case01: CuratedCase = {
  id: "case-01",
  slug: "missing-denominator",
  version: 1,
  number: 1,
  title: "The missing denominator",
  topic: "prevention",
  skill: "Relative versus absolute change",
  estimatedMinutes: 4,
  learningObjective:
    "Tell a relative percentage change apart from an absolute difference, and restate a result with its denominator and time window.",
  claimText: "A 25% lower cancer rate? That means 25 fewer cases for every 100 people.",
  claimFragments: [
    { id: "relative-figure", text: "A 25% lower cancer rate?" },
    { id: "absolute-reading", text: "That means 25 fewer cases for every 100 people." },
  ],
  postAuthor: "Riley M.",
  fictionalPostLabel: "Fictional teaching post",
  materialType: "fictional_study",
  provenanceLabel: "Fictional teaching example — not a real study",
  clues: [
    {
      id: "headline-figure",
      kind: "study_details",
      title: "Study details: the reported 25%",
      body: [
        "The post is reacting to a fictional teaching abstract. In it, 2,000 adults aged 50–69 were randomly assigned to an unnamed intervention or a comparison group, 1,000 in each.",
        "The abstract states its own summary figure directly.",
      ],
      excerpt: "The observed relative reduction was 25%…",
      sourceIds: ["p2p-fictional-teaching-material"],
      claimFragmentIds: ["relative-figure"],
      materialOrigin: "fictional_teaching_example",
      glossaryTermIds: ["randomized-controlled-trial", "relative-risk"],
    },
    {
      id: "the-counts",
      kind: "numbers_outcome",
      title: "Numbers: what happened in each group",
      body: [
        "Over five years of follow-up, the measured outcome occurred in 20 of 1,000 people in the comparison group and 15 of 1,000 in the intervention group.",
        "Use the risk display to compare the counts, then switch between the relative and absolute views. The counts stay the same in both views.",
      ],
      excerpt:
        "…the measured cancer outcome occurred in 20 participants in the comparison group and 15 in the intervention group.",
      sourceIds: ["p2p-fictional-teaching-material", "cruk-absolute-relative-risk"],
      claimFragmentIds: ["absolute-reading"],
      materialOrigin: "fictional_teaching_example",
      glossaryTermIds: ["absolute-risk", "percentage-point", "denominator", "natural-frequency", "follow-up"],
    },
    {
      id: "not-supplied",
      kind: "missing_context",
      title: "Source check: what the abstract leaves out",
      body: [
        "The abstract says confidence intervals, a statistical significance assessment and adverse-event information are not supplied.",
        "Ask what these missing pieces would tell you, and whether their absence affects the post's arithmetic.",
      ],
      excerpt:
        "Confidence intervals, a statistical significance assessment, and adverse-event information are not supplied in this teaching abstract.",
      sourceIds: ["p2p-fictional-teaching-material"],
      claimFragmentIds: ["relative-figure", "absolute-reading"],
      materialOrigin: "fictional_teaching_example",
      glossaryTermIds: ["confidence-interval", "statistical-significance"],
    },
  ],
  studyView: {
    kind: "study",
    heading: "The fictional teaching abstract",
    text: CASE_01_ABSTRACT,
    question: "Did people assigned to an unnamed intervention have a measured cancer outcome less often over five years?",
    context: "humans",
    design: { value: "Randomized comparison of two groups (fictional)", status: "explicit" },
    fields: [
      { label: "Population", value: { status: "reported", value: "Adults aged 50–69 (fictional)" } },
      { label: "Sample size", value: { status: "reported", value: "2,000 (1,000 per group)" } },
      { label: "Comparison", value: { status: "reported", value: "Unnamed intervention vs. comparison group" } },
      { label: "Follow-up", value: { status: "reported", value: "Five years" } },
      { label: "Outcome", value: { status: "reported", value: "A measured cancer outcome (not named)" } },
      { label: "Confidence intervals", value: { status: "not_reported", note: "Not supplied in this teaching abstract." } },
      { label: "Statistical significance", value: { status: "not_reported", note: "Not supplied in this teaching abstract." } },
      { label: "Adverse events (harms)", value: { status: "not_reported", note: "Not supplied. This is not the same as no harms." } },
    ],
  },
  sourceIds: ["p2p-fictional-teaching-material", "cruk-absolute-relative-risk", "nci-dceg-absolute-risk-modeling"],
  glossaryTermIds: ["relative-risk", "absolute-risk", "percentage-point", "denominator", "natural-frequency", "confidence-interval"],
  verdictOptions: verdictOptions({
    supported:
      "The 25% figure is correct as a relative reduction, but the post's second sentence turns it into “25 fewer per 100,” which the counts do not support.",
    misleading:
      "Yes. A true figure (a 25% relative reduction) is restated as an absolute difference, which changes its meaning roughly fiftyfold.",
    unsupported:
      "Close, but the post starts from a figure the material really does report. The problem is how that true figure is reframed, which is what Misleading describes.",
    "not-enough-information":
      "The missing intervals and harms leave real questions open, but the counts are enough to check the post's arithmetic, and the arithmetic is wrong.",
  }),
  reasonOptions: [
    {
      id: "relative-as-absolute",
      label: "A relative percentage was mistaken for an absolute percentage-point difference.",
      explanation:
        "Correct. 25% is how much smaller 1.5% is than 2%. The absolute difference is 0.5 percentage points, or 5 fewer per 1,000 over five years.",
    },
    {
      id: "arithmetic-holds",
      label: "The arithmetic holds: 25% of 100 people is 25 people.",
      explanation:
        "This repeats the post's error. 25% describes the change relative to a 2% starting risk, not a share of all 100 people.",
    },
    {
      id: "randomized-applies-to-all",
      label: "Because the study was randomized, its result applies to everyone.",
      explanation:
        "Randomization helps make the two groups comparable. It does not make a result apply to every population, and it does not fix the post's arithmetic.",
    },
    {
      id: "only-missing-uncertainty",
      label: "The only problem is that confidence intervals and harms aren't reported.",
      explanation:
        "You identified a real limitation. Recheck the exact wording of the claim: even with intervals and harms reported, “25 fewer per 100” would still be wrong.",
    },
  ],
  headlineOptions: [
    {
      id: "counts-with-window",
      label: "In this fictional example, the observed outcome fell from 20 to 15 per 1,000 over five years.",
      explanation: "Correct. It keeps the denominator, the time window and the fictional label.",
    },
    {
      id: "twenty-five-per-hundred",
      label: "25 fewer cancer cases for every 100 people.",
      explanation: "This repeats the original arithmetic error. The counts show 5 fewer per 1,000.",
    },
    {
      id: "no-time-window",
      label: "The outcome fell from 20 to 15 per 1,000 people.",
      explanation:
        "The numbers are right, but the five-year window is missing. A risk without a time period is incomplete.",
    },
    {
      id: "quarter-for-everyone",
      label: "Intervention cuts cancer by a quarter for everyone.",
      explanation:
        "This drops the fictional label and claims the result applies to everyone. The example establishes no real-world effect.",
    },
  ],
  answerKey: {
    verdictId: "misleading",
    reasonId: "relative-as-absolute",
    headlineId: "counts-with-window",
    clues: [
      {
        clueId: "headline-figure",
        accepted: ["supports"],
        explanation:
          "The abstract does report a 25% relative reduction, so the first part of the post (“A 25% lower cancer rate”) is accurate as a relative figure.",
      },
      {
        clueId: "the-counts",
        accepted: ["challenges"],
        explanation:
          "20 versus 15 per 1,000 is 5 fewer per 1,000, or 0.5 percentage points over five years. That contradicts “25 fewer for every 100 people.”",
      },
      {
        clueId: "not-supplied",
        accepted: ["open_question"],
        explanation:
          "Without intervals or harms you can't judge precision or the balance of benefit and harm. Missing details leave a question open; they don't by themselves contradict the claim.",
      },
    ],
  },
  verdictScope:
    "The 25% figure is a real relative reduction in this fictional example, but the post turns it into an absolute difference the counts do not support.",
  supportedConclusion: [
    {
      text: "In this fictional example, the intervention group had a lower observed rate: 15 versus 20 per 1,000 over five years.",
    },
    { text: "“25% lower” is a correct description of the relative reduction from 2.0% to 1.5%." },
  ],
  notEstablished: [
    {
      text: "That 25 fewer people per 100 were affected.",
      justification: "The absolute difference is 5 per 1,000 over five years (0.5 percentage points). The headline's arithmetic is wrong regardless of any other question.",
    },
    {
      text: "Any real-world treatment effect.",
      justification: "The intervention is unnamed and the numbers are invented for teaching.",
    },
    {
      text: "How precise the estimate is, or whether the intervention caused harms.",
      justification: "Confidence intervals, significance testing and adverse events are not supplied. Not supplied is not the same as no harms.",
    },
  ],
  debrief: [
    "The relative reduction compares the change with the starting risk: (2.0% − 1.5%) ÷ 2.0% = 25%.",
    "The absolute difference is the plain gap: 2.0% − 1.5% = 0.5 percentage points. As a natural frequency, that is 5 fewer observed cases per 1,000 people over five years.",
    "The post took 25% and applied it to 100 people, as if the starting risk were 100%. Relative figures need a denominator and a time window before they say anything about how many people are affected.",
  ],
  correctedHeadline: "In this fictional example, the observed outcome fell from 20 to 15 per 1,000 over five years.",
  relatedCaseSlug: "link-not-cause",
  decoderSampleId: "fictional-rct-relative-risk",
  riskExample: {
    years: 5,
    outcomeLabel: "measured cancer outcome",
    groups: [
      { id: "comparison", label: "Comparison group", events: 20, total: 1000 },
      { id: "intervention", label: "Intervention group", events: 15, total: 1000 },
    ],
  },
  timelineExample: null,
};
