# UI update — 6 November 2026

## Changes

- Main hero keeps its phone composition and now addresses adults 40–60 using the supplied headline and offer. Mobile hero is approximately one screen including navigation.
- Body copy is 17px, secondary copy at least 15px, eyebrows at least 12px, visible phone-preview copy at least 11px. Interactive controls are at least 44px.
- All authored CSS colours reference the requested brand tokens in `dist/style.css`. Light/dark surfaces have explicit readable foregrounds; purple is reserved for button fills and lavender for text/icons. Amber identifies night support.
- `dist/ui-system.css` supplies shared card padding, text spacing, form rhythm and responsive layouts. Dashboard practice, journal and account cards have consistent gaps.
- The selected plan has a lavender border, tinted background, selection mark and `aria-pressed` state. All three plans remain selectable.
- Removed Capstone preview and the redundant plans badge. Successful sync status is hidden; failed-save messages and retry controls remain visible.
- Night support has five named stages, a visible step indicator, a clear personal action, thought parking, optional breathing and an unhurried return to rest. Wake logging and morning notes are preserved.
- Local-plan access to lessons survives reload. Account authentication and cloud-data isolation remain unchanged.

## Validation

Existing quiz, lessons, auth, HTTP and 11 payment/contact tests pass, plus a reload regression check for the local learning path. Browser checks cover desktop and 390px mobile layouts, the complete 21-question quiz, plan selection, an interactive sorting exercise, all five night steps and a morning check-in with the parked thought.

Only the web repository changes in this update. The Android APK remains the separately versioned 0.5.0 pilot.
