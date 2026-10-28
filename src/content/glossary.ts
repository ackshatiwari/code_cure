import { z } from "zod";
import { idSchema } from "@/lib/schemas/case";

export const glossaryEntrySchema = z.object({
  id: idSchema,
  term: z.string().min(1),
  synonyms: z.array(z.string()),
  definition: z.string().min(1),
  example: z.string().min(1),
  whyItMatters: z.string().min(1),
  related: z.array(idSchema),
});
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;

export const glossary: GlossaryEntry[] = [
  {
    id: "abstract",
    term: "Abstract",
    synonyms: ["summary", "study summary"],
    definition: "A short summary at the start of a research paper that describes the question, methods, main results and conclusion.",
    example: "A 250-word abstract may report the main result but leave out the side effects described later in the paper.",
    whyItMatters: "An abstract is a starting point. Details that change the meaning of a result are often only in the full paper.",
    related: ["peer-review", "preprint"],
  },
  {
    id: "absolute-risk",
    term: "Absolute risk",
    synonyms: ["actual risk", "baseline risk", "risk"],
    definition: "The chance that something happens in a group over a stated period, such as 20 out of 1,000 people over five years.",
    example: "If 15 of 1,000 people develop an outcome over five years, the absolute risk in that group is 1.5% over five years.",
    whyItMatters: "Without the absolute risk, you can't tell whether a percentage change in a headline is large or small in real terms.",
    related: ["relative-risk", "percentage-point", "natural-frequency", "denominator"],
  },
  {
    id: "relative-risk",
    term: "Relative risk",
    synonyms: ["risk ratio", "relative reduction", "relative change", "rr"],
    definition: "A comparison of the risk in one group with the risk in another, often reported as a percentage increase or decrease.",
    example: "Going from 2% to 1.5% is a 25% relative reduction, because 0.5 is a quarter of 2.",
    whyItMatters: "A relative change can sound large even when few people are affected. Look for the starting risk too.",
    related: ["absolute-risk", "percentage-point", "hazard-ratio"],
  },
  {
    id: "percentage-point",
    term: "Percentage point",
    synonyms: ["percentage points", "pp", "absolute difference"],
    definition: "The plain difference between two percentages. Going from 2% to 1.5% is a drop of 0.5 percentage points.",
    example: "A fall from 2% to 1.5% is 0.5 percentage points, which is the same as 5 fewer per 1,000 people.",
    whyItMatters: "Mixing up percent and percentage points can make a small absolute change look fifty times bigger.",
    related: ["absolute-risk", "relative-risk"],
  },
  {
    id: "denominator",
    term: "Denominator",
    synonyms: ["out of how many", "base number"],
    definition: "The total number of people a count is out of, such as the 1,000 in “15 out of 1,000.”",
    example: "“15 cases” means little until you know whether it was 15 out of 100 people or 15 out of 100,000.",
    whyItMatters: "A count or a percentage change without its denominator can't tell you how common something is.",
    related: ["absolute-risk", "natural-frequency"],
  },
  {
    id: "natural-frequency",
    term: "Natural frequency",
    synonyms: ["per 1,000", "per 1000", "frequency format"],
    definition: "A way of stating risk as a count out of a fixed group, such as 15 per 1,000 people over five years.",
    example: "“5 fewer per 1,000 people over five years” is a natural-frequency way of saying 0.5 percentage points.",
    whyItMatters: "Many people find counts out of a fixed group easier to compare than percentages.",
    related: ["absolute-risk", "denominator"],
  },
  {
    id: "association",
    term: "Association",
    synonyms: ["link", "correlation", "linked to", "relationship"],
    definition: "A pattern in which two things tend to occur together more or less often than expected.",
    example: "People who choose a drink may have fewer diagnoses, while also differing in exercise or smoking.",
    whyItMatters: "An association can be a real clue, but it does not by itself show that one thing caused the other.",
    related: ["causation", "confounder", "observational-study"],
  },
  {
    id: "causation",
    term: "Causation",
    synonyms: ["cause", "causal", "causes", "causal effect"],
    definition: "A relationship in which changing one thing actually produces a change in another.",
    example: "The conclusion that smoking causes lung cancer rests on many kinds of consistent evidence gathered over decades.",
    whyItMatters: "Claims like “prevents” or “cures” are causal. Check whether the evidence can support that kind of conclusion.",
    related: ["association", "randomized-controlled-trial", "confounder"],
  },
  {
    id: "confounder",
    term: "Confounder",
    synonyms: ["confounding", "confounding factor", "lurking variable", "third factor"],
    definition: "A third factor linked to both the exposure and the outcome that can create or hide an apparent relationship between them.",
    example: "If drinkers of one beverage also smoke less, smoking could explain some of the difference in cancer diagnoses.",
    whyItMatters: "Before reading a link as cause and effect, ask what else differed between the groups.",
    related: ["association", "observational-study"],
  },
  {
    id: "observational-study",
    term: "Observational study",
    synonyms: ["cohort study", "case-control study", "observational research", "epidemiology"],
    definition: "A study in which researchers measure what people already do or experience, without assigning them to an intervention.",
    example: "Following 1,200 adults who chose their own drinks for six years is an observational design.",
    whyItMatters: "Observational studies can reveal important links and contribute to causal knowledge, but groups may differ in ways that affect the outcome.",
    related: ["association", "confounder", "randomized-controlled-trial"],
  },
  {
    id: "randomized-controlled-trial",
    term: "Randomized controlled trial",
    synonyms: ["rct", "randomised controlled trial", "randomized trial", "clinical trial"],
    definition: "A study in which participants are assigned by chance to an intervention or a comparison group, then followed for outcomes.",
    example: "Assigning 2,000 adults at random to two groups makes the groups similar on average before follow-up begins.",
    whyItMatters: "Random assignment helps separate the effect of the intervention from other differences, but one trial still applies to its own setting and population.",
    related: ["causation", "observational-study", "sample-size"],
  },
  {
    id: "sample-size",
    term: "Sample size",
    synonyms: ["n", "number of participants", "study size"],
    definition: "The number of people, animals, samples or other units included in a study or analysis.",
    example: "A study of 40 people can be informative, but its estimates will usually be less precise than one of 40,000.",
    whyItMatters: "Small studies can produce results that shift a lot when repeated. Size alone does not make a study trustworthy, either.",
    related: ["confidence-interval"],
  },
  {
    id: "confidence-interval",
    term: "Confidence interval",
    synonyms: ["ci", "95% ci", "uncertainty interval", "interval estimate"],
    definition: "A range around an estimate that reflects how precisely the study measured it, under the assumptions of the analysis.",
    example: "A relative reduction of 25% with a wide interval that includes no difference is much less precise than one with a narrow interval.",
    whyItMatters: "A single number hides uncertainty. When no interval is reported, you cannot judge precision from the text.",
    related: ["statistical-significance", "sample-size"],
  },
  {
    id: "statistical-significance",
    term: "Statistical significance",
    synonyms: ["significant", "p-value", "p value", "statistically significant"],
    definition: "A label that a result passed a chosen statistical test threshold, often p < 0.05. A p-value describes how surprising the data would be if a stated assumption, such as no difference, were true.",
    example: "A “statistically significant” result can still be too small to matter, and a non-significant result does not show there is no effect.",
    whyItMatters: "Significance is not proof that a finding is real or important, and a p-value is not the probability that a hypothesis is true.",
    related: ["confidence-interval"],
  },
  {
    id: "preclinical-research",
    term: "Preclinical research",
    synonyms: ["lab study", "laboratory research", "basic research", "animal study", "in vitro", "in vivo"],
    definition: "Research done before testing in people, such as experiments in cells or animals.",
    example: "A compound that slows cancer cells in a dish is at the preclinical stage.",
    whyItMatters: "Preclinical results guide further research. They do not show that a treatment is safe or effective in people.",
    related: ["cell-culture", "randomized-controlled-trial"],
  },
  {
    id: "cell-culture",
    term: "Cell culture",
    synonyms: ["cell line", "cells in a dish", "cultured cells", "in vitro"],
    definition: "Cells grown under controlled laboratory conditions, outside the body.",
    example: "A viability assay measures how many cultured cells remain alive after a set time.",
    whyItMatters: "A body has immune systems, organs and metabolism that a dish does not, so effects may differ in people.",
    related: ["preclinical-research"],
  },
  {
    id: "screening",
    term: "Screening",
    synonyms: ["screening test", "cancer screening", "early detection"],
    definition: "Testing people who have no symptoms to look for a disease or its early signs.",
    example: "A screening test may find a cancer years before it would have caused symptoms.",
    whyItMatters: "Earlier detection does not automatically mean longer life. Screening benefits and harms depend on the test, population and evidence.",
    related: ["lead-time-bias", "overdiagnosis", "mortality"],
  },
  {
    id: "mortality",
    term: "Mortality",
    synonyms: ["death rate", "mortality rate", "deaths"],
    definition: "The rate of deaths in a population over a period, such as deaths from a cancer per 100,000 people each year.",
    example: "A screening trial may compare cancer deaths in screened and unscreened groups of the same size.",
    whyItMatters: "Mortality counts deaths in a whole group, so it is not distorted by when a diagnosis happened.",
    related: ["survival", "screening"],
  },
  {
    id: "survival",
    term: "Survival",
    synonyms: ["survival rate", "five-year survival", "5-year survival", "time after diagnosis"],
    definition: "The share of people still alive a set time after diagnosis, or the length of time they live after diagnosis.",
    example: "Five-year survival counts people alive five years after diagnosis, so moving diagnosis earlier can raise it.",
    whyItMatters: "Survival starts counting at diagnosis. A change in when diagnosis happens can change survival without changing when people die.",
    related: ["mortality", "lead-time-bias"],
  },
  {
    id: "lead-time-bias",
    term: "Lead-time bias",
    synonyms: ["lead time", "earlier clock"],
    definition: "An apparent increase in survival that comes only from diagnosing a disease earlier, not from delaying death.",
    example: "Diagnosed at 60 instead of 67, with death at 70 either way: survival rises from 3 to 10 years, but lifespan is unchanged.",
    whyItMatters: "Longer survival after diagnosis alone cannot show that a screening test saves lives.",
    related: ["survival", "screening", "mortality"],
  },
  {
    id: "overdiagnosis",
    term: "Overdiagnosis",
    synonyms: ["overdetection"],
    definition: "Diagnosis of a condition that would never have caused symptoms or harm during a person's lifetime.",
    example: "A slow-growing tumor found by screening might never have affected the person if left undiscovered.",
    whyItMatters: "Overdiagnosed cases can make survival statistics look better and lead to treatment that brings no benefit.",
    related: ["screening", "survival"],
  },
  {
    id: "surrogate-outcome",
    term: "Surrogate outcome",
    synonyms: ["surrogate endpoint", "intermediate outcome", "biomarker outcome"],
    definition: "A measurement used in place of the outcome people care about most, such as tumor shrinkage instead of longer life.",
    example: "A drop in a lab measurement is a surrogate outcome; it may or may not lead to people living longer or better.",
    whyItMatters: "A change in a surrogate outcome does not guarantee a change in the outcome that matters to patients.",
    related: ["mortality", "preclinical-research"],
  },
  {
    id: "hazard-ratio",
    term: "Hazard ratio",
    synonyms: ["hr"],
    definition: "A relative measure comparing how often an event happens over time in one group versus another.",
    example: "A hazard ratio of 0.80 means a lower event rate in one group, but on its own does not say how many people were affected.",
    whyItMatters: "A hazard ratio cannot be turned into an absolute risk without knowing the underlying event rates.",
    related: ["relative-risk", "absolute-risk", "odds-ratio"],
  },
  {
    id: "odds-ratio",
    term: "Odds ratio",
    synonyms: ["or"],
    definition: "A relative measure comparing the odds of an outcome in one group with the odds in another.",
    example: "An odds ratio of 1.5 is not the same as “50% more likely,” especially when the outcome is common.",
    whyItMatters: "Odds ratios are often misread as risk ratios, and neither gives absolute risk on its own.",
    related: ["relative-risk", "hazard-ratio"],
  },
  {
    id: "follow-up",
    term: "Follow-up",
    synonyms: ["follow up", "time window", "follow-up period"],
    definition: "How long participants were observed after a study began.",
    example: "20 versus 15 cases per 1,000 over five years says nothing about what happened after year five.",
    whyItMatters: "A risk without a time window is incomplete, and short follow-up can miss later benefits or harms.",
    related: ["absolute-risk"],
  },
  {
    id: "peer-review",
    term: "Peer review",
    synonyms: ["peer reviewed", "peer-reviewed", "refereed"],
    definition: "A process in which other researchers evaluate a manuscript before a journal publishes it.",
    example: "Reviewers may ask authors to clarify methods or soften conclusions before publication.",
    whyItMatters: "Peer review is a useful check, but it does not guarantee that a study's methods or conclusions are correct.",
    related: ["preprint", "abstract"],
  },
  {
    id: "preprint",
    term: "Preprint",
    synonyms: ["pre-print", "not yet peer reviewed"],
    definition: "A research paper shared publicly before it has completed peer review at a journal.",
    example: "A preprint may change substantially, or never be published, after review.",
    whyItMatters: "Preprints speed up sharing, but readers should treat their conclusions as provisional.",
    related: ["peer-review"],
  },
  {
    id: "systematic-review",
    term: "Systematic review",
    synonyms: ["meta-analysis", "review of studies", "evidence review"],
    definition: "A study that searches for, selects and appraises all eligible research on a question using a stated, repeatable method.",
    example: "A systematic review might combine 30 trials of a screening test to estimate its effect on deaths.",
    whyItMatters: "One study rarely settles a question. A well-conducted review shows how the wider evidence fits together.",
    related: ["randomized-controlled-trial", "observational-study"],
  },
];

const byId = new Map(glossary.map((g) => [g.id, g]));

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return byId.get(id);
}

function normalize(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9%]+/g, " ").trim();
}

/** Case-insensitive search across terms, synonyms and definitions. Terms and synonyms rank first. */
export function searchGlossary(query: string): GlossaryEntry[] {
  const q = normalize(query);
  if (!q) return glossary;
  const scored = glossary
    .map((entry) => {
      const names = [entry.term, ...entry.synonyms].map(normalize);
      let score = 0;
      if (names.some((n) => n === q)) score = 3;
      else if (names.some((n) => n.startsWith(q) || n.split(" ").some((w) => w.startsWith(q)))) score = 2;
      else if (names.some((n) => n.includes(q))) score = 1.5;
      else if (normalize(entry.definition).includes(q)) score = 1;
      return { entry, score };
    })
    .filter((s) => s.score > 0);
  scored.sort((a, b) => b.score - a.score || a.entry.term.localeCompare(b.entry.term));
  return scored.map((s) => s.entry);
}
