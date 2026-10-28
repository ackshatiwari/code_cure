# Content policy

## Provenance labels

| Material | Label shown where it appears |
|---|---|
| Cases 01–03: posts, abstracts, counts | Fictional teaching example — not a real study |
| Case 04: post and age timeline | Hypothetical illustration of a real research-methods concept |
| Case 05: post | Fictional post summarizing real public-health evidence |
| Every case post | Fictional teaching post (or the Case 05 label), beside the author name |
| Decoder samples | Prewritten teaching example + Fictional teaching example — not a real study |
| Live decoder output | AI-generated explanation — check against the original text |
| Every decoder output | Based on the pasted abstract |

Authors are invented first names with an initial (Riley M., Jordan K., Alex T., Morgan P., Casey L.). No engagement counts. The fictional intervention, Beverage Q and Compound X are deliberately unnamed or invented. No journal, researcher, university, DOI, trial registration or publication date is invented anywhere.

## Sources

`src/content/sources.ts` holds every source. Each external source was opened on **2026-10-28**, and its `supports` text was written to match what the page actually says. Dates are the ones shown on the page; NCCIH pages show none, and that's stated rather than guessed.

| Source | Role | Used in |
|---|---|---|
| Cancer Research UK, *Absolute versus relative risk – making sense of media stories* (2013) | Methods background | Case 01 |
| NCI DCEG, *Absolute Risk Modeling* (updated 2025-09-08) | Methods background | Cases 01, 05 |
| NCI PDQ, *Levels of Evidence for Cancer Screening and Prevention Studies* (updated 2022-01-12) | Methods background | Cases 02, 04 |
| NCI, *Cancer Prevention Overview (PDQ®)–Patient Version* (updated 2025-05-02) | Methods background | Case 02 |
| NCCIH, *Design of the Study* | Methods background | Case 02 |
| NCCIH, *Types of Research* | Methods background | Case 03 |
| NCCIH, *Checklist for Understanding Health News Stories* | Methods background | Case 03 |
| NCI, *Crunching Numbers: What Cancer Screening Statistics Really Tell Us* (updated 2018-07-16) | Methods background | Case 04 |
| NCI, *Risk Factors: Tobacco* (updated 2017-01-23) | Public-health summary | Case 05 |
| NCI, *Harms of Cigarette Smoking and Health Benefits of Quitting* (reviewed 2017-12-19) | Public-health summary | Case 05 |

Every background source lists scope limitations, including "Does not contain the fictional … dataset" where relevant. Two candidate URLs were dropped during checking: an NCI risk-prediction page returned 404, and an NIH "Explaining How Research Works" page refused automated access. Neither is cited.

Notes on specific claims:

- Case 05 says quitting lowers risk "over time" and does not claim risk returns to never-smoker levels; the NCI fact sheet doesn't say that, and one headline distractor teaches exactly this.
- Case 05's causal conclusion does not depend on a randomized smoking trial. The case says it rests on "many consistent lines of evidence gathered over decades"; that phrase is general educational context, not a quotation.
- Case 04 says some screening tests have been shown in trials to reduce deaths. The NCI screening-statistics page discusses the National Lung Screening Trial's reduction in lung cancer deaths.

No logos are used, and the app states it isn't affiliated with NCI, NIH, NCCIH or Cancer Research UK.

## Review status

**Educational prototype; expert content review pending.** References were checked against the statements they support. No clinician or methodologist has reviewed the cases as a whole. There is no clinician seal, "medically verified" badge or reviewer avatar, and none should be added until a real review happens. Record any future review here: reviewer role, date, scope and changes made.

## AI boundaries (decoder)

- Live analysis is optional and off unless `ENABLE_LIVE_ANALYSIS=true` and `ANTHROPIC_API_KEY` are set on the server.
- The system prompt (`src/lib/analysis/prompt.ts`) treats pasted text as data, forbids invented study details, external references and personal advice, separates stated limitations from general design considerations, and requires sentence IDs.
- No tools are passed, so the model cannot browse, fetch URLs or run code.
- Output is validated independently of structured output (`response-validation.ts`):
  - schema, enums and bounds;
  - every cited sentence ID exists;
  - no URLs, DOIs or domains;
  - unknown glossary IDs are dropped;
  - group counts are used for arithmetic only if every number appears in the cited sentences.
- At most one repair attempt; a second failure shows an error, never a sample.
- Origin, coverage, source text and calculations are set by application code. The source panel shows stored input sentences, never model-written quotations, and the UI says a matching anchor isn't proof of correct interpretation.
- The SDK's structured-output helper sends enums as description hints rather than hard constraints, so enum correctness relies on the app's own Zod validation.

## Rate limiting and deployment

`MemoryRateLimiter` (default 5 requests per client and 100 per deployment, per 10 minutes) protects a single process only. In production, live analysis stays disabled unless:

- `RATE_LIMIT_BACKEND=hosting` (the operator attests that platform-level limits sit in front of `/api/analyze`), or
- `LIVE_ANALYSIS_ALLOW_IN_MEMORY_LIMITER=true` (a private, single-instance deployment).

Client identity comes only from `TRUSTED_CLIENT_ID_HEADER`, a header your host sets. Raw `X-Forwarded-For` is refused. Without that header, all callers share one bucket.

## Privacy

Progress (opened clues, answers, scores) goes to `localStorage` under `paper2people.progress`, versioned and validated. Pasted text and analyses stay in page memory. They are not stored, not put in URLs, and not logged; `/api/analyze` responses are `Cache-Control: no-store`. There is no analytics or telemetry.

## Reporting issues

There is no feedback backend. `/methodology#report` builds issue details for the user to copy and send to the maintainer.
