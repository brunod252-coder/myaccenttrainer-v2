"use client";

type LessonAudioPlayerProps = {
  label: string;
  audioUrl?: string;
  onEnded?: () => void;
};

export default function LessonAudioPlayer({
  label,
  audioUrl,
  onEnded,
}: LessonAudioPlayerProps) {
  return (
    <div className="mt-6 rounded border bg-[#f8fbfa] p-5">
      <p className="text-sm font-semibold text-[#52719f]">{label}</p>

      {audioUrl ? (
        <audio controls onEnded={onEnded} className="mt-4 w-full" >
          <source src={audioUrl} />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <div className="mt-4 rounded bg-white p-4 text-sm text-gray-500">
          Audio file will be connected here.
        </div>
      )}
    </div>
  );
}