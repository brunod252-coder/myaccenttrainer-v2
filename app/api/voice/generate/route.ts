import { NextResponse } from "next/server";

import { voiceService, type VoiceSpeed } from "@/lib/voice/voice-service";

const allowedSpeeds: VoiceSpeed[] = ["normal", "slow", "slower"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const text = String(body.text || "").trim();
    const speed = body.speed as VoiceSpeed;

    if (!text) {
      return NextResponse.json(
        { message: "Text is required." },
        { status: 400 }
      );
    }

    if (!allowedSpeeds.includes(speed)) {
      return NextResponse.json(
        { message: "Invalid speed." },
        { status: 400 }
      );
    }

    const result = await voiceService.generate({
      text,
      speed,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Something went wrong while generating audio." },
      { status: 500 }
    );
  }
}
