type ReferralInvitationEmailInput = {
  inviterName: string;
  friendName?: string | null;
  referralCode: string;
  link: string;
};

type ReferralInvitationEmail = {
  html: string;
  text: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderReferralInvitationEmail(
  input: ReferralInvitationEmailInput,
): ReferralInvitationEmail {
  const inviterName =
    escapeHtml(
      input.inviterName.trim() || "A friend",
    );

  const friendName =
    input.friendName?.trim()
      ? escapeHtml(input.friendName.trim())
      : null;

  const referralCode =
    escapeHtml(input.referralCode);

  const link =
    escapeHtml(input.link);

  const greeting =
    friendName
      ? `Hi ${friendName},`
      : "Hi there,";

  const html = `
<!doctype html>
<html>
  <body
    style="
      margin:0;
      padding:0;
      background:#f4f7f6;
      font-family:Arial,Helvetica,sans-serif;
      color:#17223b;
    "
  >
    <div
      style="
        display:none;
        max-height:0;
        overflow:hidden;
        opacity:0;
        color:transparent;
      "
    >
      ${inviterName} invited you to My Accent Trainer.
    </div>

    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background:#f4f7f6;"
    >
      <tr>
        <td
          align="center"
          style="padding:36px 14px;"
        >
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              width:100%;
              max-width:600px;
              background:#ffffff;
              border:1px solid #e3ebe7;
              border-radius:24px;
              overflow:hidden;
            "
          >
            <!-- Brand -->
            <tr>
              <td
                style="
                  padding:30px 32px 12px;
                  font-size:20px;
                  font-weight:700;
                  letter-spacing:-0.4px;
                "
              >
                <span style="color:#20ad68;">my</span><span style="color:#17223b;">ACCENT</span><span style="color:#20ad68;">trainer</span>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td
                style="
                  padding:18px 32px 4px;
                  font-size:15px;
                  line-height:1.7;
                  color:#627083;
                "
              >
                ${greeting}
              </td>
            </tr>

            <!-- Headline -->
            <tr>
              <td
                style="
                  padding:4px 32px 8px;
                  font-size:30px;
                  line-height:1.22;
                  font-weight:750;
                  letter-spacing:-0.8px;
                  color:#17223b;
                "
              >
                ${inviterName} invited you to My Accent Trainer
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:6px 32px 24px;
                  font-size:16px;
                  line-height:1.7;
                  color:#516078;
                "
              >
                Practice English pronunciation with Nina, your patient AI coach, and build clearer, more confident speech at your own pace.
              </td>
            </tr>

            <!-- Reward card -->
            <tr>
              <td style="padding:0 32px 26px;">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background:#eaf9f2;
                    border:1px solid #cceede;
                    border-radius:20px;
                  "
                >
                  <tr>
                    <td
                      width="86"
                      align="center"
                      valign="middle"
                      style="
                        padding:24px 4px 24px 20px;
                        font-size:42px;
                      "
                    >
                      🎁
                    </td>

                    <td
                      style="
                        padding:22px 20px 22px 12px;
                      "
                    >
                      <div
                        style="
                          font-size:12px;
                          line-height:1.4;
                          font-weight:700;
                          text-transform:uppercase;
                          letter-spacing:1.1px;
                          color:#168c56;
                        "
                      >
                        A gift from ${inviterName}
                      </div>

                      <div
                        style="
                          margin-top:4px;
                          font-size:36px;
                          line-height:1.1;
                          font-weight:800;
                          color:#0d8c55;
                          letter-spacing:-1px;
                        "
                      >
                        $10
                      </div>

                      <div
                        style="
                          margin-top:6px;
                          font-size:15px;
                          line-height:1.55;
                          color:#385749;
                        "
                      >
                        Join through this invitation and you’ll both receive
                        <strong>$10</strong>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Benefits -->
            <tr>
              <td
                style="
                  padding:2px 32px 10px;
                  font-size:18px;
                  line-height:1.4;
                  font-weight:700;
                  color:#17223b;
                "
              >
                A better way to work on your pronunciation
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 26px;">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                >
                  <tr>
                    <td
                      width="50%"
                      valign="top"
                      style="
                        padding:10px 12px 10px 0;
                        font-size:14px;
                        line-height:1.5;
                        color:#516078;
                      "
                    >
                      <strong style="color:#17223b;">
                        ✓ Practice naturally
                      </strong>
                      <br>
                      Short, focused pronunciation sessions.
                    </td>

                    <td
                      width="50%"
                      valign="top"
                      style="
                        padding:10px 0 10px 12px;
                        font-size:14px;
                        line-height:1.5;
                        color:#516078;
                      "
                    >
                      <strong style="color:#17223b;">
                        ✓ Meet Nina
                      </strong>
                      <br>
                      Your patient AI pronunciation coach.
                    </td>
                  </tr>

                  <tr>
                    <td
                      width="50%"
                      valign="top"
                      style="
                        padding:10px 12px 10px 0;
                        font-size:14px;
                        line-height:1.5;
                        color:#516078;
                      "
                    >
                      <strong style="color:#17223b;">
                        ✓ Built around you
                      </strong>
                      <br>
                      Practice adapts to your voice and progress.
                    </td>

                    <td
                      width="50%"
                      valign="top"
                      style="
                        padding:10px 0 10px 12px;
                        font-size:14px;
                        line-height:1.5;
                        color:#516078;
                      "
                    >
                      <strong style="color:#17223b;">
                        ✓ See improvement
                      </strong>
                      <br>
                      Track clarity, sounds, and practice over time.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td
                align="center"
                style="padding:2px 32px 14px;"
              >
                <a
                  href="${link}"
                  style="
                    display:block;
                    background:#20ad68;
                    color:#ffffff;
                    text-decoration:none;
                    text-align:center;
                    padding:16px 24px;
                    border-radius:12px;
                    font-size:16px;
                    line-height:1.2;
                    font-weight:700;
                  "
                >
                  Accept your invite
                </a>
              </td>
            </tr>

            <!-- Referral code -->
            <tr>
              <td
                align="center"
                style="
                  padding:6px 32px 28px;
                  font-size:13px;
                  line-height:1.5;
                  color:#8794a4;
                "
              >
                Your referral code:
                <strong
                  style="
                    color:#526276;
                    letter-spacing:0.4px;
                  "
                >
                  ${referralCode}
                </strong>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  border-top:1px solid #edf1ef;
                  padding:22px 32px 28px;
                  font-size:12px;
                  line-height:1.6;
                  color:#9aa6b2;
                "
              >
                This invitation was sent because ${inviterName} thought My Accent Trainer could be useful to you.
                If you were not expecting it, you can safely ignore this email.
              </td>
            </tr>
          </table>

          <div
            style="
              max-width:600px;
              padding:16px 12px 0;
              text-align:center;
              font-size:11px;
              line-height:1.5;
              color:#a5afb8;
            "
          >
            My Accent Trainer · Practice clearer English with Nina
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  const rawGreeting =
    input.friendName?.trim()
      ? `Hi ${input.friendName.trim()},`
      : "Hi there,";

  const text = [
    rawGreeting,
    "",
    `${input.inviterName} invited you to My Accent Trainer.`,
    "",
    "Practice English pronunciation with Nina, your patient AI coach, and build clearer, more confident speech at your own pace.",
    "",
    "A GIFT FROM " + input.inviterName,
    "$10",
    "",
    "Join through this invitation and you’ll both receive $10",
    "",
    "Practice naturally with short, focused pronunciation sessions.",
    "Meet Nina, your patient AI pronunciation coach.",
    "Practice adapts to your voice and progress.",
    "Track your clarity, sounds, and improvement over time.",
    "",
    `Accept your invite: ${input.link}`,
    "",
    `Referral code: ${input.referralCode}`,
  ].join("\n");

  return {
    html,
    text,
  };
}
