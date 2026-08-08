// ── Email sending (keyless-safe) ─────────────────────────────────────
// Sends via Resend's REST API when RESEND_API_KEY is set (no SDK needed,
// same approach as our Stripe integration). Without a key, it logs the
// message and returns the link so flows are fully testable in development.

type SendResult = { sent: boolean; devLink?: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  link?: string; // included in the dev fallback for easy testing
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "MyAccentTrainer <onboarding@resend.dev>";

  if (!key) {
    // No provider configured — log for the developer, surface link in dev.
    console.log(`[email:dev] To: ${opts.to} · ${opts.subject}${opts.link ? ` · ${opts.link}` : ""}`);
    return { sent: false, devLink: process.env.NODE_ENV !== "production" ? opts.link : undefined };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) {
      console.error("EMAIL_SEND_ERROR", await res.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error("EMAIL_SEND_EXCEPTION", error);
    return { sent: false };
  }
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// Small branded email wrapper.
export function emailShell(heading: string, body: string, cta?: { label: string; href: string }): string {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
    <div style="font-size:18px;font-weight:bold"><span style="color:#20ad68">my</span>ACCENT<span style="color:#20ad68">trainer</span></div>
    <h1 style="font-size:22px;color:#17223b;margin-top:24px">${heading}</h1>
    <p style="font-size:15px;line-height:1.6;color:#42506a">${body}</p>
    ${cta ? `<a href="${cta.href}" style="display:inline-block;margin-top:16px;background:#20ad68;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">${cta.label}</a>` : ""}
    <p style="font-size:12px;color:#9aa6b2;margin-top:28px">If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}
