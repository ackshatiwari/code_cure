# Paper2People — product spec

**Tagline:** Understand the research. Follow the evidence.
**Flagship game:** CancerCase.

An interactive research-literacy app that helps people investigate cancer claims, understand the evidence behind them, and identify conclusions that go further than a study establishes.

## One learning loop, three entrances

Encounter a claim → inspect evidence → understand the study → connect the clues → explain a verdict → apply that reasoning elsewhere.

| Entrance | Where | Shared pieces |
|---|---|---|
| CancerCase investigations | `/cases`, `/cases/[slug]`, `/demo` | Claim post, clue cards, evidence board, study details, limits panel, source drawer, glossary popovers |
| Paper2People decoder | `/decode` | The same limits panel ("What the evidence does support" / "What this study doesn't prove"), source sentences, glossary, provenance labels |
| Misinformation literacy | Built into the five case skills | Missing denominators, association vs causation, lab vs human, survival vs mortality, proportionate trust |

Cases 01–03 link to their own abstracts in the decoder, and results pages offer "Explore this abstract in the decoder".

## Audience and voice

Curious adults and older students without research training; people affected by cancer may use it. Aim for roughly grade 7–9 readability (not formally certified). Incorrect answers are "inferences to reconsider". No shaming, no alarm, no miracle language, no jokes about illness.

## Scope (MVP, built)

- Five complete, sourced investigations (prevention ×3, research ×1, screening ×1) with full answer keys.
- Guided demo of Case 01 (`/demo`) with its own progress key.
- Evidence board: select a clue → choose a relation → grouped list. Click, touch and keyboard. No drag required.
- Three fixed multiple-choice questions; deterministic scoring out of 100.
- Results page in the specified order, with a no-attempt state for direct visits.
- Decoder with three prewritten samples (relative risk, observational, cell study) that need no credentials, plus optional live analysis through the Anthropic API.
- Searchable glossary of 28 terms with synonyms; contextual definitions in cases and the decoder.
- Methodology page: provenance, sources, scoring, AI limits, privacy, review status, progress reset, copyable issue report.
- Local, versioned progress in `localStorage`, with recovery from corrupt or outdated data.

## Out of scope (by decision)

Accounts, subscriptions, leaderboards, chatbot, clinical advice, web fact-checking, URL/DOI fetching, document uploads, social feeds, CMS, multiplayer, personal health profiles, dashboards, analytics.

## Key decisions

| Decision | Why |
|---|---|
| Next.js 16 App Router with Cache Components (scaffold default) | Static case content prerenders; interactive parts are client islands. |
| Content in versioned TypeScript files validated with Zod at import | A malformed fixture fails the build instead of rendering. |
| A small external store (`useSyncExternalStore`) over a reducer, rather than a state library | Shared progress across routes, no hydration mismatch, no extra dependency. |
| Demo progress stored under `case-01:demo` | Rehearsal resets never touch real Case 01 progress. |
| Samples matched by exact normalized text | Edited or unrelated text never receives a prewritten analysis. |
| Live analysis disabled by default; refused in production without hosting-level rate limits | An in-memory limiter is not a public protection. |
| `src/proxy.ts` 404s unknown case slugs | With partial prerendering the not-found UI would otherwise stream with HTTP 200. |
| Answer keys ship to the client | This is education, not a secure exam. |
| Case 05's study view is a source summary with trial fields marked not applicable | It is public-health evidence, not one study. |

## Routes

`/`, `/cases`, `/cases/[slug]`, `/cases/[slug]/verdict`, `/demo`, `/demo/verdict`, `/decode` (optionally `?sample=<curated id>`), `/glossary`, `/methodology`, `POST /api/analyze`, `GET /api/capabilities`.

Pasted abstracts never appear in URLs, storage or logs.
