import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/jwt";

export const runtime = "nodejs";

const schema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  countryOfResidence: z.string().max(80).optional(),
  nativeLanguage: z.string().max(80).optional(),
  englishGoal: z.string().max(120).optional(),
  proficiencyLevel: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    const { userId } = verifyAuthToken(token);

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }
    const d = parsed.data;

    await prisma.user.update({
      where: { id: userId },
      data: { firstName: d.firstName, lastName: d.lastName },
    });

    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        countryOfResidence: d.countryOfResidence,
        nativeLanguage: d.nativeLanguage,
        englishGoal: d.englishGoal,
        proficiencyLevel: d.proficiencyLevel,
      },
      create: {
        userId,
        countryOfResidence: d.countryOfResidence,
        nativeLanguage: d.nativeLanguage,
        englishGoal: d.englishGoal,
        proficiencyLevel: d.proficiencyLevel,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR", error);
    return NextResponse.json({ message: "Could not save. Please try again." }, { status: 500 });
  }
}
