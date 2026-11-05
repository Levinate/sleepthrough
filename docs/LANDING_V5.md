# SleepThrough — landing and quiz, 2026-11-05

## Result

The landing now has six main sections: a photographic hero, three illustrated steps, a working product preview, the 28-day path, a compact FAQ and a final call to action. The navy/lavender palette remains. In browser QA the visible landing copy decreased from approximately 836 to 403 words (closed FAQ; counts vary slightly with viewport/navigation visibility).

The hook is **Wide awake. Again?** It is followed by one explanation and one primary action. The page retains the distinction between possible waking factors and a medical diagnosis. No testimonials, customer counts, outcome statistics or clinical endorsements were invented.

The three preview controls switch between a night reset, learning path and illustrative weekly chart without navigating away. Preview screens and numbers are explicitly illustrative. Night reset links lead to the working three-step flow; product previews lead to the existing explicit demo.

## Quiz

- 12 questions, one per screen, with shorter wording and answer labels.
- A light neutral canvas, one progress bar, four large options and one Continue button.
- Back preserves the selected answer; focus follows the current question or selected option.
- No side panel, letter badges, repeated stages or marketing footer in the question flow.
- Question meanings, answer indices and existing profile rules are retained. Results still explain possible factors and the answers behind them; no diagnostic claim was added.

References consulted: [RISE](https://www.risescience.com/), [Sleep Reset](https://www.thesleepreset.com/), [Stellar Sleep quiz](https://quiz.stellarsleep.com/quiz-p54/). Their relevant patterns are a clear next action, progressive disclosure and a focused assessment. Our copy, imagery and implementation are original; their clinical/statistical claims are not reused.

## Images and motion

Project assets:

- `dist/assets/night-v5.webp` — optimized derivative of the existing project image `night-waking.webp`; the original remains.
- `dist/assets/morning-v5.webp` — new illustrative lifestyle image generated with the built-in **ImageGen** tool, then resized/compressed for delivery. It does not depict a real customer or provide evidence of an outcome.
- Three code-native scenes: waking factors, a quiet bedroom and a notebook. These are responsive CSS illustrations, not raster placeholders.

Final ImageGen prompt:

> Use case: photorealistic-natural. Asset type: editorial lifestyle photograph for the SleepThrough landing page, a gentle sleep learning app for adults after 40. Scene: a real, beautiful bedroom at dawn, quiet natural window light, oatmeal linen bedding, dark indigo headboard and a small lavender accent. Subject: a natural-looking woman around 48 with shoulder-length slightly silver brown hair, wearing an ivory linen shirt, sitting beside the window writing a few words in an open notebook, a ceramic mug nearby. Thoughtful, grounded, quietly hopeful, no exaggerated smile, no luxury spa cliches. Medium wide horizontal composition with her on the right and warm daylight and soft bed textures on the left. Natural skin texture, soft fine-grain editorial photography, restrained navy, cream, lavender and peach palette. No text, no logos, no charts, no UI, no clocks, no watermark.

Motion includes a gentle hero entrance, floating thought labels, section reveals, a breathing illustration and chart transitions. `prefers-reduced-motion` disables the new animation/transition effects. No motion library, tracking script or autoplay video was added.

Both photos are served from the site's own domain and total about 24 KB. The below-fold image uses lazy loading. The Railway Function embeds assets in a Brotli-compressed table and validates that the complete source remains below 96 KB.

## Verification

- Existing route, lesson, profile, auth-isolation and HTTP checks pass.
- Function generator verifies all embedded routes, image bytes, HEAD, 404 and 405 responses.
- Browser: desktop landing, working preview switches, complete 12-question journey to a profile, preserved answer on Back, and mobile layouts at 390 and 320 px.
- Both self-hosted images loaded; no horizontal overflow observed in the checked layouts.
- Landing/quiz source changes do not modify the Android APK, its local storage, or the database schema.

Source: `dist/landing.js`, `dist/landing.css`; the app router delegates to the new landing. Publishing uses the existing SleepThrough Railway Function and domain.
