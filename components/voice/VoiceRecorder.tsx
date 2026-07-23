"use client";

import { useRef, useState } from "react";
import PronunciationEvaluationCard from "@/components/voice/PronunciationEvaluationCard";

type Props = {
  lessonSlug: string;
  word: string;
};

export default function VoiceRecorder({
  lessonSlug,
  word,
}: Props) {

  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState<string>();

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
type Evaluation = {
  pronunciationScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
};

const [evaluation, setEvaluation] = useState<Evaluation | null>(null);  

  async function startRecording() {
    setAudioUrl(undefined);
    setAudioBlob(null);
    setUploadedFilename(undefined);
    setEvaluation(null);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new MediaRecorder(stream);

    recorder.current = mediaRecorder;
    chunks.current = [];

    mediaRecorder.ondataavailable = (event) => {
      chunks.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks.current, {
        type: "audio/webm",
      });

      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));

      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start();
    setRecording(true);
  }

  function stopRecording() {
    recorder.current?.stop();
    setRecording(false);
  }

  async function uploadRecording() {
    if (!audioBlob) return;

    setIsUploading(true);

    try {
      
const formData = new FormData();

formData.append("audio", audioBlob, "recording.webm");
formData.append("lessonSlug", lessonSlug);
formData.append("word", word);
      const response = await fetch("/api/voice/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadedFilename(data.filename);
        setEvaluation(data.evaluation);
      }
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded border bg-[#fafafa] p-5">
      <p className="text-sm font-semibold uppercase text-[#20ad68]">
        Your Pronunciation
      </p>

      {!recording ? (
        <button
          type="button"
          onClick={startRecording}
          className="mt-4 rounded bg-[#20ad68] px-5 py-3 font-semibold text-white"
        >
          🎤 Start Recording
        </button>
      ) : (
        <button
          type="button"
          onClick={stopRecording}
          className="mt-4 rounded bg-red-600 px-5 py-3 font-semibold text-white"
        >
          ■ Stop Recording
        </button>
      )}

      {audioUrl && (
        <div className="mt-6 space-y-4">
          <audio controls className="w-full" src={audioUrl} />

          <button
            type="button"
            onClick={uploadRecording}
            disabled={isUploading || !!uploadedFilename}
            className="rounded border border-[#20ad68] px-5 py-3 text-sm font-semibold text-[#20ad68] disabled:opacity-60"
          >
            {isUploading
              ? "Uploading..."
              : uploadedFilename
                ? "Recording Saved"
                : "Save Recording"}
          </button>

          {uploadedFilename && (
            <p className="text-sm font-semibold text-[#20ad68]">
              ✓ Saved as {uploadedFilename}
            </p>
          )}

{evaluation && (
  <PronunciationEvaluationCard
    score={evaluation.pronunciationScore}
    summary={evaluation.summary}
    strengths={evaluation.strengths}
    improvements={evaluation.improvements}
  />
)}
        </div>
      )}
    </div>
  );
}
