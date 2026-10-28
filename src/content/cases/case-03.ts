import type { CuratedCase } from "@/lib/schemas/case";
import { verdictOptions } from "./verdicts";

export const CASE_03_ABSTRACT =
  "In this fictional laboratory teaching example, researchers exposed one cultured cancer-cell line to Compound X. After 48 hours, a cell-viability assay showed lower viability in treated cells than in untreated control cells. No animals or human participants were studied. The summary does not report human safety, dosing in people, or clinical outcomes.";

export const case03: CuratedCase = {
  id: "case-03",
  slug: "dish-to-person",
  version: 1,
  number: 3,
  title: "From a dish to a person",
  topic: "research",
  skill: "Experimental model versus clinical outcome",
  estimatedMinutes: 4,
  learningObjective:
    "Separate what a laboratory measurement shows from what it would take to show a benefit in people.",
  claimText: "Compound X reduced a cancer-cell measurement in a lab. It is now a proven cure for people.",
  claimFragments: [
    { id: "lab-measurement", text: "Compound X reduced a cancer-cell measurement in a lab." },
    { id: "proven-cure", text: "It is now a proven cure for people." },
  ],
  postAuthor: "Alex T.",
  fictionalPostLabel: "Fictional teaching post",
  materialType: "fictional_study",
  provenanceLabel: "Fictional teaching example — not a real study",
  clues: [
    {
      id: "what-was-studied",
      kind: "study_details",
      title: "Study details: what was actually studied",
      body: [
        "The experiment used one cultured cancer-cell line grown in a laboratory.",
        "The summary states plainly who and what was not included.",
      ],
      excerpt: "No animals or human participants were studied.",
      sourceIds: ["p2p-fictional-teaching-material", "nccih-types-of-research"],
      claimFragmentIds: ["proven-cure"],
      materialOrigin: "fictional_teaching_example",
      glossaryTermIds: ["cell-culture", "preclinical-research"],
    },
    {
      id: "assay-result",
      kind: "numbers_outcome",
      title: "Outcome: what the assay measured",
      body: [
        "After 48 hours, a cell-viability assay showed lower viability in cells exposed to Compound X than in untreated control cells.",
        "A viability assay estimates how many cells in a dish are still alive. It is a laboratory measurement, not a clinical outcome.",
      ],
      excerpt:
        "After 48 hours, a cell-viability assay showed lower viability in treated cells than in untreated control cells.",
      sourceIds: ["p2p-fictional-teaching-material"],
      claimFragmentIds: ["lab-measurement"],
      materialOrigin: "fictional_teaching_example",
      glossaryTermIds: ["surrogate-outcome"],
    },
    {
      id: "human-details-absent",
      kind: "missing_context",
      title: "Source check: what would matter for people",
      body: [
        "The summary does not report human safety, a dose for people or any clinical outcome such as symptoms, tumor response or survival.",
        "Health-news checklists ask whether a treatment was tested on people at all.",
      ],
      excerpt: "The summary does not report human safety, dosing in people, or clinical outcomes.",
      sourceIds: ["p2p-fictional-teaching-material", "nccih-health-news-checklist"],
      claimFragmentIds: ["proven-cure"],
      materialOrigin: "fictional_teaching_example",
      glossaryTermIds: ["preclinical-research"],
    },
  ],
  studyView: {
    kind: "study",
    heading: "The fictional laboratory summary",
    text: CASE_03_ABSTRACT,
    question: "Did Compound X lower a viability measurement in one cancer-cell line in the lab?",
    context: "cells",
    design: { value: "Laboratory cell-culture experiment with untreated controls (fictional)", status: "explicit" },
    fields: [
      { label: "Model", value: { status: "reported", value: "One cultured cancer-cell line" } },
      { label: "Comparison", value: { status: "reported", value: "Untreated control cells" } },
      { label: "Time point", value: { status: "reported", value: "48 hours" } },
      { label: "Measured outcome", value: { status: "reported", value: "Cell viability (lower in treated cells)" } },
      { label: "Size of effect", value: { status: "not_reported", note: "Described qualitatively only." } },
      { label: "Human participants", value: { status: "not_applicable", note: "No people were studied." } },
      { label: "Human safety and dose", value: { status: "not_reported", note: "Not reported. Unknown, not shown to be safe or unsafe." } },
    ],
  },
  sourceIds: ["p2p-fictional-teaching-material", "nccih-types-of-research", "nccih-health-news-checklist"],
  glossaryTermIds: ["preclinical-research", "cell-culture", "surrogate-outcome", "randomized-controlled-trial"],
  verdictOptions: verdictOptions({
    supported:
      "The lab measurement did change, but nothing in the material involves people. A “proven cure for people” needs evidence in people.",
    misleading:
      "Misleading fits when a real finding is reframed to change its meaning. Here the gap is larger: the material contains no evidence about people at all, so the human conclusion has nothing supporting it. Unsupported is the closer fit.",
    unsupported:
      "Yes. The supplied evidence is a single cell experiment, which does not justify a proven human cure. That does not prove Compound X would fail.",
    "not-enough-information":
      "Human data are missing, but you don't need them to evaluate this claim. The material shows no people were studied, which is enough to see the conclusion isn't justified.",
  }),
  reasonOptions: [
    {
      id: "lab-to-human-leap",
      label: "The post jumps from a lab measurement to proven human benefit.",
      explanation:
        "Correct. One cell-line assay can guide further research. It cannot show safety, a workable dose or benefit in people.",
    },
    {
      id: "cell-research-worthless",
      label: "Cell research is worthless, so Compound X will fail in people.",
      explanation:
        "Too far. Early lab work is how many treatments start. The evidence doesn't show the compound works in people, and it doesn't show it fails either.",
    },
    {
      id: "no-percentage",
      label: "The only problem is that the summary doesn't give a percentage.",
      explanation:
        "A precise number wouldn't fix the main issue. Even a dramatic lab percentage would say nothing about people.",
    },
    {
      id: "controls-prove-cure",
      label: "Comparing with untreated controls is enough to prove a cure.",
      explanation:
        "Controls make the lab comparison more meaningful. They don't turn a cell measurement into a human outcome.",
    },
  ],
  headlineOptions: [
    {
      id: "cell-effect-human-unknown",
      label:
        "Compound X showed an effect in a fictional cell experiment; human benefits and harms have not been established.",
      explanation: "Correct. It names the model, the fictional label and what remains unknown in both directions.",
    },
    {
      id: "cures-cancer",
      label: "Compound X cures cancer.",
      explanation: "This repeats the post's leap from a dish to people.",
    },
    {
      id: "lab-studies-prove-nothing",
      label: "Compound X fails: lab studies prove nothing.",
      explanation: "This dismisses useful early research and claims a failure nobody measured.",
    },
    {
      id: "soon-available",
      label: "Compound X kills cancer cells and may soon be available to patients.",
      explanation:
        "This implies a path to patients that the material doesn't describe, and overstates “lower viability in one cell line.”",
    },
  ],
  answerKey: {
    verdictId: "unsupported",
    reasonId: "lab-to-human-leap",
    headlineId: "cell-effect-human-unknown",
    clues: [
      {
        clueId: "what-was-studied",
        accepted: ["challenges"],
        explanation: "No people were studied, which directly challenges a claim about a proven cure for people.",
      },
      {
        clueId: "assay-result",
        accepted: ["supports"],
        explanation:
          "The viability measurement did fall compared with controls, which supports the first sentence of the post.",
      },
      {
        clueId: "human-details-absent",
        accepted: ["open_question", "challenges"],
        explanation:
          "Safety, dosing and clinical outcomes in people are questions this material doesn't answer.",
        alternativeNote:
          "Challenges is also accepted: with none of these reported, nothing supports calling the compound a proven cure.",
      },
    ],
  },
  verdictScope:
    "A fictional cell experiment showed a laboratory effect; the supplied material contains no evidence that Compound X helps people.",
  supportedConclusion: [
    {
      text: "In this fictional experiment, Compound X lowered cell viability in one cancer-cell line at 48 hours compared with untreated cells.",
    },
    {
      text: "That result could justify further laboratory and, eventually, carefully designed studies.",
      justification: "Basic research is the first step in the research sequence.",
    },
  ],
  notEstablished: [
    { text: "A cure, survival benefit or clinical response in people.", justification: "No people were studied." },
    { text: "A safe or effective human dose.", justification: "Human safety and dosing are not reported." },
    {
      text: "That Compound X would fail in people.",
      justification: "Absence of human evidence is not evidence of failure.",
    },
    {
      text: "That the effect holds in other cell types or in a living body.",
      justification: "Only one cell line was tested, in a dish.",
    },
  ],
  debrief: [
    "A cell in a dish lacks an immune system, organs, blood supply and metabolism. A compound can behave very differently once it has to reach a tumor inside a body, at a dose the body tolerates.",
    "Most compounds that show early lab effects need further animal and human studies before anyone knows whether they help, harm or do nothing in people.",
    "That doesn't make lab research unimportant. It is how the research questions are found. The fair summary is “early, promising for research, unknown for people.”",
  ],
  correctedHeadline:
    "Compound X showed an effect in a fictional cell experiment; human benefits and harms have not been established.",
  relatedCaseSlug: "earlier-clock",
  decoderSampleId: "fictional-cell-study",
  riskExample: null,
  timelineExample: null,
};
