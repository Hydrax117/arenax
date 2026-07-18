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
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 422 },
      );
    }

    const { email, code } = parsed.data;

    // ── Step 1: Verify our custom OTP ────────────────────────────────────
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

    // ── Step 2: Get or create the Supabase Auth user ─────────────────────
    const admin = createAdminClient();

    // getUserByEmail is the safest way — no 500 if user already exists
    const { data: { users }, error: listError } =
      await admin.auth.admin.listUsers({ perPage: 1000 });

    if (listError) throw listError;

    let userId: string;

    const existing = users.find(
      (u) => u.email?.toLowerCase() === email,
    );

    if (existing) {
      // User exists — just use their ID
      userId = existing.id;

      // Ensure email is confirmed (in case they were created without confirmation)
      if (!existing.email_confirmed_at) {
        await admin.auth.admin.updateUserById(userId, {
          email_confirm: true,
        });
      }
    } else {
      // New user — create with email confirmed
      const { data: created, error: createError } =
        await admin.auth.admin.createUser({
          email,
          email_confirm: true,
        });

      if (createError) throw createError;
      userId = created.user.id;
    }

    // ── Step 3: Generate a short-lived session token ─────────────────────
    // generateLink returns a one-time token we can exchange for a session.
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError) throw linkError;

    const token = linkData.properties?.hashed_token;
    if (!token) throw new Error("generateLink returned no token");

    // ── Step 4: Check onboarding status ──────────────────────────────────
    const { data: profile } = (await admin
      .from("profiles")
      .select("gamertag, efootball_username")
      .eq("id", userId)
      .maybeSingle()) as {
      data: {
        gamertag: string | null;
        efootball_username: string | null;
      } | null;
    };

    const needsOnboarding =
      !profile || !profile.gamertag || !profile.efootball_username;

    // ── Step 5: Return token + metadata to the client ────────────────────
    // The client will call supabase.auth.verifyOtp({ token_hash, type })
    // to exchange this for a real browser session.
    return NextResponse.json(
      {
        success: true,
        needsOnboarding,
        userId,
        email,
        token,               // hashed_token for client-side session exchange
        tokenType: "magiclink" as const,
      },
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
