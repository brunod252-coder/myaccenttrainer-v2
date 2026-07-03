import LessonAudioPlayer from "./LessonAudioPlayer";

type AudioPracticeCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  audioUrl?: string;
  onPrimaryAction?: () => void;
  onAudioEnded?: () => void;
};
export default function AudioPracticeCard({
  title,
  description,
  buttonLabel,
  audioUrl,
  onPrimaryAction,
  onAudioEnded,
}: AudioPracticeCardProps) {

  const isListenSection = title.toLowerCase() === "listen";

  return (
    <section className="rounded border bg-white p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f8f3] text-2xl">
          🎧
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#20ad68]">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            {description}
          </p>

          {isListenSection && (
           <LessonAudioPlayer
  label="Native Speaker Audio"
  audioUrl={audioUrl}
  onEnded={onAudioEnded}
/>
          )}
<button
  type="button"
  onClick={onPrimaryAction}
  className="mt-6 rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357]"
>
  {buttonLabel}
</button>
        </div>
      </div>
    </section>
  );
}