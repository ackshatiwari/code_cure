# One-minute demo script

A rehearsed presentation of Case 01, "The missing denominator". These timings are a target for a practiced presenter, not a promise for first-time users. Nothing is automated: every step is a real action, and the score is computed from the choices made.

## Before you start

1. `npm run build && npm start` (or open the deployed site). No API key is needed.
2. Open **`/demo`** in a fresh window, ideally at 1280–1440 px width.
3. If it was used before, choose **Restart demo → Restart demo** in the guide bar. This resets only the demo attempt; regular Case 01 progress is untouched.
4. External source links are optional. Nothing in the route needs the network beyond the app itself.

## The route

| Time | Do this | Say something like |
|---|---|---|
| 0–7 s | Point at the post in **The claim**. | "A post says a 25% lower cancer rate means 25 fewer cases for every 100 people." |
| 7–20 s | In **Evidence**, select **Read this clue** on Clue 2, *Numbers: what happened in each group*. | "Here are the actual counts: 20 versus 15, out of 1,000 each, over five years." |
| 20–30 s | In **Risk in context**, choose **Relative change**, then **Absolute change**. | "Same people, two framings: 25% relative, but 0.5 percentage points absolute, 5 per 1,000." |
| 30–42 s | Read Clues 1 and 3. On the **Evidence board**, select each clue and choose: Clue 1 → *Supports part of the claim*; Clue 2 → *Challenges the claim*; Clue 3 → *Leaves a question open*. Select **Study details and reported limits**, glance at it, press Escape. | "The 25% is real, the counts contradict the arithmetic, and the missing intervals and harms leave a question open." |
| 42–52 s | In **Your verdict**: *Misleading*; *A relative percentage was mistaken for an absolute percentage-point difference*; *In this fictional example, the observed outcome fell from 20 to 15 per 1,000 over five years.* Select **Submit verdict**. | "A true number, framed to mean something it doesn't." |
| 52–60 s | On the results page, show **What the evidence does support / What it does not establish**, then select **Open this abstract in the decoder**. | "And the same abstract in the decoder: findings, limits, and every point linked to its sentence." |

The guide bar ticks each step off only when you actually do it.

## Fallbacks

- **Short on time:** skip Clues 1 and 3 and go straight from the toggle to the board; the submit helper text lists anything left.
- **Sample-only decoder:** the decoder link opens `/decode?sample=fictional-rct-relative-risk`, a prewritten example, so no API key or network call is involved. Select an `S2` anchor to show source highlighting.
- **Something looks stale:** use **Restart demo** in the guide bar, or reload `/demo`.
- **Phone or narrow projector:** the same steps work through the Claim → Evidence → Board → Verdict task bar at the top of the case.
