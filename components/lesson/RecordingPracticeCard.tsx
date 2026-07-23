"use client";

import { useRef, useState } from "react";

import { MicRecorder } from "@/lib/pronunciation/recorder";
import { analyzeBlob, type AudioQuality } from "@/lib/pronunciation/audio-quality";
import type { PronunciationResult } from "@/lib/pronunciation/types";

type RecordingPracticeCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  referenceText?: string;
  focus?: string;
  lessonSlug?: string;
  onResult?: (result: PronunciationResult) => void;
  onSectionComplete?: () => void;
};

type Status = "idle" | "recording" | "checking" | "review" | "scoring" | "error";

export default function RecordingPracticeCard({
  title,
  description,
  buttonLabel,
  referenceText = "",
  focus = "",
  lessonSlug = "",
  onResult,
  onSectionComplete,
}: RecordingPracticeCardProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [quality, setQuality] = useState<AudioQuality | null>(null);
  const recorderRef = useRef<MicRecorder | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingWavRef = useRef<Blob | null>(null);

  async function score(wav: Blob | null) {
    setStatus("scoring");
    const form = new FormData();
    form.set("referenceText", referenceText);
    form.set("focus", focus);
    form.set("lessonSlug", lessonSlug);
    if (wav) form.set("audio", wav, "attempt.wav");

    try {
      const res = await fetch("/api/pronunciation/score", { method: "POST", body: form });
      if (!res.ok) throw new Error("Scoring request failed");
      const result: PronunciationResult = await res.json();
      onResult?.(result);
      onSectionComplete?.();
    } catch {
      setStatus("error");
      setErrorMessage(
        "I couldn't score that attempt just now. Please check your connection and try again.",
      );
    }
  }

  async function startRecording() {
    setErrorMessage("");
    setQuality(null);
    pendingWavRef.current = null;
    const recorder = new MicRecorder();
    try {
      await recorder.start();
      recorderRef.current = recorder;
      setStatus("recording");
      autoStopRef.current = setTimeout(() => {
        if (recorderRef.current) stopRecording();
      }, 8000);
    } catch {
      await score(null);
    }
  }

  async function stopRecording() {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    const recorder = recorderRef.current;
    if (!recorder) return;
    try {
      const wav = await recorder.stop();
      recorderRef.current = null;
      // Quick quality check before we score.
      setStatus("checking");
      const q = wav ? await analyzeBlob(wav) : null;
      if (q && !q.ok) {
        pendingWavRef.current = wav;
        setQuality(q);
        setStatus("review");
        return;
      }
      await score(wav);
    } catch {
      recorderRef.current = null;
      setStatus("error");
      setErrorMessage("Something went wrong while recording. Please try again.");
    }
  }

  const isRecording = status === "recording";
  const isBusy = status === "scoring" || status === "checking";

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f8f3] text-2xl">
          🎙️
        </div>

        <div className="flex-1">
          <h2 className="font-display text-xl text-[#20ad68]">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{description}</p>

          {referenceText && (
            <div className="mt-5 rounded-xl border border-gray-100 bg-[#f8fbfa] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Say this</p>
              <p className="mt-2 font-display text-lg text-[#52719f]">“{referenceText}”</p>
            </div>
          )}

          {/* Quality review — offer a re-record before scoring */}
          {status === "review" && quality && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-900">{quality.title}</p>
              <p className="mt-1 text-sm leading-6 text-amber-800">{quality.suggestion}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#20ad68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#169357]"
                >
                  🎙️ Re-record
                </button>
                <button
                  type="button"
                  onClick={() => score(pendingWavRef.current)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Score it anyway
                </button>
              </div>
            </div>
          )}

          {status !== "review" && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {!isBusy && (
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={
                    isRecording
                      ? "inline-flex items-center gap-2 rounded-lg bg-[#d1495b] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b93b4c]"
                      : "inline-flex items-center gap-2 rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357]"
                  }
                >
                  {isRecording ? (
                    <>
                      <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                      Stop &amp; get feedback
                    </>
                  ) : (
                    <>🎙️ {buttonLabel}</>
                  )}
                </button>
              )}

              {status === "checking" && (
                <span className="inline-flex items-center gap-3 text-sm font-semibold text-[#52719f]">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#e9f8f3] border-t-[#20ad68]" />
                  Checking your recording…
                </span>
              )}

              {status === "scoring" && (
                <span className="inline-flex items-center gap-3 text-sm font-semibold text-[#52719f]">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#e9f8f3] border-t-[#20ad68]" />
                  Nina is listening…
                </span>
              )}

              {isRecording && <span className="text-sm text-gray-500">Listening… tap when you finish.</span>}
            </div>
          )}

          {status === "error" && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
