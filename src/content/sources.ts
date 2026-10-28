import type { Source } from "@/lib/schemas/case";

/**
 * Every external source below was opened and read on the checkedAt date, and the
 * `supports` text was written to match what the page actually says. Dates are the
 * ones displayed on the page itself. Background citations explain concepts; none of
 * them contain the invented datasets used in Cases 01–04.
 */
const CHECKED = "2026-10-28";

export const sources: Source[] = [
  {
    id: "cruk-absolute-relative-risk",
    title: "Absolute versus relative risk – making sense of media stories",
    organization: "Cancer Research UK",
    url: "https://news.cancerresearchuk.org/2013/03/15/absolute-versus-relative-risk-making-sense-of-media-stories/",
    role: "methods_background",
    publicationDate: "15 March 2013",
    publicationDateLabel: "Published",
    checkedAt: CHECKED,
    supports:
      "Explains that headlines usually report relative risk, that the absolute (baseline) risk is often missing, and that a large relative change can be a small absolute change when the starting risk is low.",
    scopeLimitations: [
      "Methods background only. Does not contain the fictional Case 01 dataset.",
      "Written as a news-literacy explainer, not a statistics reference.",
    ],
  },
  {
    id: "nci-dceg-absolute-risk-modeling",
    title: "Absolute Risk Modeling",
    organization: "National Cancer Institute, Division of Cancer Epidemiology and Genetics",
    url: "https://dceg.cancer.gov/research/how-we-study/risk-modeling",
    role: "methods_background",
    publicationDate: "September 8, 2025",
    publicationDateLabel: "Updated",
    checkedAt: CHECKED,
    supports:
      "Describes NCI work projecting individualized absolute cancer risk and states that absolute risk is typically more useful than relative risk for clinical and public health applications.",
    scopeLimitations: [
      "Methods background only. Does not contain the fictional Case 01 dataset.",
      "Describes research models; Paper2People does not calculate anyone's personal risk.",
    ],
  },
  {
    id: "nci-pdq-levels-of-evidence",
    title: "Levels of Evidence for Cancer Screening and Prevention Studies (PDQ®)–Health Professional Version",
    organization: "National Cancer Institute (PDQ Screening and Prevention Editorial Board)",
    url: "https://www.cancer.gov/publications/pdq/levels-evidence/screening-prevention",
    role: "methods_background",
    publicationDate: "January 12, 2022",
    publicationDateLabel: "Updated",
    checkedAt: CHECKED,
    supports:
      "Ranks evidence from randomized controlled trials above nonrandomized controlled trials and cohort or case-control studies, while noting that solid evidence can sometimes come from other designs. Treats mortality reduction as a key potential benefit of screening.",
    scopeLimitations: [
      "Methods background only. Does not contain the fictional Case 02 or Case 04 material.",
      "Written for health professionals; it rates evidence and does not make recommendations.",
    ],
  },
  {
    id: "nci-prevention-overview-patient",
    title: "Cancer Prevention Overview (PDQ®)–Patient Version",
    organization: "National Cancer Institute",
    url: "https://www.cancer.gov/about-cancer/causes-prevention/patient-prevention-overview-pdq",
    role: "methods_background",
    publicationDate: "May 2, 2025",
    publicationDateLabel: "Updated",
    checkedAt: CHECKED,
    supports:
      "Distinguishes factors that are linked to cancer risk from factors scientists believe cause cancer, and notes in several places that other factors can change study results or make it hard to know which factor explains a difference.",
    scopeLimitations: [
      "Methods background only. Does not contain the fictional Case 02 study or anything about Beverage Q.",
      "General prevention overview; not personal prevention advice.",
    ],
  },
  {
    id: "nccih-design-of-the-study",
    title: "How To Make Sense of a Scientific Journal Article: Design of the Study",
    organization: "National Center for Complementary and Integrative Health (NIH)",
    url: "https://www.nccih.nih.gov/health/know-science/how-to-make-sense-of-a-scientific-journal-article/methods/design-of-the-study",
    role: "methods_background",
    publicationDate: null,
    publicationDateLabel: null,
    checkedAt: CHECKED,
    supports:
      "Explains that controlled trials compare groups of participants who are kept as identical as possible apart from the treatment being studied, with participants assigned to a control or experimental group.",
    scopeLimitations: [
      "Methods background only. Does not contain the fictional Case 02 study.",
      "The page does not discuss observational studies directly.",
      "No publication or update date is shown on the page.",
    ],
  },
  {
    id: "nccih-types-of-research",
    title: "How To Make Sense of a Scientific Journal Article: Types of Research",
    organization: "National Center for Complementary and Integrative Health (NIH)",
    url: "https://www.nccih.nih.gov/health/know-science/how-to-make-sense-of-a-scientific-journal-article/methods/types-of-research",
    role: "methods_background",
    publicationDate: null,
    publicationDateLabel: null,
    checkedAt: CHECKED,
    supports:
      "Describes basic research as the first step in research, and clinical trials conducted with people as giving the clearest evidence on whether a treatment is safe and effective in humans, usually after smaller preliminary studies.",
    scopeLimitations: [
      "Methods background only. Does not contain the fictional Case 03 cell experiment or Compound X.",
      "The page does not specifically discuss cell or animal studies.",
      "No publication or update date is shown on the page.",
    ],
  },
  {
    id: "nccih-health-news-checklist",
    title: "Checklist for Understanding Health News Stories",
    organization: "National Center for Complementary and Integrative Health (NIH)",
    url: "https://www.nccih.nih.gov/health/know-science/facts-health-news-stories/checklist-for-understanding-health-news-stories",
    role: "methods_background",
    publicationDate: null,
    publicationDateLabel: null,
    checkedAt: CHECKED,
    supports:
      "Lists questions to ask about a health story, including whether the product or procedure was tested on people, whether enough people were studied, whether limitations were discussed, and whether the study was long enough to show long-term benefits or risks.",
    scopeLimitations: [
      "Methods background only. Does not contain any fictional case material.",
      "No publication or update date is shown on the page.",
    ],
  },
  {
    id: "nci-screening-statistics",
    title: "Crunching Numbers: What Cancer Screening Statistics Really Tell Us",
    organization: "National Cancer Institute",
    url: "https://www.cancer.gov/about-cancer/screening/research/what-screening-statistics-mean",
    role: "methods_background",
    publicationDate: "July 16, 2018",
    publicationDateLabel: "Updated",
    checkedAt: CHECKED,
    supports:
      "Explains that survival after diagnosis cannot accurately show whether screening saves lives because of several biases, including lead-time bias and overdiagnosis, and that comparing death rates in randomized trials is the reliable approach.",
    scopeLimitations: [
      "Conceptual source for Case 04. The Case 04 ages are a hypothetical illustration, not data from this page.",
      "Does not give screening advice for any individual.",
    ],
  },
  {
    id: "nci-tobacco-risk-factor",
    title: "Risk Factors: Tobacco",
    organization: "National Cancer Institute",
    url: "https://www.cancer.gov/about-cancer/causes-prevention/risk/tobacco",
    role: "public_health_summary",
    publicationDate: "January 23, 2017",
    publicationDateLabel: "Updated",
    checkedAt: CHECKED,
    supports: "States that tobacco use causes many types of cancer, including cancer of the lung.",
    scopeLimitations: [
      "A public-health summary of a large body of evidence, not a single study.",
      "Describes population-level evidence; it cannot predict one person's outcome.",
    ],
  },
  {
    id: "nci-cessation-fact-sheet",
    title: "Harms of Cigarette Smoking and Health Benefits of Quitting",
    organization: "National Cancer Institute",
    url: "https://www.cancer.gov/about-cancer/causes-prevention/risk/tobacco/cessation-fact-sheet",
    role: "public_health_summary",
    publicationDate: "December 19, 2017",
    publicationDateLabel: "Reviewed",
    checkedAt: CHECKED,
    supports:
      "States that smoking causes cancers of the lung and other organs, that quitting smoking reduces the risk of developing and dying from cancer, and that the benefit is greatest among people who quit at a younger age.",
    scopeLimitations: [
      "A public-health summary, not a single study.",
      "Compares people who quit with people who continue to smoke; it does not say risk returns fully to that of people who never smoked.",
    ],
  },
  {
    id: "p2p-fictional-teaching-material",
    title: "Paper2People teaching material",
    organization: "Paper2People (this app)",
    url: null,
    role: "fictional_teaching_material",
    publicationDate: null,
    publicationDateLabel: null,
    checkedAt: null,
    supports:
      "The fictional posts, abstracts, counts and illustrations in Cases 01–04 were written for this app to teach reasoning skills.",
    scopeLimitations: [
      "Not a real study. No journal, researcher, institution or trial registration exists for it.",
      "Its numbers establish nothing about any real intervention, beverage, compound or screening test.",
    ],
  },
];

const byId = new Map(sources.map((s) => [s.id, s]));

export function getSource(id: string): Source | undefined {
  return byId.get(id);
}

export const sourceRoleLabels: Record<Source["role"], string> = {
  study_source: "Study source",
  public_health_summary: "Public-health summary",
  methods_background: "Methods background",
  fictional_teaching_material: "Fictional teaching material",
};
