import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { pronunciationEvaluationService } from "@/lib/pronunciation/pronunciation-evaluation-service";
import { voiceHistoryService } from "@/lib/voice-history/voice-history-service";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;

  if (!token) {
    return Response.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true },
  });

  if (!user) {
    return Response.json(
      { success: false, message: "User not found." },
      { status: 401 }
    );
  }

  const formData = await req.formData();

  const file = formData.get("audio");

  if (!(file instanceof File)) {
    return Response.json(
      { success: false, message: "No audio received." },
      { status: 400 }
    );
  }

  const lessonSlug = String(formData.get("lessonSlug") || "practice");
  const word = String(formData.get("word") || "practice");

  const bytes = Buffer.from(await file.arrayBuffer());

  const directory = path.join(process.cwd(), "data", "recordings");

  await mkdir(directory, { recursive: true });

  const filename = `${randomUUID()}.webm`;

  await writeFile(path.join(directory, filename), bytes);

  const evaluation = await pronunciationEvaluationService.evaluate({
    learnerId: user.id,
    lessonSlug,
    word,
    recordingFilename: filename,
  });

  await voiceHistoryService.addRecording({
    id: randomUUID(),
    learnerId: user.id,
    lessonSlug,
    word,
    filename,
    recordedAt: new Date().toISOString(),
  });

  return Response.json({
    success: true,
    filename,
    evaluation,
  });
}
