import OpenAI from "openai";

import type { GenerateVoiceRequest } from "@/lib/voice/voice-service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAITTSProvider {
  async generateAudio(request: GenerateVoiceRequest): Promise<Buffer> {
    const speedInstructions = {
      normal:
        "Pronounce the word naturally in a clear American English accent.",

      slow:
        "Pronounce the word slowly, clearly, and naturally for an English learner. Do not spell the word.",

      slower:
        "Pronounce the word very slowly with clear articulation between sounds. Focus only on pronunciation. Do not spell or explain the word.",
    };

    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: request.text,
      instructions: speedInstructions[request.speed],
      speed:
        request.speed === "normal"
          ? 1.0
          : request.speed === "slow"
            ? 0.75
            : 0.55,
      response_format: "mp3",
    });

    const arrayBuffer = await response.arrayBuffer();

    return Buffer.from(arrayBuffer);
  }
}
