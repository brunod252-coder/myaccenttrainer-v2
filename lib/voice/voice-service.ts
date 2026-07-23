import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { OpenAITTSProvider } from "@/lib/voice/providers/openai-tts-provider";

export type VoiceSpeed = "normal" | "slow" | "slower";

export interface GenerateVoiceRequest {
  text: string;
  speed: VoiceSpeed;
}

export interface GenerateVoiceResponse {
  success: boolean;
  audioUrl?: string;
}

const provider = new OpenAITTSProvider();

function slugifyText(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export class VoiceService {
  async generate(
    request: GenerateVoiceRequest
  ): Promise<GenerateVoiceResponse> {
    const audioBuffer = await provider.generateAudio(request);

    const safeText = slugifyText(request.text);
    const fileName = `${safeText}-${request.speed}.mp3`;

    const outputDir = path.join(
      process.cwd(),
      "public",
      "audio",
      "pronunciation"
    );

    await mkdir(outputDir, { recursive: true });

    const filePath = path.join(outputDir, fileName);

    await writeFile(filePath, audioBuffer);

    return {
      success: true,
      audioUrl: `/audio/pronunciation/${fileName}`,
    };
  }
}

export const voiceService = new VoiceService();
