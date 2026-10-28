# Build checklist

Status as of 2026-10-28. ✅ built and verified · 🟡 built, partly verified · ⬜ not done.

## Core product

| Item | Status | Verification |
|---|---|---|
| Five complete, sourced investigations | ✅ | Zod schema at import; `content-integrity.test.ts` (no dangling IDs, provenance labels, verdict mix) |
| Evidence board (select → relation → grouped), change and remove | ✅ | `components.test.tsx`, e2e investigation, keyboard and phone flows |
| Deterministic scoring (40/30/20/10, single rounding) | ✅ | `scoring-and-state.test.ts` (100, 0, 0/7/13/20, alternatives) |
| State machine: not_started → investigating → ready_for_verdict → submitted → reviewing | ✅ | Unit tests; frozen attempts ignore edits and repeat submits |
| First-attempt score kept; practice again doesn't duplicate completion | ✅ | Unit + e2e |
| Results page in the specified order; no-attempt state | ✅ | e2e "direct verdict navigation" |
| Guided demo with separate progress | ✅ | e2e; steps complete only on real actions |
| Decoder: input, limits, samples, URL-only and too-long handling | ✅ | e2e decoder; unit handler tests |
| Prewritten sample analyses (relative risk, observational, cell study) | ✅ | Validated against segmentation in unit tests |
| Source anchoring to stored input sentences, with return action | ✅ | Component + e2e |
| Copy explanation with coverage and provenance; clipboard fallback | 🟡 | Success path e2e-tested; fallback textarea built but only reached when the browser denies clipboard access |
| Live analysis via Anthropic SDK (`beta.messages.create`, structured output, `fallbacks: "default"`) | 🟡 | Typechecked against SDK 1.3.0; handler, repair, timeout, rate-limit and error mapping tested with an injected fake provider; UI tested with mocked responses. **Not exercised against the real API** (no key used during the build). |
| Cancel and stale-request protection | ✅ | e2e cancel and replaced-request tests |
| Capability gating; honest "not enabled" message; input preserved | ✅ | e2e |
| Glossary: 28 terms, synonyms, no-results state, deep links | ✅ | Unit search tests; axe |
| Contextual definitions (popover, Escape returns focus) | ✅ | e2e keyboard |
| Methodology: provenance, scoring, AI limits, privacy, review status, reset with confirmation, copy issue details | ✅ | axe; manual screenshot review |
| Local progress: versioned, validated, corrupt and outdated recovery, unavailable-storage message | ✅ | `progress-storage.test.ts`; e2e refresh restores |
| Risk-in-context diagram (zero baseline, relative/absolute, natural frequency without 2,000 DOM nodes) | ✅ | Component tests; screenshots |
| Earlier-clock timeline (shared axis, reveal button, question, screen-reader text) | ✅ | axe after reveal; screenshots |
| Real 404 for unknown case slugs | ✅ | e2e (status 404) |

## Accessibility and responsive

| Item | Status | Notes |
|---|---|---|
| Landmarks, skip link, one h1, focus after navigation | ✅ | e2e keyboard |
| Keyboard completion of clues, board, choices, definitions, sources, submit | ✅ | e2e keyboard (desktop project) |
| axe WCAG 2.0/2.1/2.2 A and AA on 8 routes plus opened-case, decoded-sample and result states | ✅ | No violations on either project |
| Contrast of tokens | ✅ | Computed ratios in `design-system.md` |
| No horizontal overflow at 360, 390, 768, 1024 and 1440 px on 7 routes | ✅ | `responsive.spec.ts` |
| Phone task flow; submit not covered by sticky UI | ✅ | e2e at 360 px |
| 200% text size | 🟡 | Smoke test only (page renders, key controls visible); not a full reflow audit |
| Screen-reader testing with real assistive technology | ⬜ | Not done. Automated checks don't prove conformance. |
| Reduced motion | 🟡 | CSS honours `prefers-reduced-motion`; not separately tested |

Overall: WCAG 2.2 AA was the target for the implemented flows. Automated checks and keyboard tests pass; a manual audit with assistive technology is still outstanding.

## Last recorded runs

- `npm run typecheck`: pass
- `npm run lint`: pass, 0 problems
- `npm test`: 6 files, 73 tests passed
- `npm run build`: pass (24 static pages; `/api/*` and the proxy are dynamic)
- `npx playwright test`: 59–61 passed; skips are intentional (keyboard and fixed-width suites run on desktop only; screenshots need `SCREENSHOTS=1`). Two consecutive full runs passed. One earlier timing failure was traced to clicks before hydration and fixed by keeping submit buttons inert until hydration.

## Known limitations

- Live analysis hasn't been run against the real Anthropic API.
- The SDK's structured-output helper sends enums as description hints rather than hard constraints. The app's Zod validation plus one repair attempt covers this, but a model that repeatedly returns bad enum values will produce an "invalid response" error.
- The in-memory rate limiter protects one process only. Public live deployments need hosting-level limits (enforced by config; see the content policy).
- Expert content review is pending.
- Offline use of unvisited routes isn't supported.
- English only. Pasted text in other languages is handed to the model, which is told to report `unsupported_language`.
