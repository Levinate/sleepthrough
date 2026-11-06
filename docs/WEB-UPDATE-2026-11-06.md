# Web update — 6 November 2026

Scope: website only, published from `Levinate/sleepthrough` to the existing Railway web service. Android and the product video are separate deliverables.

## Interface changes

- Removed the landing age eyebrow and the two-line closing caption in the recognition section. The hero artwork and main headline remain intact.
- Removed the generic account/progress footer. Sarah’s example-data label remains visible in demo mode.
- Changed course week labels, node captions and the next-step flag to sentence case. Removed “Your own pace”.
- Fixed path spacing so the next-step flag cannot overlap the previous lesson title.
- Added daily visit streaks with seven calendar-day indicators. Visits count once per local calendar day on app screens; marketing and quiz screens do not count. Past lesson completion does not create historical visits. Missing a day never removes lessons or saved work.
- On mobile, app navigation is fixed to the bottom, with all five destinations visible. Week tabs stick to the top while scrolling the course page. At very narrow widths the week tabs scroll horizontally inside the pinned bar.
- Added course-path and interactive-practice explanations to the four-step guided tour. Existing completed tours stay completed.

## Quiz and result

- Four illustrated educational pauses appear after questions 5, 10, 15 and 20. Continuing a fact does not advance or skip the following question. Dismissals survive reloads; retaking the quiz resets them.
- Removed the duplicate result badge and duplicate baseline frequency. Current frequency and the editable night-28 target share a compact row.
- Made “Explore my 28-day plan” a prominent sticky action, leading to the existing email → plans → checkout flow.
- Moved goal selection to the end. Answer evidence remains available under “Why we think so”. The estimate, personal-goal and non-diagnosis explanations remain available.

### Fact sources

1. [CDC / NCHS Data Brief 559](https://www.cdc.gov/nchs/products/databriefs/db559.htm): 22.3% of U.S. adults aged 50–64 reported trouble staying asleep most days or every day in the 2024 NHIS.
2. [NIH / NHLBI — Sleep phases and stages](https://www.nhlbi.nih.gov/health/sleep/stages-of-sleep): cycles of 80–100 minutes and brief awakenings between cycles.
3. [NIH / NHLBI — Your sleep/wake cycle](https://www.nhlbi.nih.gov/health/sleep/sleep-wake-cycle): environmental light and darkness as body-clock cues.
4. [NIH / NHLBI — Insomnia treatment](https://www.nhlbi.nih.gov/health/insomnia/treatment): CBT-I components; the card distinguishes self-guided learning from full clinical treatment.

## Implementation and validation

`web-src/engagement.mjs` owns fact scheduling and calendar-based attendance. Both fields pass through the existing MVP payload normalizer and account isolation. No database schema change is required. The production JavaScript bundle is generated with `node build-web-mvp.mjs`; `dist/ui-system.css` contains the responsive layout rules.

Validation: flow, auth, HTTP and payment regression checks; dedicated engagement tests for fact positions/dismissals/retakes, local-day deduplication, gaps, year boundaries and payload reloads. Browser checks cover the full 21-question flow, all four facts, reload, the plan CTA, streak persistence, tour hints, mobile overflow and pinned panels.
