import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";

type SendResult = {
  sent: boolean;
  messageId?: string;
  devLink?: string;
  error?: string;
};

const region =
  process.env.SES_REGION ||
  process.env.AWS_REGION ||
  "us-east-1";

const ses = new SESv2Client({
  region,
});

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  link?: string;
}): Promise<SendResult> {
  const provider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  const allowRealSends =
    process.env.ALLOW_REAL_EMAIL_SENDS?.trim().toLowerCase() === "true";

  const fromName =
    process.env.SES_FROM_NAME?.trim() || "My Accent Trainer";

  const fromEmail =
    process.env.SES_FROM_EMAIL?.trim() ||
    "support@myaccenttrainer.com";

  if (provider !== "ses" || !allowRealSends) {
    console.log(
      `[email:dev] To: ${opts.to} · ${opts.subject}` +
        (opts.link ? ` · ${opts.link}` : ""),
    );

    return {
      sent: false,
      devLink:
        process.env.NODE_ENV !== "production"
          ? opts.link
          : undefined,
      error: "Real email sending is disabled.",
    };
  }

  try {
    const result = await ses.send(
      new SendEmailCommand({
        FromEmailAddress: `${fromName} <${fromEmail}>`,
        ReplyToAddresses: [fromEmail],
        Destination: {
          ToAddresses: [opts.to],
        },
        Content: {
          Simple: {
            Subject: {
              Data: opts.subject,
              Charset: "UTF-8",
            },
            Body: {
              Html: {
                Data: opts.html,
                Charset: "UTF-8",
              },
              Text: {
                Data:
                  opts.text ||
                  stripHtml(opts.html),
                Charset: "UTF-8",
              },
            },
          },
        },
      }),
    );

    console.log("EMAIL_SENT", {
      to: opts.to,
      subject: opts.subject,
      messageId: result.MessageId,
      provider: "ses",
    });

    return {
      sent: true,
      messageId: result.MessageId,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown SES error";

    console.error("EMAIL_SEND_ERROR", {
      to: opts.to,
      subject: opts.subject,
      provider: "ses",
      error: message,
    });

    return {
      sent: false,
      error: message,
    };
  }
}

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

export function emailShell(
  heading: string,
  body: string,
  cta?: {
    label: string;
    href: string;
  },
): string {
  return `
    <div style="background:#f6f8fb;padding:32px 16px;font-family:Arial,sans-serif">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;border:1px solid #e7ebf0">
        <div style="font-size:20px;font-weight:700;color:#17223b">
          <span style="color:#20ad68">my</span>ACCENT<span style="color:#20ad68">trainer</span>
        </div>

        <h1 style="font-size:24px;line-height:1.3;color:#17223b;margin:28px 0 12px">
          ${heading}
        </h1>

        <p style="font-size:15px;line-height:1.7;color:#42506a;margin:0">
          ${body}
        </p>

        ${
          cta
            ? `
              <a
                href="${cta.href}"
                style="display:inline-block;margin-top:24px;background:#20ad68;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700"
              >
                ${cta.label}
              </a>
            `
            : ""
        }

        <p style="font-size:12px;line-height:1.6;color:#9aa6b2;margin-top:32px">
          If you did not request this message, you can safely ignore it.
        </p>
      </div>
    </div>
  `;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
