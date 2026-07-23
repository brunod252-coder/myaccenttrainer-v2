"use client";

import { useState } from "react";

type LessonGenerationResult = {
  success: boolean;
  generatedWords: {
    word: string;
    audio: {
      normal: string;
      slow: string;
      slower: string;
    };
  }[];
  totalFiles: number;
};

export default function LessonBuilderForm() {
  const [title, setTitle] = useState("The American TH");
  const [subtitle, setSubtitle] = useState("Voiced and Unvoiced TH");
  const [description, setDescription] = useState(
    "Master the TH sounds used in everyday American English."
  );
  const [difficulty, setDifficulty] = useState("Beginner");
  const [estimatedMinutes, setEstimatedMinutes] = useState("15");
  const [words, setWords] = useState(
    "think\nthree\nthrough\nbath\nbathe\nbreathe\nbrother\nmother\nthere\nthose"
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<LessonGenerationResult | null>(null);
  const [publishResult, setPublishResult] = useState<any>(null);

  async function handleGenerateLesson() {
    setIsGenerating(true);
    setResult(null);
    setPublishResult(null);

    try {
      const response = await fetch("/api/lesson-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          description,
          difficulty,
          estimatedMinutes,
          words: words
            .split("\n")
            .map((word) => word.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();
      setResult(data);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePublishLesson() {
    if (!result) return;

    setIsPublishing(true);

    try {
      const response = await fetch("/api/lesson-builder/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          description,
          difficulty,
          estimatedMinutes,
          generatedWords: result.generatedWords,
        }),
      });

      const data = await response.json();
      setPublishResult(data);
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <>
      <div className="rounded border bg-white p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Lesson Title" value={title} onChange={setTitle} />
          <Field label="Subtitle" value={subtitle} onChange={setSubtitle} />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="mt-2 w-full border px-4 py-3 text-sm font-normal outline-none focus:border-[#20ad68]"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field label="Difficulty" value={difficulty} onChange={setDifficulty} />
          <Field
            label="Estimated Minutes"
            value={estimatedMinutes}
            onChange={setEstimatedMinutes}
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700">
            Word List
            <textarea
              value={words}
              onChange={(event) => setWords(event.target.value)}
              rows={10}
              className="mt-2 w-full border px-4 py-3 text-sm font-normal outline-none focus:border-[#20ad68]"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleGenerateLesson}
          disabled={isGenerating}
          className="mt-8 rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:opacity-60"
        >
          {isGenerating ? "Generating Lesson..." : "Generate Lesson Audio"}
        </button>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="rounded border bg-[#eef8f2] p-6">
              <p className="font-semibold text-[#20ad68]">
                ✓ Lesson generated successfully
              </p>

              <p className="mt-2 text-sm text-gray-700">
                {result.generatedWords.length} words processed
              </p>

              <p className="text-sm text-gray-700">
                {result.totalFiles} audio files created
              </p>

              <button
                type="button"
                onClick={handlePublishLesson}
                disabled={isPublishing}
                className="mt-6 rounded bg-[#52719f] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {isPublishing ? "Publishing..." : "Publish Lesson"}
              </button>

              {publishResult?.success && (
                <div className="mt-6 rounded border bg-blue-50 p-6">
                  <p className="font-semibold text-[#52719f]">
                    📘 Lesson published successfully
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    {publishResult.filePath}
                  </p>
                </div>
              )}
            </div>

            {result.generatedWords.map((item) => (
              <div key={item.word} className="rounded border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#52719f]">{item.word}</h3>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {(
                    Object.entries(item.audio) as [
                      "normal" | "slow" | "slower",
                      string
                    ][]
                  ).map(([speed, url]) => (
                    <div key={speed} className="rounded border bg-[#fafafa] p-4">
                      <p className="text-sm font-semibold uppercase text-[#20ad68]">
                        {speed}
                      </p>

                      <audio controls className="mt-3 w-full" src={url} />

                      <div className="mt-3 flex gap-2">
                        <a
                          href={url}
                          download
                          className="rounded border border-[#20ad68] px-3 py-2 text-xs font-semibold text-[#20ad68]"
                        >
                          Download
                        </a>

                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(url)}
                          className="rounded border px-3 py-2 text-xs"
                        >
                          Copy URL
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
            <div className="flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#20ad68] border-t-transparent" />
            </div>

            <h2 className="mt-6 text-center text-2xl font-bold text-[#52719f]">
              Nina is creating your lesson
            </h2>

            <p className="mt-4 text-center text-sm leading-6 text-gray-600">
              Please wait while pronunciation audio is generated for every word.
            </p>

            <div className="mt-8 h-3 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-full animate-pulse bg-[#20ad68]" />
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              This usually takes 20–30 seconds.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border px-4 py-3 text-sm font-normal outline-none focus:border-[#20ad68]"
      />
    </label>
  );
}
