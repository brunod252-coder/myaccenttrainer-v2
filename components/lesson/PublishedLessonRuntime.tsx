"use client";

import { useState } from "react";
import Link from "next/link";
import VoiceRecorder from "@/components/voice/VoiceRecorder";

type PublishedWord = {
  word: string;
  audio: {
    normal: string;
    slow: string;
    slower: string;
  };
};

type Props = {
  lessonSlug: string;
  lessonTitle: string;
  words: PublishedWord[];
};

type CompletionProfile = {
  confidenceScore: number;
  lessonsCompleted: number;
  wordsPracticed: number;
};

export default function PublishedLessonRuntime({
  lessonSlug,
  lessonTitle,
  words,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);
  const [completionProfile, setCompletionProfile] =
    useState<CompletionProfile | null>(null);

  const currentWord = words[currentIndex];
  const progress = Math.round(((currentIndex + 1) / words.length) * 100);

  async function completeLesson() {
    setIsSavingCompletion(true);

    try {
      const response = await fetch("/api/lesson/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonSlug,
          lessonTitle,
          wordsPracticed: words.length,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCompletionProfile(data.profile);
      }

      setIsComplete(true);
    } finally {
      setIsSavingCompletion(false);
    }
  }

  function goNext() {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    completeLesson();
  }

  function goPrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
    }
  }

  if (isComplete) {
    return (
      <section className="rounded border bg-white p-8 text-center shadow-sm">
        <p className="text-5xl">🎉</p>

        <h2 className="mt-6 text-3xl font-bold text-[#52719f]">
          Lesson Complete
        </h2>

        <p className="mt-4 text-sm leading-6 text-gray-600">
          Excellent work. You practiced {words.length} pronunciation words.
          Nina will use this progress to keep personalizing your learning path.
        </p>

        <div className="mx-auto mt-8 grid max-w-2xl gap-4 md:grid-cols-3">
          <SummaryMetric label="Words Practiced" value={`+${words.length}`} />
          <SummaryMetric label="Confidence" value="+2%" />
          <SummaryMetric
            label="Lessons Completed"
            value={completionProfile?.lessonsCompleted ?? "Updated"}
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357]"
          >
            Return to Dashboard
          </Link>

          <Link
            href="/dashboard/practice"
            className="rounded border border-[#20ad68] px-6 py-3 text-sm font-semibold text-[#20ad68] transition hover:bg-[#e9f8f3]"
          >
            Continue Practice
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded border bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between text-sm font-semibold text-gray-500">
        <span>
          Word {currentIndex + 1} of {words.length}
        </span>
        <span>{progress}%</span>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-[#20ad68]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="mt-10 text-center text-5xl font-bold text-[#52719f]">
        {currentWord.word}
      </h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {(["normal", "slow", "slower"] as const).map((speed) => (
          <div key={speed} className="rounded border bg-[#fafafa] p-5">
            <p className="text-sm font-semibold uppercase text-[#20ad68]">
              {speed}
            </p>

            <audio
              controls
              className="mt-4 w-full"
              src={currentWord.audio[speed]}
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
<VoiceRecorder
  lessonSlug={lessonSlug}
  word={currentWord.word}
/>        
      </div>


      <div className="mt-10 flex justify-between">
        <button
          type="button"
          onClick={goPrevious}
          disabled={currentIndex === 0 || isSavingCompletion}
          className="rounded border px-5 py-3 text-sm font-semibold text-gray-600 disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={isSavingCompletion}
          className="rounded bg-[#20ad68] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSavingCompletion
            ? "Saving Progress..."
            : currentIndex === words.length - 1
              ? "Finish Lesson"
              : "Next"}
        </button>
      </div>
    </section>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded bg-[#f8fbfa] p-4">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-2 font-bold text-[#52719f]">{value}</p>
    </div>
  );
}
