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
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !speakText) return;
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = 0.9;
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-100 bg-[#f8fbfa] p-5">
      <p className="text-sm font-semibold text-[#52719f]">{label}</p>

      {audioUrl ? (
        <audio controls onEnded={onEnded} className="mt-4 w-full">
          <source src={audioUrl} />
          Your browser does not support the audio element.
        </audio>
      ) : speakText ? (
        <button
          type="button"
          onClick={speak}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#20ad68] transition hover:bg-[#e9f8f3]"
        >
          🔊 Play with Nina&apos;s voice
        </button>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-400">
          Nina&apos;s model audio will play here.
        </div>
      )}

      {speakText && <p className="mt-4 font-display text-lg text-[#52719f]">“{speakText}”</p>}
    </div>
  );
}
