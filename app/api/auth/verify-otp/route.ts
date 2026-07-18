import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6, "Code must be 6 digits"),
});

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Incorrect code. Please check and try again.",
  expired: "This code has expired. Please request a new one.",
  used: "This code has already been used. Please request a new one.",
  max_attempts: "Too many incorrect attempts. Please request a new code.",
};

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 422 },
      );
    }

    const { email, code } = parsed.data;

    // ── Step 1: Verify our custom OTP ─────────────────────────────────────
    const result = await verifyOtp(email, code);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: ERROR_MESSAGES[result.reason] ?? "Verification failed.",
          reason: result.reason,
        },
        { status: 401 },
      );
    }

    // ── Step 2: Check onboarding status ──────────────────────────────────
    // We look up the profile by email via the NextAuth users table
    const admin = createAdminClient();

    const { data: profile } = (await admin
      .from("profiles")
      .select("id, gamertag, efootball_username")
      .eq("id",
        // Sub-select: get the NextAuth user id for this email
        // The adapter stores users in the 'users' table (NextAuth convention)
        admin.from("users").select("id").eq("email", email).limit(1)
      )
      .maybeSingle()) as { data: { id: string; gamertag: string | null; efootball_username: string | null } | null };

    const needsOnboarding = !profile?.gamertag || !profile?.efootball_username;

    // ── Step 3: Return verified signal ────────────────────────────────────
    // The client will call next-auth signIn("otp") with the same credentials,
    // which triggers our authorize() function and creates the session cookie.
    return NextResponse.json(
      { success: true, needsOnboarding, email },
      { status: 200 },
    );
  } catch (err) {
    console.error("[verify-otp] error:", err);
    return NextResponse.json(
      { success: false, message: "Verification failed. Please try again." },
      { status: 500 },
    );
  }
}
