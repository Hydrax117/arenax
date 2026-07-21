import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "ArenaX <noreply@arenax.gg>";
const APP_NAME = "ArenaX";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://arenax.com.ng";

// ── Shared email shell ────────────────────────────────────────────────────

function emailShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Exo 2',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:480px;background:#1a1f24;border:1px solid #2a3f36;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid #2a3f36;">
              <h1 style="margin:0;font-family:Arial,sans-serif;font-size:22px;font-weight:900;
                letter-spacing:0.15em;color:#00e05a;">
                ARENA<span style="color:#ffffff;">X</span>
              </h1>
            </td>
          </tr>
          <tr><td style="padding:32px;">${body}</td></tr>
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
</html>`;
}

// ── OTP email ─────────────────────────────────────────────────────────────

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const body = `
    <p style="margin:0 0 8px;font-size:15px;color:#b3b3b1;line-height:1.6;">
      Your one-time sign-in code:
    </p>
    <div style="margin:20px 0;padding:20px;background:#0a0a0a;
      border:1px solid rgba(0,224,90,0.25);border-radius:8px;text-align:center;">
      <span style="font-family:'Courier New',monospace;font-size:40px;font-weight:700;
        letter-spacing:0.3em;color:#00e05a;">${code}</span>
    </div>
    <p style="margin:0 0 16px;font-size:14px;color:#687280;line-height:1.6;">
      This code expires in <strong style="color:#ffffff;">10 minutes</strong>.
      If you didn't request this, you can safely ignore this email.
    </p>
    <p style="margin:0;font-size:12px;color:#687280;">
      Never share this code with anyone — ${APP_NAME} will never ask for it.
    </p>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${code} — Your ${APP_NAME} sign-in code`,
    html: emailShell(`Your ${APP_NAME} sign-in code`, body),
    text: `Your ${APP_NAME} sign-in code: ${code}\n\nExpires in 10 minutes. Never share this code.`,
  });

  if (error) throw new Error(`OTP email failed: ${error.message}`);
}

// ── Waitlist welcome email ─────────────────────────────────────────────────

export async function sendWaitlistWelcomeEmail(
  email: string,
  name?: string | null,
  position?: number,
): Promise<void> {
  const displayName = name?.trim() ? name.trim() : "Champion";

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#b3b3b1;line-height:1.6;">
      Hey ${displayName},
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#b3b3b1;line-height:1.6;">
      You're officially on the <strong style="color:#00e05a;">ArenaX</strong> waitlist
      ${position ? `as <strong style="color:#00e05a;">#${position}</strong>` : ""}.
      We're building Nigeria's most competitive eFootball Mobile arena — and you got in early.
    </p>
    <div style="margin:24px 0;padding:20px;background:#0a0a0a;
      border:1px solid rgba(0,224,90,0.25);border-radius:8px;">
      <p style="margin:0 0 12px;font-size:13px;color:#b3b3b1;font-weight:600;
        text-transform:uppercase;letter-spacing:0.1em;">What you get as an early member:</p>
      <ul style="margin:0;padding-left:20px;color:#687280;font-size:13px;line-height:2;">
        <li><span style="color:#00e05a;">⚡</span> Early access before public launch</li>
        <li><span style="color:#00e05a;">🏆</span> Reserved spot in our first free tournament</li>
        <li><span style="color:#00e05a;">🔔</span> First to know when registration opens</li>
      </ul>
    </div>
    <p style="margin:0 0 24px;font-size:14px;color:#687280;line-height:1.6;">
      We'll send you a launch notification the moment ArenaX goes live.
      In the meantime, stay ready.
    </p>
    <div style="text-align:center;">
      <a href="${SITE_URL}"
        style="display:inline-block;padding:14px 32px;background:#00e05a;color:#0a0a0a;
          font-family:Arial,sans-serif;font-size:14px;font-weight:900;letter-spacing:0.1em;
          text-decoration:none;border-radius:8px;">
        Visit ArenaX →
      </a>
    </div>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `You're on the ArenaX waitlist 🏆`,
    html: emailShell("Welcome to ArenaX", body),
    text: `Hey ${displayName},\n\nYou're on the ArenaX waitlist${position ? ` (#${position})` : ""}!\n\nWe'll notify you the moment ArenaX launches.\n\nVisit us: ${SITE_URL}`,
  });

  if (error) {
    // Non-fatal — log but don't throw (user is already saved in DB)
    console.error("[waitlist welcome] email failed:", error.message);
  }
}
