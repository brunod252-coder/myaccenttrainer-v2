"use client";

type LessonAudioPlayerProps = {
  label: string;
  audioUrl?: string;
  speakText?: string;
  onEnded?: () => void;
};

export default function LessonAudioPlayer({
  label,
  audioUrl,
  speakText,
  onEnded,
}: LessonAudioPlayerProps) {
  function speak() {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !speakText
    ) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = 0.9;
    utterance.lang = "en-US";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="mt-6 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-green-700)]">
            {label}
          </p>

          <p className="mt-1 text-sm text-[var(--mat-muted)]">
            Hear the target clearly before you practice it yourself.
          </p>
        </div>

        <span className="mat-pill bg-white text-[var(--mat-green-800)]">
          Listening model
        </span>
      </div>

      {audioUrl ? (
        <div className="mt-5 rounded-xl border border-[var(--mat-border)] bg-white p-4">
          <audio controls onEnded={onEnded} className="w-full">
            <source src={audioUrl} />
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : speakText ? (
        <button
          type="button"
          onClick={speak}
          className="mat-button mat-button-secondary mt-5"
        >
          <span aria-hidden="true">🔊</span>
          Play with Nina&apos;s voice
        </button>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-[var(--mat-border-strong)] bg-white p-4 text-sm text-[var(--mat-muted)]">
          Nina&apos;s model audio will play here.
        </div>
      )}

      {speakText && (
        <blockquote className="mt-5 border-l-2 border-[var(--mat-green-600)] pl-4">
          <p className="font-display text-xl leading-8 text-[var(--mat-ink)]">
            “{speakText}”
          </p>
        </blockquote>
      )}
    </div>
  );
}
