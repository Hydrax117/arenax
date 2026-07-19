/**
 * Short-lived HMAC token passed from /api/auth/verify-otp to the client,
 * then presented to NextAuth's authorize() to prove OTP was already verified.
 *
 * Format: `${email}|${expiry}|${hmac}`
 * Valid for 5 minutes — just long enough for the browser to call signIn().
 */
import { createHmac } from "crypto";

const SECRET = process.env.AUTH_SECRET!;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function hmac(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createPreAuthToken(email: string): string {
  const expiry = Date.now() + TTL_MS;
  const payload = `${email}|${expiry}`;
  return `${payload}|${hmac(payload)}`;
}

export function verifyPreAuthToken(
  token: string,
): { valid: true; email: string } | { valid: false } {
  const parts = token.split("|");
  if (parts.length !== 3) return { valid: false };

  const [email, expiryStr, sig] = parts as [string, string, string];
  const payload = `${email}|${expiryStr}`;

  // Constant-time comparison
  const expected = hmac(payload);
  if (sig !== expected) return { valid: false };

  if (Date.now() > parseInt(expiryStr, 10)) return { valid: false };

  return { valid: true, email };
}
