// ── Pronunciation scoring types ──────────────────────────────────────
// Shared by the mock scorer, the Azure scorer, and the lesson UI.

export interface PhonemeScore {
  symbol: string; // IPA, e.g. "r", "θ"
  word: string; // example word from the phrase
  score: number; // 0..100 accuracy for this sound
}

export type Difficulty = "easy" | "moderate" | "hard";

export interface AttemptComparison {
  previous: number; // your previous attempt on this sound
  delta: number; // change vs. previous (+/-)
  direction: "up" | "down" | "same";
}

export interface PronunciationResult {
  overall: number; // 0..100 clarity of the attempt
  rhythm: number; // 0..100 stress & rhythm
  confidence: number; // 0..100 how sure Nina is of this score
  difficulty: Difficulty; // how hard this sound is for most learners
  phonemes: PhonemeScore[]; // sounds worth showing the learner
  strengths: string[]; // what went well, in plain words
  improvements: string[]; // what to work on, in plain words
  title: string; // Nina's headline
  message: string; // Nina's encouraging feedback
  tip: { sound: string; text: string }; // the one thing to work on next
  comparison?: AttemptComparison | null; // vs. your last attempt on this sound
  source: "azure" | "practice-estimate"; // real vs. estimated score
}
