import type { CuratedCase } from "@/lib/schemas/case";
import { verdictOptions } from "./verdicts";

export const CASE_04_ILLUSTRATION =
  "This is a hypothetical illustration of a research-methods concept, not data from any study. Imagine one person whose cancer would lead to death at age 70. In one path, symptoms lead to diagnosis at age 67. In the other path, a screening test finds the same cancer at age 60. In both paths, the person dies at age 70.";

export const case04: CuratedCase = {
  id: "case-04",
  slug: "earlier-clock",
  version: 1,
  number: 4,
  title: "The earlier clock",
  topic: "screening",
  skill: "Survival interval versus mortality benefit",
  estimatedMinutes: 5,
  learningObjective:
    "Explain why moving a diagnosis earlier can lengthen survival after diagnosis without changing when someone dies.",
  claimText: "People lived longer after diagnosis in the screened group. That alone proves this screening test saved lives.",
  claimFragments: [
    { id: "longer-after-diagnosis", text: "People lived longer after diagnosis in the screened group." },
    { id: "alone-proves", text: "That alone proves this screening test saved lives." },
  ],
  postAuthor: "Morgan P.",
  fictionalPostLabel: "Fictional teaching post",
  materialType: "fictional_illustration",
  provenanceLabel: "Hypothetical illustration of a real research-methods concept",
  clues: [
    {
      id: "same-endpoint",
      kind: "study_details",
      title: "Study details: where each timeline ends",
      body: [
        "Both paths in the illustration use the same age axis and describe the same person and the same cancer.",
        "Look at the final age on each timeline before deciding what changed.",
      ],
      excerpt: "In both paths, the person dies at age 70.",
      sourceIds: ["p2p-fictional-teaching-material", "nci-screening-statistics"],
      claimFragmentIds: ["alone-proves"],
      materialOrigin: "hypothetical_illustration",
      glossaryTermIds: ["lead-time-bias", "mortality"],
    },
    {
      id: "survival-interval",
      kind: "numbers_outcome",
      title: "Numbers: time after diagnosis",
      body: [
        "Without screening, diagnosis comes at 67, so the time from diagnosis to death is 3 years.",
        "With screening, diagnosis comes at 60, so that interval becomes 10 years.",
      ],
      sourceIds: ["p2p-fictional-teaching-material"],
      claimFragmentIds: ["longer-after-diagnosis"],
      materialOrigin: "hypothetical_illustration",
      glossaryTermIds: ["survival"],
    },
    {
      id: "no-death-comparison",
      kind: "missing_context",
      title: "Source check: what would show lives were saved",
      body: [
        "The material contains no comparison of death rates between screened and unscreened groups, and no path in which death comes later.",
        "NCI explains which kind of comparison can show whether screening saves lives.",
      ],
      sourceIds: ["nci-screening-statistics", "nci-pdq-levels-of-evidence"],
      claimFragmentIds: ["alone-proves"],
      materialOrigin: "real_source_summary",
      glossaryTermIds: ["mortality", "randomized-controlled-trial", "overdiagnosis"],
    },
  ],
  studyView: {
    kind: "study",
    heading: "The hypothetical illustration",
    text: CASE_04_ILLUSTRATION,
    question: "If a screening test moves diagnosis earlier, does survival after diagnosis change, and does lifespan change?",
    context: "not_applicable",
    design: { value: "Hypothetical illustration (not a study)", status: "explicit" },
    fields: [
      { label: "Paths compared", value: { status: "reported", value: "Diagnosis at 67 (symptoms) vs. 60 (screening)" } },
      { label: "Endpoint", value: { status: "reported", value: "Death at age 70 in both paths" } },
      { label: "Sample size", value: { status: "not_applicable", note: "One hypothetical path, not a study sample." } },
      { label: "Death-rate comparison", value: { status: "not_applicable", note: "An illustration has no groups to compare." } },
      { label: "Screening test", value: { status: "not_applicable", note: "No real test is described." } },
    ],
  },
  sourceIds: ["p2p-fictional-teaching-material", "nci-screening-statistics", "nci-pdq-levels-of-evidence"],
  glossaryTermIds: ["survival", "mortality", "lead-time-bias", "overdiagnosis", "screening"],
  verdictOptions: verdictOptions({
    supported:
      "Survival after diagnosis did rise in the illustration, but the endpoint didn't move. Longer measured survival alone can't show that a life was extended.",
    misleading:
      "Yes. The longer survival interval is real in the illustration, but presenting it as proof of saved lives changes its meaning. Diagnosis moved; death didn't.",
    unsupported:
      "Close, but the post's first sentence is accurate for the illustration. The problem is the framing of a real statistic, which is what Misleading describes.",
    "not-enough-information":
      "You can't tell from this material whether any real test saves lives, but the claim says the survival figure alone proves it, and the illustration is enough to show that it doesn't.",
  }),
  reasonOptions: [
    {
      id: "earlier-start",
      label: "Starting the survival clock earlier can change the statistic without extending life.",
      explanation:
        "Correct. Survival is counted from diagnosis. Diagnosing at 60 instead of 67 adds 7 years to survival even though death still comes at 70.",
    },
    {
      id: "screening-ineffective",
      label: "The illustration shows that screening is ineffective.",
      explanation:
        "No. It shows only that survival after diagnosis can't answer the question. Whether a specific test reduces deaths depends on evidence about that test.",
    },
    {
      id: "one-person",
      label: "The only problem is that it shows one person instead of a large group.",
      explanation:
        "More people wouldn't fix it. If every screened person's diagnosis moved earlier with the same death age, survival would rise across the whole group.",
    },
    {
      id: "survival-unmeasurable",
      label: "Survival can't be measured accurately in screened people.",
      explanation:
        "Survival can be measured precisely. The issue is what it measures: time from diagnosis, which shifts when diagnosis shifts.",
    },
  ],
  headlineOptions: [
    {
      id: "survival-not-deaths",
      label: "Longer survival after diagnosis alone does not establish that screening reduces deaths.",
      explanation: "Correct. It keeps the statistic and its limit in one sentence, without dismissing screening.",
    },
    {
      id: "saves-lives",
      label: "Screening test saves lives, survival data prove.",
      explanation: "This repeats the post's inference.",
    },
    {
      id: "screening-doesnt-work",
      label: "Screening doesn't work: survival gains are an illusion.",
      explanation:
        "This overcorrects. Some screening tests have been shown to reduce deaths; survival figures just can't show it on their own.",
    },
    {
      id: "seven-years-longer",
      label: "Screened people survived 7 years longer.",
      explanation:
        "Technically true of the interval after diagnosis, but it reads as 7 more years of life, which the illustration doesn't show.",
    },
  ],
  answerKey: {
    verdictId: "misleading",
    reasonId: "earlier-start",
    headlineId: "survival-not-deaths",
    clues: [
      {
        clueId: "same-endpoint",
        accepted: ["challenges"],
        explanation: "Death comes at 70 in both paths, which challenges the idea that a life was extended.",
      },
      {
        clueId: "survival-interval",
        accepted: ["supports"],
        explanation:
          "Survival after diagnosis rises from 3 to 10 years, so the post's first sentence is accurate for the illustration.",
      },
      {
        clueId: "no-death-comparison",
        accepted: ["open_question", "challenges"],
        explanation:
          "Whether a real test reduces deaths needs a comparison of death rates. That question is left open here.",
        alternativeNote:
          "Challenges is also accepted: the claim says survival “alone proves” lives were saved, and the missing death comparison is exactly what that proof would require.",
      },
    ],
  },
  verdictScope:
    "In the illustration, survival after diagnosis increases, but death occurs at the same age. Survival alone can't show that screening saved a life.",
  supportedConclusion: [
    { text: "Moving diagnosis from 67 to 60 lengthens survival after diagnosis from 3 years to 10 years." },
    {
      text: "Survival statistics can rise when diagnosis happens earlier, even with no change in when people die.",
      justification: "This is the lead-time effect NCI describes.",
    },
  ],
  notEstablished: [
    { text: "That screening extended this person's life.", justification: "Death occurs at 70 in both paths." },
    {
      text: "That any real screening test is ineffective.",
      justification: "The illustration is about a statistic, not a test. Some screening tests have been shown in trials to reduce deaths.",
    },
    {
      text: "Whether a specific test's benefits outweigh its harms.",
      justification: "That depends on the test, the population and evidence such as death-rate comparisons.",
    },
  ],
  debrief: [
    "Survival is measured from the moment of diagnosis. Screening moves that moment earlier, so survival can grow even when the date of death doesn't change. This is called lead-time bias.",
    "Overdiagnosis adds a second distortion: cancers that would never have caused harm are counted as “survivors,” which makes survival figures look better.",
    "To learn whether screening saves lives, researchers compare death rates in large groups, ideally in randomized trials. That evidence differs from test to test. This case doesn't tell anyone whether to be screened.",
  ],
  correctedHeadline: "Longer survival after diagnosis alone does not establish that screening reduces deaths.",
  relatedCaseSlug: "supported-conclusion",
  decoderSampleId: null,
  riskExample: null,
  timelineExample: {
    axisStart: 50,
    axisEnd: 75,
    paths: [
      { id: "symptoms", label: "Diagnosed after symptoms", diagnosisAge: 67, endAge: 70 },
      { id: "screened", label: "Diagnosed by screening", diagnosisAge: 60, endAge: 70 },
    ],
  },
};
