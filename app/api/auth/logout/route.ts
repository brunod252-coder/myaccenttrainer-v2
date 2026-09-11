import { NextResponse } from "next/server";

export async function POST() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://myaccenttrainer.com";

  const response = NextResponse.redirect(
    new URL("/", appUrl),
    303,
  );

  response.cookies.set("mat_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
