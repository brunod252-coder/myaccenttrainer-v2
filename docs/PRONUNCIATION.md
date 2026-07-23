# Pronunciation Coaching (Nina)

This adds real microphone recording and pronunciation scoring to the lesson
flow. The learner records in the **Practice** step, and **Nina** gives a real,
sound-by-sound response in the **Feedback** step (replacing the old hardcoded
91%). It matches Nina's philosophy: encourage first, explain clearly, then
invite another attempt.

## What was added

- `lib/pronunciation/recorder.ts` — captures the microphone and encodes it to
  16 kHz mono WAV in the browser.
- `lib/pronunciation/mock-scorer.ts` — Nina's offline "practice estimate": a
  deterministic per-sound score + encouraging feedback. Used by default.
- `lib/pronunciation/azure-speech.ts` — real Azure Pronunciation Assessment.
  Ready to switch on (see below); not imported until you enable it.
- `lib/pronunciation/types.ts` — the shared `PronunciationResult` shape.
- `app/api/pronunciation/score/route.ts` — the scoring endpoint.
- `components/lesson/RecordingPracticeCard.tsx` — the Practice recorder UI.

## How it flows

1. **Practice** → `RecordingPracticeCard` records the learner saying the
   section's `referenceText`, and POSTs the audio to `/api/pronunciation/score`.
2. The route returns a `PronunciationResult`, which `LessonPlayer` holds in
   state and passes into…
3. **Feedback** → `FeedbackCard` shows the real score, a sound-by-sound
   breakdown, and Nina's "try this next" tip.

Lessons drive it through two new optional fields on a section (`lesson-types.ts`):

```ts
referenceText?: string; // the phrase to record, e.g. "The red car raced around the ring."
focus?: string;         // the focus sound, e.g. "r" — powers scoring + Nina's tip
```

It works with **no setup** — the practice estimate runs offline so the whole
flow is demoable immediately.

## Turn on real Azure scoring

1. Install the SDK (needs internet, so run it in your normal terminal):

   ```bash
   npm install microsoft-cognitiveservices-speech-sdk
   ```

2. Create a **Speech** resource in the [Azure portal](https://portal.azure.com)
   (the free F0 tier is fine) and add its key + region to `.env`:

   ```
   AZURE_SPEECH_KEY="your-key"
   AZURE_SPEECH_REGION="eastus"
   ```

3. In `app/api/pronunciation/score/route.ts`, uncomment the marked Azure block.

Restart `npm run dev` and the Practice step will score real speech. If a call
fails, it automatically falls back to the practice estimate, so the lesson never
breaks.

## Good next steps

- Save each attempt to Prisma (a `PronunciationAttempt` model) so Progress and
  streaks reflect real practice.
- Add `referenceText` + `focus` to more lessons as you expand the library.
- Let Nina speak her feedback aloud with text-to-speech for a fuller "coach"
  feel.
