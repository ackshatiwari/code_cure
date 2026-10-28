import type { CuratedCase } from "@/lib/schemas/case";
import { verdictOptions } from "./verdicts";

export const case05: CuratedCase = {
  id: "case-05",
  slug: "supported-conclusion",
  version: 1,
  number: 5,
  title: "When the conclusion is supported",
  topic: "prevention",
  skill: "Proportionate trust; population evidence versus personal prediction",
  estimatedMinutes: 4,
  learningObjective:
    "Recognize a claim that stays within well-established evidence, and tell a population finding apart from a guarantee for one person.",
  claimText:
    "Smoking causes lung cancer. Quitting lowers cancer risk over time, although it cannot guarantee someone will never develop cancer.",
  claimFragments: [
    { id: "smoking-causes", text: "Smoking causes lung cancer." },
    { id: "quitting-lowers", text: "Quitting lowers cancer risk over time," },
    { id: "no-guarantee", text: "although it cannot guarantee someone will never develop cancer." },
  ],
  postAuthor: "Casey L.",
  fictionalPostLabel: "Fictional post summarizing real public-health evidence",
  materialType: "real_source_summary",
  provenanceLabel: "Fictional post summarizing real public-health evidence",
  clues: [
    {
      id: "nci-causes",
      kind: "study_details",
      title: "Source details: what NCI states about tobacco",
      body: [
        "The National Cancer Institute's tobacco risk-factor page and its fact sheet on smoking both state a causal relationship directly.",
        "These are public-health summaries of a large body of research, not a single study.",
      ],
      excerpt: "Tobacco use causes many types of cancer, including cancer of the lung…",
      sourceIds: ["nci-tobacco-risk-factor", "nci-cessation-fact-sheet"],
      claimFragmentIds: ["smoking-causes"],
      materialOrigin: "real_source_summary",
      glossaryTermIds: ["causation"],
    },
    {
      id: "nci-quitting",
      kind: "numbers_outcome",
      title: "Outcome: what NCI states about quitting",
      body: [
        "NCI's fact sheet describes the effect of quitting on cancer risk, and adds that the benefit is greatest among people who quit at a younger age.",
      ],
      excerpt: "Quitting smoking reduces the risk of developing and dying from cancer.",
      sourceIds: ["nci-cessation-fact-sheet"],
      claimFragmentIds: ["quitting-lowers"],
      materialOrigin: "real_source_summary",
      glossaryTermIds: ["absolute-risk"],
    },
    {
      id: "population-vs-person",
      kind: "missing_context",
      title: "Context check: one person versus a population",
      body: [
        "Risk reductions describe what happens across large groups of people. They cannot say exactly what will happen to any one person.",
        "Notice what the post's final clause says about this.",
      ],
      sourceIds: ["nci-cessation-fact-sheet", "nci-dceg-absolute-risk-modeling"],
      claimFragmentIds: ["no-guarantee"],
      materialOrigin: "real_source_summary",
      glossaryTermIds: ["absolute-risk", "relative-risk"],
    },
  ],
  studyView: {
    kind: "source_summary",
    heading: "The public-health summaries",
    sourceType: "Public-health summaries from the National Cancer Institute",
    explanation:
      "This case doesn't rest on one abstract. NCI's pages summarize decades of research from many kinds of studies, so fields that describe a single trial don't apply here.",
    statements: [
      {
        sourceId: "nci-tobacco-risk-factor",
        text: "Tobacco use causes many types of cancer, including cancer of the lung…",
        quoted: true,
      },
      {
        sourceId: "nci-cessation-fact-sheet",
        text: "Quitting smoking reduces the risk of developing and dying from cancer.",
        quoted: true,
      },
      {
        sourceId: "nci-cessation-fact-sheet",
        text: "The fact sheet adds that the benefit is greatest among people who quit at a younger age.",
        quoted: false,
      },
    ],
    fields: [
      { label: "Source type", value: { status: "reported", value: "Public-health summary of many studies" } },
      { label: "Sample size", value: { status: "not_applicable", note: "Summarizes many studies; there is no single sample." } },
      { label: "Study design", value: { status: "not_applicable", note: "Not one study, so not one design." } },
      {
        label: "Randomized smoking trial",
        value: {
          status: "not_applicable",
          note: "Assigning people to smoke would be unethical, and the causal conclusion doesn't depend on such a trial.",
        },
      },
    ],
  },
  sourceIds: ["nci-tobacco-risk-factor", "nci-cessation-fact-sheet", "nci-dceg-absolute-risk-modeling"],
  glossaryTermIds: ["causation", "absolute-risk", "relative-risk", "systematic-review"],
  verdictOptions: verdictOptions({
    supported:
      "Yes. Each part of the claim matches NCI's public-health statements, and the final clause correctly avoids a personal guarantee.",
    misleading:
      "Nothing here is reframed to change its meaning. The claim states the established finding and its limit accurately.",
    unsupported:
      "The supplied NCI sources directly state both the causal link and the benefit of quitting.",
    "not-enough-information":
      "The sources address each part of the claim. Individual uncertainty is already acknowledged in the claim itself, so it doesn't leave the verdict unresolved.",
  }),
  reasonOptions: [
    {
      id: "matches-evidence",
      label: "The wording matches established public-health evidence and avoids a personal guarantee.",
      explanation:
        "Correct. The claim says what the evidence supports and stops there: lower risk, not zero risk.",
    },
    {
      id: "needs-smoking-trial",
      label: "No one can say smoking causes cancer without a trial that assigns people to smoke.",
      explanation:
        "Not so. Such a trial would be unethical, and the causal conclusion rests on many consistent lines of evidence gathered over decades.",
    },
    {
      id: "no-guarantee-no-benefit",
      label: "Because quitting can't guarantee anything, it doesn't really lower risk.",
      explanation:
        "This confuses an individual guarantee with a population risk reduction. Risk can fall without becoming zero.",
    },
    {
      id: "only-associated",
      label: "Smoking is only associated with lung cancer, so the causal claim goes too far.",
      explanation:
        "NCI states the causal relationship directly. Treating it as a mere association adds a false caveat.",
    },
  ],
  headlineOptions: [
    {
      id: "causes-and-reduces",
      label: "Smoking causes lung cancer; quitting reduces risk without eliminating every individual's risk.",
      explanation: "Correct. It keeps the established conclusion and its honest limit.",
    },
    {
      id: "quitting-guarantees",
      label: "Quitting smoking guarantees you won't get cancer.",
      explanation: "This promises an individual outcome no population evidence can promise.",
    },
    {
      id: "cause-unproven",
      label: "Smoking may be linked to lung cancer, but the cause is unproven.",
      explanation: "This invents doubt about a well-established conclusion.",
    },
    {
      id: "back-to-never-smoker",
      label: "Quitting lowers risk back to that of someone who never smoked.",
      explanation:
        "The NCI fact sheet compares people who quit with people who keep smoking. It doesn't say risk returns fully to never-smoker levels.",
    },
  ],
  answerKey: {
    verdictId: "supported",
    reasonId: "matches-evidence",
    headlineId: "causes-and-reduces",
    clues: [
      {
        clueId: "nci-causes",
        accepted: ["supports"],
        explanation: "NCI states that tobacco use causes lung cancer, which supports the first sentence.",
      },
      {
        clueId: "nci-quitting",
        accepted: ["supports"],
        explanation: "NCI states that quitting reduces the risk of developing and dying from cancer.",
      },
      {
        clueId: "population-vs-person",
        accepted: ["open_question", "supports"],
        explanation:
          "What will happen to one person remains uncertain, which is an open question no population evidence fully answers.",
        alternativeNote:
          "Supports is also accepted: the claim itself says quitting can't guarantee an outcome, so this point matches its wording.",
      },
    ],
  },
  verdictScope:
    "The claim matches NCI's public-health statements at the scope it states: a cause, a risk reduction and no individual guarantee.",
  supportedConclusion: [
    { text: "Smoking causes lung cancer.", justification: "Stated directly by NCI." },
    {
      text: "Quitting reduces the risk of developing and dying from cancer, with the greatest benefit for people who quit younger.",
      justification: "Stated in NCI's fact sheet.",
    },
  ],
  notEstablished: [
    {
      text: "What will happen to any one person.",
      justification: "Population risk reductions describe groups, not guaranteed individual outcomes. The claim already says this.",
    },
    {
      text: "That quitting returns risk fully to never-smoker levels.",
      justification: "The NCI fact sheet doesn't say this.",
    },
  ],
  debrief: [
    "Not every claim needs a correction. Here the post states a well-established cause, a real benefit of quitting and an honest limit, and it stops there.",
    "Individual uncertainty doesn't erase a population conclusion. “Quitting lowers risk” and “quitting can't guarantee an outcome” are both true at once.",
    "The causal conclusion didn't require a trial assigning people to smoke. It rests on many consistent lines of evidence gathered over decades. Proportionate trust means accepting strong evidence as strong.",
  ],
  correctedHeadline:
    "Smoking causes lung cancer; quitting reduces risk without eliminating every individual's risk.",
  relatedCaseSlug: "missing-denominator",
  decoderSampleId: null,
  riskExample: null,
  timelineExample: null,
};
