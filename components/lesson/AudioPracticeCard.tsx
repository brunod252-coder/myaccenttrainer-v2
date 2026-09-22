import LessonAudioPlayer from "./LessonAudioPlayer";

type AudioPracticeCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  audioUrl?: string;
  speakText?: string;
  onPrimaryAction?: () => void;
  onAudioEnded?: () => void;
};

export default function AudioPracticeCard({
  title,
  description,
  buttonLabel,
  audioUrl,
  speakText,
  onPrimaryAction,
  onAudioEnded,
}: AudioPracticeCardProps) {
  const isListenSection = title.toLowerCase() === "listen";

  return (
    <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14a8 8 0 0 1 16 0" />
              <path d="M4 14v4a2 2 0 0 0 2 2h2v-7H4Z" />
              <path d="M20 14v4a2 2 0 0 1-2 2h-2v-7h4Z" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <p className="mat-eyebrow">
              Listen first
            </p>

            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--mat-muted)]">
              {description}
            </p>
          </div>
        </div>

        {isListenSection && (
          <LessonAudioPlayer
            label="Nina's model"
            audioUrl={audioUrl}
            speakText={speakText}
            onEnded={onAudioEnded}
          />
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--mat-border)] pt-5">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="mat-button mat-button-primary"
          >
            {buttonLabel}
          </button>

          <p className="text-xs leading-5 text-[var(--mat-muted)]">
            Listen closely to the model, then continue when you are ready.
          </p>
        </div>
      </div>
    </section>
  );
}
