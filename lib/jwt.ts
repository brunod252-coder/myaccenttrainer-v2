import jwt from "jsonwebtoken";

const DEV_SECRET = "dev-only-change-before-production";
const JWT_SECRET = process.env.JWT_SECRET || DEV_SECRET;

// Loud warning if the app is running in production without a real secret.
if (process.env.NODE_ENV === "production" && JWT_SECRET === DEV_SECRET) {
  console.error(
    "[SECURITY] JWT_SECRET is not set in production — sessions are insecure. " +
      "Set a long random JWT_SECRET before going live (see the security checklist).",
  );
}

export type AuthTokenPayload = {
  userId: string;
  role: string;
};

// Standard session = 7 days; "remember me" extends it to 30.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;

export function signAuthToken(payload: AuthTokenPayload, opts?: { remember?: boolean }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: opts?.remember ? "30d" : "7d",
  });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}
