// @ts-nocheck
// Azure Pronunciation Assessment provider. The SDK is installed and this
// module is loaded dynamically by the pronunciation score route when a real
// recording is submitted and Azure Speech credentials are configured.
//
// @ts-nocheck remains temporarily until the provider is normalized against
// the installed SDK's TypeScript surface.

// ── Azure Pronunciation Assessment (server-only) ─────────────────────

import type { PronunciationResult, PhonemeScore } from "./types";
import { buildNinaFeedback } from "./mock-scorer";

/**
 * Assess a WAV recording against reference text.
 * @param wav 16 kHz mono 16-bit PCM WAV (from recorder.ts)
 * @param referenceText the phrase the learner was asked to say
 * @param focus the lesson's focus sound (e.g. "r"), for Nina's tip
 */
export async function assessWithAzure(
  wav: Buffer,
  referenceText: string,
  focus = "",
): Promise<PronunciationResult> {
  // Imported dynamically so this file has no hard dependency until enabled.
  const sdk = await import("microsoft-cognitiveservices-speech-sdk");

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY as string,
    process.env.AZURE_SPEECH_REGION as string,
  );
  speechConfig.speechRecognitionLanguage = "en-US";

  const format = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
  const pushStream = sdk.AudioInputStream.createPushStream(format);
  const pcm = wav.subarray(44); // skip WAV header, push raw PCM
  pushStream.write(pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength) as ArrayBuffer);
  pushStream.close();

  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

  const paConfig = new sdk.PronunciationAssessmentConfig(
    referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true,
  );
  paConfig.enableProsodyAssessment = true;
  try {
    (paConfig as unknown as { phonemeAlphabet: string }).phonemeAlphabet = "IPA";
  } catch {
    /* older SDKs fall back to SAPI phonemes; still scores fine */
  }

  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  paConfig.applyTo(recognizer);

  const raw = await new Promise<{ pa: import("microsoft-cognitiveservices-speech-sdk").PronunciationAssessmentResult; json: string }>(
    (resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          try {
            const json = result.properties.getProperty(
              sdk.PropertyId.SpeechServiceResponse_JsonResult,
            );

            const reasonName =
              sdk.ResultReason[result.reason] ?? String(result.reason);

            if (result.reason === sdk.ResultReason.Canceled) {
              const cancellation =
                sdk.CancellationDetails.fromResult(result);

              reject(
                new Error(
                  "Azure recognition canceled: " +
                    (cancellation.errorDetails || "unknown reason"),
                ),
              );
              return;
            }

            if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
              reject(
                new Error(
                  "Azure recognition returned " + reasonName,
                ),
              );
              return;
            }

            if (!json) {
              reject(
                new Error(
                  "Azure recognized speech but returned no detailed JSON result",
                ),
              );
              return;
            }

            const pa =
              sdk.PronunciationAssessmentResult.fromResult(result);

            resolve({ pa, json });
          } catch (e) {
            reject(e);
          } finally {
            recognizer.close();
          }
        },
        (err) => {
          recognizer.close();
          reject(err);
        },
      );
    },
  );

  const overall = Math.round(raw.pa.pronunciationScore ?? raw.pa.accuracyScore ?? 0);
  const rhythm = Math.round(raw.pa.prosodyScore ?? raw.pa.fluencyScore ?? 0);

  const phonemes: PhonemeScore[] = [];
  try {
    const parsed = JSON.parse(raw.json || "{}");
    const words = parsed?.NBest?.[0]?.Words ?? [];
    for (const w of words) {
      for (const ph of w.Phonemes ?? []) {
        phonemes.push({
          symbol: ph.Phoneme,
          word: w.Word,
          score: Math.round(ph.PronunciationAssessment?.AccuracyScore ?? 0),
        });
      }
    }
  } catch {
    /* keep whatever we have */
  }

  const byWorst = new Map<string, PhonemeScore>();
  for (const p of phonemes) {
    const cur = byWorst.get(p.symbol);
    if (!cur || p.score < cur.score) byWorst.set(p.symbol, p);
  }
  const display = [...byWorst.values()].sort((a, b) => a.score - b.score).slice(0, 5);

  const { title, message, tip } = buildNinaFeedback(overall, focus);
  return {
    overall,
    rhythm,
    phonemes: display.length ? display : phonemes.slice(0, 5),
    title,
    message,
    tip,
    source: "azure",
  };
}
