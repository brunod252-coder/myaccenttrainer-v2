// ── Audio quality & noise check ──────────────────────────────────────
// Pure analysis of a decoded mono waveform. Runs in the browser right
// after a recording so Nina can gently flag a too-quiet, too-loud, noisy,
// or too-short take and offer a re-record — before scoring wastes the try.

export type QualityLevel = "good" | "too-quiet" | "too-loud" | "noisy" | "too-short";

export interface AudioQuality {
  level: QualityLevel;
  ok: boolean; // true when the take is good enough to score confidently
  rms: number; // 0..1 average loudness
  peak: number; // 0..1 loudest sample
  speechRatio: number; // fraction of the clip with speech-level energy
  durationSec: number;
  title: string;
  suggestion: string;
}

// Analyze one channel of PCM samples (-1..1) at a given sample rate.
export function analyzeSamples(samples: Float32Array, sampleRate: number): AudioQuality {
  const n = samples.length;
  const durationSec = n / sampleRate;

  let sumSq = 0;
  let peak = 0;
  // Frame-based energy to estimate how much of the clip is actual speech.
  const frame = Math.max(1, Math.floor(sampleRate * 0.02)); // 20ms frames
  let speechFrames = 0;
  let totalFrames = 0;
  let frameSum = 0;
  let idx = 0;

  for (let i = 0; i < n; i++) {
    const s = samples[i];
    const abs = Math.abs(s);
    sumSq += s * s;
    if (abs > peak) peak = abs;
    frameSum += s * s;
    idx++;
    if (idx >= frame) {
      const frameRms = Math.sqrt(frameSum / idx);
      if (frameRms > 0.02) speechFrames++;
      totalFrames++;
      frameSum = 0;
      idx = 0;
    }
  }

  const rms = Math.sqrt(sumSq / Math.max(1, n));
  const speechRatio = totalFrames > 0 ? speechFrames / totalFrames : 0;

  // Decisions (thresholds tuned to be forgiving).
  if (durationSec < 0.6) {
    return q("too-short", false, rms, peak, speechRatio, durationSec,
      "That was very short", "I barely caught that — hold the button a touch longer and say the whole phrase.");
  }
  if (rms < 0.012) {
    return q("too-quiet", false, rms, peak, speechRatio, durationSec,
      "A little too quiet", "I could hardly hear you. Move closer to the mic, or speak up a little, and try once more.");
  }
  if (peak > 0.98 && rms > 0.35) {
    return q("too-loud", false, rms, peak, speechRatio, durationSec,
      "A bit too loud", "That clipped the mic. Ease back slightly or lower your voice, and give it another go.");
  }
  // Lots of steady low-level energy but little clear speech = background noise.
  if (speechRatio < 0.25 && rms > 0.03) {
    return q("noisy", false, rms, peak, speechRatio, durationSec,
      "Some background noise", "There's a bit of background sound. A quieter spot will help me hear you clearly — want to try again?");
  }

  return q("good", true, rms, peak, speechRatio, durationSec,
    "Clear recording", "Nice and clear — perfect for scoring.");
}

function q(
  level: QualityLevel, ok: boolean, rms: number, peak: number,
  speechRatio: number, durationSec: number, title: string, suggestion: string,
): AudioQuality {
  return { level, ok, rms, peak, speechRatio, durationSec, title, suggestion };
}

// Decode a recorded Blob to mono samples and analyze it (browser only).
export async function analyzeBlob(blob: Blob): Promise<AudioQuality | null> {
  try {
    const AudioCtx =
      (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new AudioCtx();
    const buf = await blob.arrayBuffer();
    const audio = await ctx.decodeAudioData(buf);
    const ch = audio.getChannelData(0);
    const result = analyzeSamples(ch, audio.sampleRate);
    ctx.close();
    return result;
  } catch {
    return null; // decoding unsupported — skip the check gracefully
  }
}
