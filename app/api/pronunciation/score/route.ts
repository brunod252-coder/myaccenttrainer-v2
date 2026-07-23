import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { scorePronunciationMock } from "@/lib/pronunciation/mock-scorer";
import { saveAttempt, getPreviousAttemptScore } from "@/lib/pronunciation/attempts";
import { saveRecording } from "@/lib/pronunciation/recordings";
import { verifyAuthToken } from "@/lib/jwt";
import type { PronunciationResult } from "@/lib/pronunciation/types";

export const runtime = "nodejs";

async function currentUserId(): Promise<string | null> {
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return null;
    return verifyAuthToken(token).userId;
  } catch {
    return null;
  }
}

// POST /api/pronunciation/score
// Body: multipart form-data { audio?, referenceText, focus, lessonSlug }
// Uses Azure AI Speech when configured + installed; otherwise Nina's
// practice-estimate. Real per-sound scoring turns on automatically once
// AZURE_SPEECH_KEY + AZURE_SPEECH_REGION are set and the SDK is installed.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const referenceText = String(form.get("referenceText") ?? "");
    const focus = String(form.get("focus") ?? "");
    const lessonSlug = String(form.get("lessonSlug") ?? "") || undefined;
    const audio = form.get("audio");

    let result: PronunciationResult | null = null;

    // ── Real Azure scoring (auto-enabled when configured) ────────────
    if (
      audio instanceof File &&
      process.env.AZURE_SPEECH_KEY &&
      process.env.AZURE_SPEECH_REGION
    ) {
      try {
        const { assessWithAzure } = await import("@/lib/pronunciation/azure-speech");
        const buf = Buffer.from(await audio.arrayBuffer());
        result = await assessWithAzure(buf, referenceText, focus);
      } catch (error) {
        console.error("AZURE_SCORE_ERROR", error);
        // fall through to the practice estimate
      }
    }

    if (!result) {
      result = scorePronunciationMock(referenceText, focus);
    }

    const userId = await currentUserId();
    if (userId) {
      const previous = await getPreviousAttemptScore(userId, focus);
      if (previous !== null) {
        const delta = result.overall - previous;
        result.comparison = {
          previous,
          delta,
          direction: delta > 1 ? "up" : delta < -1 ? "down" : "same",
        };
      }
      await saveAttempt(userId, result, { referenceText, focus, lessonSlug });

      if (audio instanceof File) {
        try {
          const buf = Buffer.from(await audio.arrayBuffer());
          if (buf.length > 0 && buf.length < 1_500_000) {
            await saveRecording(userId, {
              audioBase64: buf.toString("base64"),
              mimeType: audio.type || "audio/wav",
              focus,
              overall: result.overall,
              lessonSlug,
            });
          }
        } catch {
          // storing the audio is best-effort — never block scoring
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("PRONUNCIATION_SCORE_ERROR", error);
    return NextResponse.json({ message: "Could not score this attempt." }, { status: 500 });
  }
}
