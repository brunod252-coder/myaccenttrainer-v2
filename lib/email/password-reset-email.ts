type PasswordResetEmailInput = {
  firstName?: string | null;
  resetUrl: string;
  expiresInMinutes: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function passwordResetEmail({
  firstName,
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailInput) {
  const safeFirstName = firstName
    ? escapeHtml(firstName)
    : "there";

  const safeResetUrl = escapeHtml(resetUrl);

  const subject = "Reset your My Accent Trainer password";

  const text = [
    `Hello ${firstName || "there"},`,
    "",
    "We received a request to reset your My Accent Trainer password.",
    "",
    `Reset your password: ${resetUrl}`,
    "",
    `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
    "",
    "If you did not request this reset, you can safely ignore this email.",
    "",
    "My Accent Trainer",
  ].join("\n");

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>${subject}</title>
  </head>

  <body style="margin:0;background:#f4f7f6;font-family:Arial,Helvetica,sans-serif;color:#17324d;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dfe7e4;">
            <tr>
              <td style="padding:28px 32px;background:#ffffff;border-bottom:1px solid #e6ecea;">
                <div style="font-size:20px;font-weight:700;color:#17324d;">
                  my <span style="background:#20ad68;color:#ffffff;padding:2px 5px;">ACCENT</span> trainer
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 32px;">
                <h1 style="margin:0 0 20px;font-size:28px;line-height:1.25;color:#17324d;">
                  Reset your password
                </h1>

                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">
                  Hello ${safeFirstName},
                </p>

                <p style="margin:0 0 26px;font-size:16px;line-height:1.7;">
                  We received a request to reset the password for your
                  My Accent Trainer account.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="border-radius:4px;background:#20ad68;">
                      <a
                        href="${safeResetUrl}"
                        style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;"
                      >
                        Reset My Password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:26px 0 0;font-size:14px;line-height:1.7;color:#5d6c78;">
                  This secure link expires in ${expiresInMinutes} minutes
                  and can only be used once.
                </p>

                <p style="margin:18px 0 0;font-size:14px;line-height:1.7;color:#5d6c78;">
                  If you did not request a password reset, no action is
                  required. Your existing password will remain unchanged.
                </p>

                <p style="margin:26px 0 8px;font-size:13px;line-height:1.6;color:#70808c;">
                  If the button does not work, copy and paste this address:
                </p>

                <p style="margin:0;font-size:12px;line-height:1.6;word-break:break-all;color:#168c56;">
                  ${safeResetUrl}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 32px;background:#17324d;color:#ffffff;font-size:12px;line-height:1.6;">
                My Accent Trainer · Personal pronunciation coaching
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return {
    subject,
    text,
    html,
  };
}
