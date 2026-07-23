import { NextRequest, NextResponse } from "next/server";

import { learnerProfileService } from "@/lib/learner-profile/learner-profile-service";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const displayName =
    request.nextUrl.searchParams.get("displayName") ?? "Learner";

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing learner id.",
      },
      {
        status: 400,
      }
    );
  }

  const profile = await learnerProfileService.getOrCreateProfile(
    id,
    displayName
  );

  return NextResponse.json({
    success: true,
    profile,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const id = String(body.id || "").trim();
    const displayName = String(body.displayName || "Learner").trim();
    const wordsPracticed = Number(body.wordsPracticed || 0);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing learner id.",
        },
        {
          status: 400,
        }
      );
    }

    if (!wordsPracticed || wordsPracticed < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "wordsPracticed must be greater than 0.",
        },
        {
          status: 400,
        }
      );
    }

    const profile = await learnerProfileService.recordPractice(
      id,
      displayName,
      wordsPracticed
    );

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to record practice.",
      },
      {
        status: 500,
      }
    );
  }
}
