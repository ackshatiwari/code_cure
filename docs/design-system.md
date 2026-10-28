# Design system

An editorial research workspace: a science publication, an annotated notebook and a focused evidence workspace. Calm, legible, credible, and never pretending to be an official medical institution.

Tokens live in `src/styles/tokens.css` and are exposed to Tailwind in `src/app/globals.css` (`@theme inline`).

## Color tokens and measured contrast

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F6F4EE` | Page background |
| `surface` | `#FFFEFA` | Reading surfaces, controls |
| `surface-muted` | `#EEEBE3` | Secondary areas, bar tracks |
| `ink` | `#182D2A` | Main text |
| `ink-muted` | `#52615C` | Supporting text |
| `primary` / `primary-hover` | `#1F5C50` / `#174A40` | Primary actions, selection, "supports" |
| `primary-soft` | `#E4EEE8` | Selected surfaces, supported-conclusion panel |
| `caution` / `caution-soft` | `#855419` / `#FBF0DB` | Limits, missing context, "open question" |
| `critical` / `critical-soft` | `#963E32` / `#F8E8E2` | Invalid input, errors, "challenges" |
| `border` (`rule`) | `#D8D8CD` | Decorative rules only |
| `control-border` (`control`) | `#737F79` | Visible boundary of form controls and secondary buttons |

Contrast ratios (computed with the WCAG relative-luminance formula):

| Foreground | Background | Ratio |
|---|---|---|
| ink | canvas / surface | 13.19 / 14.37 |
| ink-muted | canvas / surface / surface-muted | 5.92 / 6.46 / 5.47 |
| primary | surface / primary-soft | 7.69 / 6.54 |
| surface (button label) | primary | 7.69 |
| caution | caution-soft / surface | 5.67 / 6.35 |
| critical | critical-soft / surface | 5.82 / 6.86 |
| control-border (non-text) | surface / canvas | 4.13 / 3.79 |
| focus ring (primary) | canvas | 7.06 |
| decorative border | canvas | 1.31: decorative only, never a control's sole boundary |
| disabled button label | `#9AABA5` | 2.38: inactive controls are exempt under WCAG 1.4.3 |

Relations and verdicts are never shown by color alone. Each relation has an icon and a text label (`CirclePlus` Supports part of the claim, `CircleMinus` Challenges the claim, `CircleDashed` Leaves a question open).

## Typography

- Headings: Newsreader (variable, self-hosted, OFL), falling back to Georgia.
- Body and interface: Source Sans 3 (variable, self-hosted, OFL), falling back to the system UI stack.
- Licenses: `src/app/fonts/LICENSE-*.txt`. Loaded with `next/font/local` using `display: swap`, so a font failure leaves the fallback in place.
- Scale: home heading 34–56 px; case heading 28–38 px; body 17 px with line-height 1.62; controls 16 px; metadata 14 px (13 px only for uppercase eyebrows and monospace case IDs).
- Reading column: `.reading` = 68ch. Tabular figures via `.tabular` where numbers align.

## Layout and rhythm

- Container 1240 px; gutters 16 / 24 / 32 px (phone / tablet / desktop).
- Spacing follows Tailwind's 4 px scale (4, 8, 12, 16, 24, 32, 48, 64, 80).
- Radii: controls 8 px, panels 12 px. Shadows only for overlays (`--shadow-overlay`).
- Buttons: `min-h-12` (48 px) primary and secondary, `min-h-11` (44 px) small. Main touch targets meet a 44 × 44 px product goal; WCAG 2.2's 24 × 24 minimum is a separate, lower bar.

## Signature details

- **Mark** (`components/layout/Mark.tsx`, `app/icon.svg`): a page edge with a folded corner and an annotation bracket.
- **Case identifiers:** `CASE 01 / THE MISSING DENOMINATOR` in monospace.
- **Bracket** (`.bracket`): ties an excerpt or corrected headline to its source.
- **Highlighted fragment** (`.fragment-active`): when a clue is selected, the claim words it relates to are underlined.
- **Margin note** (`.margin-note`): a short contextual explanation with a 2 px primary rule.
- **Amber annotation** (`.annotation-caution`): the limits panel and missing-context notes.
- **"The headline says / The evidence supports"**: side-by-side comparison on results pages.
- **Board connectors:** the relation groups hang off a single rule from the claim block; phones show the same grouped lists.

Excluded on purpose: crime-scene or detective theming, string boards, fake handwriting, gradients, glass, glowing blobs, "AI-powered" badges, stock imagery, testimonials, usage statistics.

## Components

| Component | File | States |
|---|---|---|
| Button classes | `components/ui/styles.ts` | hover, active (pressed), focus-visible, disabled, aria-disabled |
| Sheet (Radix Dialog) | `components/ui/Sheet.tsx` | Side sheet ≥768 px, bottom sheet on phones; focus trap; Escape; focus returns to the trigger; closes when its route is hidden |
| Term popover (Radix Popover) | `components/glossary/TermButton.tsx` | Click, tap, Enter or Space; Escape closes and returns focus |
| Provenance tag | `components/evidence/ProvenanceTag.tsx` | fictional (amber), real (green), AI (neutral) |
| Limits panel | `components/evidence/LimitsPanel.tsx` | Shared by results and decoder |
| Study details | `components/evidence/StudyDetails.tsx` | Reported / Not reported / Not applicable, kept distinct |
| Source list and drawer | `components/evidence/SourceList.tsx`, `SourceDrawer.tsx` | Role, date on source, check date, scope, real link |
| Claim post | `components/investigation/ClaimPost.tsx` | Fragment highlight; label beside the content |
| Clue card | `components/investigation/ClueCard.tsx` | unread, read, placed, highlighted, locked |
| Evidence board | `components/investigation/EvidenceBoard.tsx` | empty, selecting, placed, locked |
| Verdict form | `components/investigation/VerdictForm.tsx` | incomplete (visible blockers), ready, frozen |
| Risk in context | `components/visualizations/RiskInContext.tsx` | Relative / absolute view, common zero baseline, natural-frequency grids with text alternatives |
| The earlier clock | `components/visualizations/EarlierClock.tsx` | Hidden / revealed path, question with feedback, screen-reader text |
| Decoder workspace and output | `components/decoder/*` | idle, sample-loaded, submitting (skeleton + Cancel), success, stale, insufficient information, invalid input, live unavailable, rate-limited, timeout, cancelled, invalid response |

## Motion

140–200 ms transitions (`--duration-fast`, `--duration-base`) for state changes only. No entrances, carousels or confetti. `prefers-reduced-motion` collapses durations to zero and stops the skeleton shimmer and spinner.

## Focus management

- A skip link is the first tab stop.
- After client navigation, `RouteFocus` focuses the visible page's `h1`.
- Phone task switching focuses the new task's heading.
- Decoder results and errors receive focus when they appear.
- Source anchors focus the highlighted sentence, and "Back to the explanation" returns focus to the anchor.
- Hidden routes are kept by React Activity, so IDs are generated with `useId` to avoid duplicate-ID collisions.
