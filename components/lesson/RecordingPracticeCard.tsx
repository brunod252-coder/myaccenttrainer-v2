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
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <path d="M12 17v5" />
              <path d="M8 22h8" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <p className="mat-eyebrow">
              Your turn
            </p>

            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--mat-muted)]">
              {description}
            </p>
          </div>
        </div>

        {referenceText && (
          <div className="mt-6 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-green-700)]">
                Say this
              </p>

              <span className="mat-pill bg-white text-[var(--mat-green-800)]">
                Practice phrase
              </span>
            </div>

            <blockquote className="mt-4 border-l-2 border-[var(--mat-green-600)] pl-4">
              <p className="font-display text-xl leading-8 text-[var(--mat-ink)] sm:text-2xl">
                “{referenceText}”
              </p>
            </blockquote>

            {focus && (
              <p className="mt-4 text-sm leading-6 text-[var(--mat-muted)]">
                <span className="font-semibold text-[var(--mat-ink)]">Focus:</span>{" "}
                {focus}
              </p>
            )}
          </div>
        )}

          {/* Quality review — offer a re-record before scoring */}
          {status === "review" && quality && (
            <div className="mt-6 rounded-[var(--mat-radius-lg)] border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-amber-700"
                >
                  !
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-amber-950">
                    {quality.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-900">
                    {quality.suggestion}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startRecording}
                  className="mat-button mat-button-primary"
                >
                  Re-record
                </button>

                <button
                  type="button"
                  onClick={() => score(pendingWavRef.current)}
                  className="mat-button mat-button-secondary"
                >
                  Score it anyway
                </button>
              </div>
            </div>
          )}

          {status !== "review" && (
            <div className="mt-6 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-4">
                {!isBusy && (
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={
                      isRecording
                        ? "mat-button bg-[var(--mat-red)] text-white"
                        : "mat-button mat-button-primary"
                    }
                  >
                    {isRecording ? (
                      <>
                        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                        Stop &amp; get feedback
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">🎙️</span>
                        {buttonLabel}
                      </>
                    )}
                  </button>
                )}

                {status === "checking" && (
                  <span className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--mat-blue)]">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--mat-border-green)] border-t-[var(--mat-green-700)]" />
                    Checking your recording…
                  </span>
                )}

                {status === "scoring" && (
                  <span className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--mat-blue)]">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--mat-border-green)] border-t-[var(--mat-green-700)]" />
                    Nina is listening…
                  </span>
                )}
              </div>

              {isRecording && (
                <div className="mt-4 flex items-center gap-2 border-t border-[var(--mat-border)] pt-4 text-sm text-[var(--mat-muted)]">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--mat-red)]" />
                  Listening… tap Stop when you finish. Recording stops automatically after 8 seconds.
                </div>
              )}

              {status === "idle" && (
                <p className="mt-4 border-t border-[var(--mat-border)] pt-4 text-xs leading-5 text-[var(--mat-muted)]">
                  Speak naturally at a comfortable volume. We will check the recording before Nina scores it.
                </p>
              )}
            </div>
          )}

          {status === "error" && (
            <div
              role="alert"
              className="mt-4 rounded-[var(--mat-radius-lg)] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
            >
              <span className="font-semibold">Please try again. </span>
              {errorMessage}
            </div>
          )}
        </div>
    </section>
  );
}
