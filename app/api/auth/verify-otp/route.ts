import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6, "Code must be 6 digits"),
});

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Incorrect code. Please check and try again.",
  expired: "This code has expired. Please request a new one.",
  used: "This code has already been used. Please request a new one.",
  max_attempts:
    "Too many incorrect attempts. Please request a new code.",
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

    // Verify the OTP
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

    // ── OTP is valid — sign the user in via Supabase Auth ─────────────────
    // We use signInWithOtp (magic link style) but skip the email —
    // we already verified ownership above. Use admin to create/get the user.
    const admin = createAdminClient();

    // Upsert auth user — creates if not exists, returns existing if already there
    const { data: userData, error: upsertError } =
      await admin.auth.admin.createUser({
        email,
        email_confirm: true, // mark email as confirmed since we verified OTP
      });

    let userId: string;

    if (upsertError) {
      // User already exists — fetch them
      if (upsertError.message?.includes("already been registered")) {
        const { data: list, error: listError } =
          await admin.auth.admin.listUsers();
        if (listError) throw listError;
        const existing = list.users.find(
          (u) => u.email?.toLowerCase() === email,
        );
        if (!existing) throw new Error("User not found after creation conflict");
        userId = existing.id;
      } else {
        throw upsertError;
      }
    } else {
      userId = userData.user.id;
    }

    // Generate a session for the user via a magic-link style sign-in
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError) throw linkError;

    // Exchange the token for a real session using the server client
    const supabase = await createClient();
    const token = linkData.properties?.hashed_token;

    if (!token) throw new Error("No token in generated link");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.verifyOtp({
        token_hash: token,
        type: "magiclink",
      });

    if (sessionError) throw sessionError;

    // Check if this user has a complete profile
    const { data: profile } = await admin
      .from("profiles")
      .select("gamertag, efootball_username, nigerian_state")
      .eq("id", userId)
      .maybeSingle() as { data: { gamertag: string | null; efootball_username: string | null; nigerian_state: string | null } | null };

    const needsOnboarding =
      !profile ||
      !profile.gamertag ||
      !profile.efootball_username;

    return NextResponse.json(
      {
        success: true,
        needsOnboarding,
        user: { id: userId, email },
        session: sessionData.session,
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
