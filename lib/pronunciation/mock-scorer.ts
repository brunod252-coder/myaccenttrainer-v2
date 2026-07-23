// ── Nina's practice-estimate scorer ──────────────────────────────────
// Deterministic, offline scoring used until Azure is enabled (see
// azure-speech.ts). Produces a believable per-sound breakdown plus
// feedback written in Nina's voice: encourage first, then one clear fix.

import type { PronunciationResult, PhonemeScore, Difficulty } from "./types";

// Per-focus sample sounds: [IPA, example word, base score]
const BANKS: Record<string, [string, string, number][]> = {
  r: [["r", "red", 64], ["r", "raced", 58], ["ɹ", "around", 71], ["ŋ", "ring", 83]],
  l: [["l", "light", 62], ["l", "really", 70], ["ɫ", "well", 66], ["iː", "clearly", 80]],
  th: [["θ", "think", 52], ["ð", "this", 64], ["s", "is", 86], ["ŋ", "-ng", 80]],
  v: [["v", "very", 60], ["v", "voice", 66], ["b", "curb", 74], ["aɪ", "drive", 82]],
  w: [["w", "would", 63], ["w", "water", 70], ["ɔː", "walk", 80], ["r", "reward", 68]],
  sh: [["ʃ", "she", 62], ["ʃ", "sheep", 58], ["s", "sells", 86], ["ɔː", "seashore", 76]],
  ee: [["iː", "seat", 62], ["ɪ", "sit", 70], ["iː", "eat", 64], ["s", "please", 84]],
  stress: [["ˈprɛ", "PREsent", 58], ["prɪˈ", "preSENT", 66], ["st", "-st-", 80], ["aɪ", "like", 82]],
  endings: [["st", "best", 58], ["t", "test", 64], ["sk", "ask", 62], ["ts", "results", 72]],
  linking: [["t", "turn it", 60], ["k", "pick it", 66], ["f", "off", 76], ["ʌp", "up", 80]],
};

export const FOCUS_TIPS: Record<string, string> = {
  r: "Curl your tongue back gently — don't let it touch the roof of your mouth. Let the sound glide, the way I do in “red.”",
  l: "Touch the tip of your tongue just behind your top teeth and let your voice flow through it.",
  th: "Let your tongue peek gently between your teeth and push soft air — feel it in “think.”",
  v: "Rest your top teeth lightly on your bottom lip and add your voice — keep it steady, not a “w.”",
  w: "Round your lips into a small circle and let the sound glide out smoothly.",
  sh: "Round your lips and pull your tongue back for a full “sh” — keep it long, don't let it slip into a plain “s.”",
  ee: "Stretch “ee” long and bright for “sheep”; keep it short and relaxed for “ship.” Feel the difference.",
  stress: "Stress the right syllable — it can change the meaning: PREsent (a gift) vs. preSENT (to show).",
  endings: "Don't drop the ends of words — release those final consonants clearly so every word lands.",
  linking: "Link the end of one word to the start of the next, so your speech flows instead of stopping.",
};

const FOCUS_NAMES: Record<string, string> = {
  r: "R", l: "L", th: "TH", v: "V", w: "W",
  sh: "SH", ee: "vowel", stress: "word-stress", endings: "final-sound", linking: "linking",
};

const FOCUS_DIFFICULTY: Record<string, Difficulty> = {
  r: "hard", th: "hard", endings: "hard",
  l: "moderate", v: "moderate", w: "moderate", sh: "moderate", stress: "moderate", linking: "moderate",
  ee: "easy",
};

function difficultyFor(focus: string): Difficulty {
  return FOCUS_DIFFICULTY[focus] ?? "moderate";
}

// Nina's confidence: high when the per-sound scores agree, lower when they
// scatter (a sign the attempt was uneven or the audio was unclear).
function confidenceFrom(phonemes: PhonemeScore[]): number {
  if (phonemes.length === 0) return 60;
  const mean = phonemes.reduce((a, p) => a + p.score, 0) / phonemes.length;
  const variance = phonemes.reduce((a, p) => a + (p.score - mean) ** 2, 0) / phonemes.length;
  const spread = Math.sqrt(variance); // 0..~30
  return Math.max(55, Math.min(98, Math.round(92 - spread)));
}

// Plain-language strengths & improvements from the per-sound breakdown.
function explain(phonemes: PhonemeScore[]): { strengths: string[]; improvements: string[] } {
  const strengths: string[] = [];
  const improvements: string[] = [];
  for (const p of phonemes) {
    if (p.score >= 80) strengths.push(`Your “${p.word}” was clear and confident.`);
    else if (p.score < 62) improvements.push(`“${p.word}” slipped a little — worth another pass.`);
  }
  if (strengths.length === 0) strengths.push("You committed to every sound — that's how clarity grows.");
  if (improvements.length === 0) improvements.push("Nothing stood out as unclear — keep this shape and build speed.");
  return { strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 3) };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Build Nina-voiced feedback for a given overall score + focus sound. */
export function buildNinaFeedback(
  overall: number,
  focus: string,
): Pick<PronunciationResult, "title" | "message" | "tip"> {
  const name = FOCUS_NAMES[focus] ?? "target";
  const tipText =
    FOCUS_TIPS[focus] ??
    "Slow down just a little and shape the sound fully, then say it again at your natural pace.";
  const tip = { sound: focus || "—", text: tipText };

  if (overall >= 85) {
    return {
      title: "Beautifully clear",
      message: `Wonderful — your ${name} sound is landing clearly and your rhythm feels natural. Keep that relaxed tongue and enjoy how confident that sounded.`,
      tip,
    };
  }
  if (overall >= 75) {
    return {
      title: "That's real progress",
      message: `Nice work — I can hear your ${name} sound improving. ${tipText} Then say it once more and feel the difference.`,
      tip,
    };
  }
  if (overall >= 60) {
    return {
      title: "Good effort — let's polish it",
      message: `You're close, and the shape of the sound is there. ${tipText} Take a breath, and let's try it again slowly together.`,
      tip,
    };
  }
  return {
    title: "Great try — we'll get there together",
    message: `Thank you for trying — that is exactly how we improve. ${tipText} There's no rush; say it again slowly with me, then build up speed.`,
    tip,
  };
}

/** Deterministic offline score for a phrase + focus sound. */
export function scorePronunciationMock(
  referenceText: string,
  focus: string,
): PronunciationResult {
  const seed = hashString(`${referenceText}|${focus}`);
  const jitter = (i: number) => ((seed >> (i * 3)) % 11) - 5; // -5..+5

  const bank = BANKS[focus] ?? deriveBank(referenceText, seed);
  const phonemes: PhonemeScore[] = bank.map(([symbol, word, base], i) => ({
    symbol,
    word,
    score: Math.max(35, Math.min(98, base + jitter(i))),
  }));

  const overall = Math.round(phonemes.reduce((a, p) => a + p.score, 0) / phonemes.length);
  const rhythm = 62 + (seed % 28); // 62..89
  const confidence = confidenceFrom(phonemes);
  const difficulty = difficultyFor(focus);
  const { strengths, improvements } = explain(phonemes);
  const { title, message, tip } = buildNinaFeedback(overall, focus);

  return {
    overall,
    rhythm,
    confidence,
    difficulty,
    phonemes,
    strengths,
    improvements,
    title,
    message,
    tip,
    comparison: null,
    source: "practice-estimate",
  };
}

/** Fallback when the focus sound has no dedicated bank. */
function deriveBank(referenceText: string, seed: number): [string, string, number][] {
  const words = referenceText
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  if (words.length === 0) return [["ə", "sound", 72]];
  return words.map((w, i) => [w[0]?.toLowerCase() ?? "ə", w, 58 + ((seed >> (i * 4)) % 34)]);
}
