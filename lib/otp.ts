import { createAdminClient } from "@/lib/supabase/admin";
import type { OtpCode } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

// Supabase's Update type inference resolves to `never` for some table shapes
// when the Database generic is used. This helper casts to the untyped client
// for write operations only, keeping read results typed via explicit casts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = (sb: SupabaseClient<any>) => sb as SupabaseClient;

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;

/** Generate a cryptographically random 6-digit OTP */
export function generateOtp(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  // 100000–999999 inclusive
  return String(100000 + (buf[0]! % 900000));
}

/**
 * Store a fresh OTP for the given identifier (email).
 * Invalidates any previous unused codes for the same identifier.
 */
export async function storeOtp(identifier: string): Promise<string> {
  const supabase = createAdminClient();
  const code = generateOtp();
  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
  ).toISOString();

  // Invalidate previous codes so only one is active at a time
  await untyped(supabase)
    .from("otp_codes")
    .update({ used: true })
    .eq("identifier", identifier)
    .eq("used", false);

  const { error } = await untyped(supabase).from("otp_codes").insert({
    identifier,
    code,
    expires_at: expiresAt,
    attempts: 0,
    used: false,
  });

  if (error) throw new Error(`Failed to store OTP: ${error.message}`);
  return code;
}

export type VerifyResult =
  | { success: true }
  | { success: false; reason: "invalid" | "expired" | "used" | "max_attempts" };

/**
 * Verify a submitted OTP code.
 * Increments attempt counter on failure, marks as used on success.
 */
export async function verifyOtp(
  identifier: string,
  submitted: string,
): Promise<VerifyResult> {
  const supabase = createAdminClient();

  const { data: row, error } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("identifier", identifier)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !row) return { success: false, reason: "invalid" };

  const typedRow = row as OtpCode;

  // Expired?
  if (new Date(typedRow.expires_at) < new Date()) {
    await untyped(supabase)
      .from("otp_codes")
      .update({ used: true })
      .eq("id", typedRow.id);
    return { success: false, reason: "expired" };
  }

  if (typedRow.attempts >= MAX_ATTEMPTS) {
    return { success: false, reason: "max_attempts" };
  }

  if (typedRow.code !== submitted.trim()) {
    await untyped(supabase)
      .from("otp_codes")
      .update({ attempts: typedRow.attempts + 1 })
      .eq("id", typedRow.id);
    return { success: false, reason: "invalid" };
  }

  await untyped(supabase)
    .from("otp_codes")
    .update({ used: true })
    .eq("id", typedRow.id);

  return { success: true };
}
