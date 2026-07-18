import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "ArenaX <noreply@arenax.gg>";
const APP_NAME = "ArenaX";

/**
 * Send the 6-digit OTP to the user's email address.
 * Returns true on success, throws on failure.
 */
export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${code} — Your ${APP_NAME} sign-in code`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your ${APP_NAME} sign-in code</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Exo 2',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#1a1f24;border:1px solid #2a3f36;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid #2a3f36;">
              <h1 style="margin:0;font-family:Arial,sans-serif;font-size:22px;font-weight:900;letter-spacing:0.15em;color:#00e05a;">
                ARENA<span style="color:#ffffff;">X</span>
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:15px;color:#b3b3b1;line-height:1.6;">
                Your one-time sign-in code:
              </p>
              <!-- OTP code -->
              <div style="margin:20px 0;padding:20px;background:#0a0a0a;border:1px solid rgba(0,224,90,0.25);border-radius:8px;text-align:center;">
                <span style="font-family:'Courier New',monospace;font-size:40px;font-weight:700;letter-spacing:0.3em;color:#00e05a;">
                  ${code}
                </span>
              </div>
              <p style="margin:0 0 16px;font-size:14px;color:#687280;line-height:1.6;">
                This code expires in <strong style="color:#ffffff;">10 minutes</strong>.
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin:0;font-size:12px;color:#687280;">
                Never share this code with anyone — ${APP_NAME} will never ask for it.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #2a3f36;">
              <p style="margin:0;font-size:11px;color:#687280;text-align:center;">
                © ${new Date().getFullYear()} ${APP_NAME} · Nigeria's eFootball Arena
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Your ${APP_NAME} sign-in code: ${code}\n\nThis code expires in 10 minutes.\n\nNever share this code with anyone.`,
  });

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }
}
