# Paper2People

**Understand the research. Follow the evidence.**

An interactive research-literacy app. Investigate fictional cancer-related posts (**CancerCase**), place evidence on a board, give a reasoned verdict, and decode research abstracts to see what they support and what they don't prove.

Paper2People is educational. It doesn't diagnose, estimate personal risk, recommend treatment or set screening schedules. **Status:** educational prototype; expert content review pending.

## Requirements

- Node.js **24** (see `.nvmrc`; `>=20.9` is the floor from Next.js). Developed with Node 24.21 and npm 11.19.
- npm (the lockfile is `package-lock.json`).

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
# or a production build
npm run build && npm start
```

No credentials are needed. Without an API key, everything works except analysis of your own pasted text: all five cases, the guided demo, scoring, progress, glossary, methodology, and the three prewritten decoder samples.

## Optional live analysis

1. `cp .env.example .env.local`
2. Set `ENABLE_LIVE_ANALYSIS=true` and `ANTHROPIC_API_KEY=…` (server-only; never use a `NEXT_PUBLIC_` prefix).
3. Optionally set `ANTHROPIC_MODEL` (default `claude-opus-5-5`) and `ANTHROPIC_EFFORT` (default `medium`).
4. Restart the server. `/decode` will say that text is sent to the configured provider.

In **production**, live mode stays off unless you either put platform-level rate limiting in front of `/api/analyze` and set `RATE_LIMIT_BACKEND=hosting`, or run a private single instance and set `LIVE_ANALYSIS_ALLOW_IN_MEMORY_LIMITER=true`. The built-in limiter is per-process memory, not a distributed limit. See `docs/content-policy.md`.

`GET /api/capabilities` reports availability only (`liveAnalysis` and a reason code), never the model or key.

## Checks

```bash
npm run typecheck
npm run lint
npm test            # Vitest: logic, content integrity, API handler, components
npm run test:e2e    # builds, then Playwright (desktop + Pixel 7), axe checks; no paid API calls
npm run check       # typecheck + lint + unit tests + build
SCREENSHOTS=1 npx playwright test screenshots   # refresh docs/screenshots (needs a build)
```

First Playwright run: `npx playwright install chromium`.

## Project map

```
src/app/                 routes (/, /cases, /cases/[slug], /cases/[slug]/verdict, /demo, /decode, /glossary, /methodology)
src/app/api/             analyze (POST) and capabilities (GET)
src/proxy.ts             real 404s for unknown case slugs
src/content/             cases (versioned fixtures), samples, glossary, sources
src/lib/                 schemas, scoring, risk math, investigation reducer, progress storage/store, rate limit
src/lib/analysis/        segmentation, prompt, provider, validation, request handler, plain-text export
src/components/          layout, investigation, evidence, decoder, glossary, visualizations, ui
src/styles/tokens.css    design tokens
tests/unit, tests/e2e    Vitest and Playwright
docs/                    product spec, design system, content policy, build checklist, demo script
```

## Docs

- [Product spec](docs/product-spec.md)
- [Design system](docs/design-system.md)
- [Content policy](docs/content-policy.md): provenance, sources, AI boundaries, review status
- [Build checklist](docs/build-checklist.md): what's built and verified
- [Demo script](docs/demo-script.md): the one-minute presentation route
