import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";

let sesClient: SESv2Client | null = null;

function getSesClient() {
  if (sesClient) {
    return sesClient;
  }

  const region =
    process.env.SES_REGION ||
    process.env.AWS_REGION ||
    "us-east-1";

  sesClient = new SESv2Client({ region });

  return sesClient;
}

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput) {
  const fromEmail = process.env.SES_FROM_EMAIL;
  const fromName =
    process.env.SES_FROM_NAME || "My Accent Trainer";

  if (!fromEmail) {
    throw new Error("SES_FROM_EMAIL is not configured.");
  }

  const command = new SendEmailCommand({
    FromEmailAddress: `${fromName} <${fromEmail}>`,
    Destination: {
      ToAddresses: [to],
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
          Text: {
            Data: text,
            Charset: "UTF-8",
          },
        },
      },
    },
  });

  const result = await getSesClient().send(command);

  return {
    messageId: result.MessageId,
  };
}
