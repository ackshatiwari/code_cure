import type { CuratedCase } from "@/lib/schemas/case";
import { verdictOptions } from "./verdicts";

export const CASE_02_ABSTRACT =
  "In this fictional observational teaching example, researchers followed 1,200 adults for six years. Participants chose their own beverage habits; researchers did not assign them to drink or avoid Beverage Q. Fewer cancer diagnoses were observed among participants who reported regularly drinking Beverage Q than among those who did not. The Beverage Q group also included fewer people who smoked and more people who reported regular exercise. This summary does not describe whether or how the analysis adjusted for these differences, and it does not report a causal analysis.";

export const case02: CuratedCase = {
  id: "case-02",
  slug: "link-not-cause",
  version: 1,
  number: 2,
  title: "A link is not a cause",
  topic: "prevention",
  skill: "Observational findings and confounding",
  estimatedMinutes: 5,
  learningObjective:
    "Recognize when a link observed between groups is presented as proof of cause, and name the other differences that could explain it.",
  claimText:
    "A study found fewer cancer diagnoses among people who drank Beverage Q. That proves Beverage Q prevents cancer.",
  claimFragments: [
    { id: "observed-fewer", text: "A study found fewer cancer diagnoses among people who drank Beverage Q." },
    { id: "proves-prevents", text: "That proves Beverage Q prevents cancer." },
  ],
  postAuthor: "Jordan K.",
  fictionalPostLabel: "Fictional teaching post",
  materialType: "fictional_study",
  provenanceLabel: "Fictional teaching example — not a real study",
  clues: [
    {
      id: "who-chose",
      kind: "study_details",
      title: "Study details: how people ended up in each group",
      body: [
        "Researchers followed 1,200 adults for six years. Nobody was assigned to drink or avoid Beverage Q; participants chose their own habits.",
        "The summary also notes that the Beverage Q group included fewer people who smoked and more people who exercised regularly.",
      ],
      excerpt:
        "The Beverage Q group also included fewer people who smoked and more people who reported regular exercise.",
      sourceIds: ["p2p-fictional-teaching-material", "nccih-design-of-the-study", "nci-prevention-overview-patient"],
      claimFragmentIds: ["proves-prevents"],
      materialOrigin: "fictional_teaching_example",
      glossaryTermIds: ["observational-study", "confounder"],
    },
    {
      id: "fewer-diagnoses",
      kind: "numbers_outcome",
      title: "Outcome: what was observed",
      body: [
        "Over six years, fewer cancer diagnoses were observed among people who reported regularly drinking Beverage Q.",
        "The summary does not give exact counts, an effect size or a confidence interval, so the size of the difference is unknown.",
      ],
      excerpt:
        "Fewer cancer diagnoses were observed among participants who reported regularly drinking Beverage Q than among those who did not.",
      sourceIds: ["p2p-fictional-teaching-material"],
      claimFragmentIds: ["observed-fewer"],
      materialOrigin: "fictional_teaching_example",
      glossaryTermIds: ["association"],
    },
    {
      id: "adjustment-not-described",
      kind: "missing_context",
      title: "Source check: what the summary doesn't describe",
      body: [
        "The summary does not say whether or how the analysis accounted for smoking, exercise or other differences, and it reports no causal analysis.",
        "Not described does not mean not done. A full paper might report adjustments. This summary just doesn't let you check.",
      ],
      excerpt:
        "This summary does not describe whether or how the analysis adjusted for these differences, and it does not report a causal analysis.",
      sourceIds: ["p2p-fictional-teaching-material", "nci-pdq-levels-of-evidence"],
      claimFragmentIds: ["proves-prevents"],
      materialOrigin: "fictional_teaching_example",
      glossaryTermIds: ["confounder", "causation"],
    },
  ],
  studyView: {
    kind: "study",
    heading: "The fictional study summary",
    text: CASE_02_ABSTRACT,
    question: "Over six years, were cancer diagnoses less common among adults who chose to drink Beverage Q?",
    context: "humans",
    design: { value: "Observational follow-up study (fictional)", status: "explicit" },
    fields: [
      { label: "Population", value: { status: "reported", value: "1,200 adults (fictional)" } },
      { label: "Exposure", value: { status: "reported", value: "Self-reported regular Beverage Q drinking, chosen by participants" } },
      { label: "Follow-up", value: { status: "reported", value: "Six years" } },
      { label: "Group differences", value: { status: "reported", value: "Fewer smokers and more regular exercisers in the Beverage Q group" } },
      { label: "Counts and effect size", value: { status: "not_reported", note: "No counts, effect size or interval given." } },
      { label: "Adjustment for differences", value: { status: "not_reported", note: "Not described in this summary. That is not proof it wasn't done." } },
    ],
  },
  sourceIds: [
    "p2p-fictional-teaching-material",
    "nci-prevention-overview-patient",
    "nci-pdq-levels-of-evidence",
    "nccih-design-of-the-study",
  ],
  glossaryTermIds: ["association", "causation", "confounder", "observational-study", "randomized-controlled-trial"],
  verdictOptions: verdictOptions({
    supported:
      "The first sentence matches the summary, but “proves … prevents” is a causal claim that a self-selected comparison with known group differences cannot establish on its own.",
    misleading:
      "Yes. The observed link is real in this fictional example, but calling it proof of prevention changes what the finding means.",
    unsupported:
      "Close. Unsupported fits when the evidence doesn't address the conclusion. Here the evidence is about the right outcome in people; the problem is that a true observation is framed as proof, which is what Misleading describes.",
    "not-enough-information":
      "Some details are missing, but the summary already tells you enough: habits were self-chosen and the groups differed. That is enough to see that “proves” goes too far.",
  }),
  reasonOptions: [
    {
      id: "association-as-proof",
      label: "An observed association is presented as proof of prevention.",
      explanation:
        "Correct. People chose their own habits and the groups differed in smoking and exercise, so the link alone can't show that Beverage Q caused the difference.",
    },
    {
      id: "observational-useless",
      label: "Observational studies can never tell us anything about causes.",
      explanation:
        "Too strong. Observational research has contributed to many causal conclusions, often alongside other evidence. This summary alone just can't carry the post's certainty.",
    },
    {
      id: "too-small",
      label: "1,200 people is too few to show anything.",
      explanation:
        "Size is not the main issue. Even a much larger study with the same design could not, by itself, prove that the drink caused the difference.",
    },
    {
      id: "no-adjustment-done",
      label: "The researchers did no adjustment, so the result is meaningless.",
      explanation:
        "The summary doesn't describe adjustment. That leaves a question open; it doesn't show the researchers did none, and it doesn't make the observed link meaningless.",
    },
  ],
  headlineOptions: [
    {
      id: "association-not-established",
      label:
        "A fictional observational study found an association; it did not establish that Beverage Q prevented cancer.",
      explanation: "Correct. It reports the finding, labels the design and keeps the conclusion within the evidence.",
    },
    {
      id: "study-proves",
      label: "Beverage Q prevents cancer, study proves.",
      explanation: "This repeats the post's causal leap.",
    },
    {
      id: "no-effect",
      label: "Study shows Beverage Q has no effect on cancer.",
      explanation:
        "This goes too far the other way. An unproven cause is not the same as a proven lack of effect.",
    },
    {
      id: "drink-more",
      label: "Beverage Q drinkers had fewer cancers, so drink more to lower your risk.",
      explanation:
        "This turns an association into personal advice. Nothing in the summary supports a recommendation.",
    },
  ],
  answerKey: {
    verdictId: "misleading",
    reasonId: "association-as-proof",
    headlineId: "association-not-established",
    clues: [
      {
        clueId: "who-chose",
        accepted: ["challenges"],
        explanation:
          "Self-chosen habits plus known differences in smoking and exercise mean other factors could explain some or all of the gap. That challenges “proves … prevents.”",
      },
      {
        clueId: "fewer-diagnoses",
        accepted: ["supports"],
        explanation:
          "The summary does report fewer diagnoses in the Beverage Q group, which supports the first sentence of the post.",
      },
      {
        clueId: "adjustment-not-described",
        accepted: ["open_question", "challenges"],
        explanation:
          "Whether the analysis accounted for differences is unresolved by this summary, which leaves an open question.",
        alternativeNote:
          "Challenges is also accepted: without a described adjustment or causal analysis, the summary gives no basis for the word “proves.”",
      },
    ],
  },
  verdictScope:
    "Fewer diagnoses were observed among Beverage Q drinkers in this fictional study, but the post presents that link as proof the drink prevents cancer.",
  supportedConclusion: [
    {
      text: "In this fictional study, fewer cancer diagnoses were observed among adults who reported regularly drinking Beverage Q over six years.",
    },
    {
      text: "The finding is an association that could be worth investigating further.",
      justification: "Observational links can prompt and contribute to causal research.",
    },
  ],
  notEstablished: [
    {
      text: "That Beverage Q prevented cancer.",
      justification: "Participants chose their own habits, and the groups also differed in smoking and exercise.",
    },
    {
      text: "How big the difference was.",
      justification: "No counts, effect size or interval are given.",
    },
    {
      text: "That the researchers did no adjustment.",
      justification: "The summary doesn't describe adjustment. Missing reporting is not proof it wasn't done.",
    },
    {
      text: "Any advice about what a person should drink.",
      justification: "A group-level association in a fictional study supports no personal prevention advice.",
    },
  ],
  debrief: [
    "Observational studies measure what people already do. That makes them practical for long-term questions, but the groups can differ in ways that also affect the outcome.",
    "Here, the Beverage Q group smoked less and exercised more. Either difference could explain some of the gap in diagnoses. Those are possible confounders.",
    "Researchers can strengthen causal conclusions through careful adjustment, repeated findings in different settings, and other kinds of evidence. This summary doesn't show any of that, so “proves” goes further than it supports.",
  ],
  correctedHeadline:
    "A fictional observational study found an association; it did not establish that Beverage Q prevented cancer.",
  relatedCaseSlug: "dish-to-person",
  decoderSampleId: "fictional-observational-beverage",
  riskExample: null,
  timelineExample: null,
};
