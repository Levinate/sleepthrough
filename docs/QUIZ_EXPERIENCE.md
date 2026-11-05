# Visual quiz and Sleep Score

5 November 2026. Prepared locally; publication requires a separate deployment.

## Interaction

- Twelve questions retain their original answer order and profile rules.
- Selecting an answer shows brief feedback, then opens the next question automatically after 220 ms. There is no Continue/confirmation button.
- Selection is locked during the transition to prevent accidental double taps. Back, Exit and route changes cancel pending transitions. Earlier answers remain editable.
- Six original SVG illustrations accompany the questions. Calendar dots, time cards, duration bars, thought bubbles and rhythm previews make answer choices visual.
- The final answer opens the result. An incomplete quiz does not display a calculated result.

## Score definition

The displayed **Sleep Score** is a simple, unvalidated self-report index. It is not a wearable measurement, diagnosis, validated screening instrument or clinical outcome measure.

Four answers contribute equally: waking frequency (question 3), estimated time awake (question 5), a busy mind before bed (question 7), routine consistency (question 9). The four ordered answers contribute 25, 17, 8 or 0 points. The sum ranges from 0 to 100. Higher means fewer reported difficulties on these four items. The result includes the calculation and the four components in an expandable explanation.

## Improvement visual

The user chooses a personal target of +5, +10 or +15 points, capped at 100. At 100 the interface suggests maintaining the routine. The curve is explicitly labelled as an illustrative goal path, not a forecast or promised increase from using SleepThrough. No invented clinical evidence or guaranteed treatment effect is presented.

The score appears only in quiz results. Awakening frequency remains the main dashboard metric; the hero still shows a waking profile.

## Verification

`check-flows.cjs`: automatic advance, double-tap guard, Back/Exit cancellation, invalid answer rejection, four profile outcomes, score bounds, transparent calculation, user-selected target and cap at 100. Existing lesson, diary and account tests remain in place. HTTP checks cover the new scripts, stylesheet and illustration asset; the Railway packaging helper includes all six SVGs.
