"use client";

import { useState } from "react";

import type { LessonAudioSet } from "@/lib/lessons";

type LessonAudioPlayerProps = {
  label: string;
  audio?: LessonAudioSet;
  onEnded?: () => void;
};

const speeds = [
  { key: "normal", label: "Normal" },
  { key: "slow", label: "Slow" },
  { key: "slower", label: "Slower" },
] as const;

export default function LessonAudioPlayer({
  label,
  audio,
  onEnded,
}: LessonAudioPlayerProps) {
  const [selectedSpeed, setSelectedSpeed] =
    useState<keyof LessonAudioSet>("normal");

  const audioUrl = audio?.[selectedSpeed];

  return (
    <div className="mt-6 rounded border bg-[#f8fbfa] p-5">
      <p className="text-sm font-semibold text-[#52719f]">{label}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {speeds.map((speed) => (
          <button
            key={speed.key}
            type="button"
            onClick={() => setSelectedSpeed(speed.key)}
            className={[
              "rounded border px-3 py-2 text-xs font-semibold transition",
              selectedSpeed === speed.key
                ? "border-[#20ad68] bg-[#20ad68] text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#20ad68]",
            ].join(" ")}
          >
            {speed.label}
          </button>
        ))}
      </div>

      {audioUrl ? (
        <audio controls onEnded={onEnded} className="mt-4 w-full">
          <source src={audioUrl} />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <div className="mt-4 rounded bg-white p-4 text-sm text-gray-500">
          {selectedSpeed} audio will be connected here.
        </div>
      )}
    </div>
  );
}
