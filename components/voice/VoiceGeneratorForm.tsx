"use client";

import { useState } from "react";

type Speed = "normal" | "slow" | "slower";

const speeds: Speed[] = ["normal", "slow", "slower"];

export default function VoiceGeneratorForm() {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Record<Speed, string>>({
    normal: "",
    slow: "",
    slower: "",
  });

  async function handleGenerate() {
    if (!text.trim()) return;

    setIsGenerating(true);

    const nextResults: Record<Speed, string> = {
      normal: "",
      slow: "",
      slower: "",
    };

    for (const speed of speeds) {
      const response = await fetch("/api/voice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          speed,
        }),
      });

      const data = await response.json();
      nextResults[speed] = data.audioUrl || "";
    }

    setResults(nextResults);
    setIsGenerating(false);
  }

  return (
    <div className="space-y-8">
      <div className="rounded border bg-white p-8 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700">
          Word or phrase
          <input
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Example: bathe"
            className="mt-2 w-full border px-4 py-3 text-sm outline-none focus:border-[#20ad68]"
          />
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="mt-6 rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : "Generate Audio"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {speeds.map((speed) => {
          const audioUrl = results[speed];

          return (
            <div key={speed} className="rounded border bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-[#20ad68]">
                {speed.toUpperCase()}
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#52719f]">
                {speed} version
              </h2>

              {audioUrl ? (
                <div className="mt-4 space-y-4">
                  <p className="text-sm font-semibold text-[#20ad68]">
                    ✓ Generated successfully
                  </p>

                  <audio controls src={audioUrl} className="w-full">
                    Your browser does not support the audio element.
                  </audio>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={audioUrl}
                      download
                      className="rounded border border-[#20ad68] px-4 py-2 text-xs font-semibold text-[#20ad68] transition hover:bg-[#e9f8f3]"
                    >
                      Download
                    </a>

                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(audioUrl)}
                      className="rounded border px-4 py-2 text-xs font-semibold text-gray-600 transition hover:border-[#20ad68] hover:text-[#20ad68]"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Audio output will appear here after generation.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

