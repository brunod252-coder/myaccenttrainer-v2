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
    <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f8f3] text-2xl">
          🎧
        </div>

        <div className="flex-1">
          <h2 className="font-display text-xl text-[#20ad68]">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{description}</p>

          {isListenSection && (
            <LessonAudioPlayer
              label="Native Speaker Audio"
              audioUrl={audioUrl}
              speakText={speakText}
              onEnded={onAudioEnded}
            />
          )}

          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357]"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
