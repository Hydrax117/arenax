import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email().toLowerCase(),
  token: z.string().min(1, "Code is required"),
});

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

    const { email, token } = parsed.data;

    // ── Verify the Supabase OTP on the server ────────────────────────────
    // We use a fresh anon client (no cookies) to verify the token.
    // On success it returns a session we pass back to the client.
    const { createClient } = await import("@supabase/supabase-js");
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: sessionData, error: verifyError } =
      await anonClient.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

    if (verifyError || !sessionData.session) {
      const msg = verifyError?.message ?? "";
      let message = "Incorrect code. Please check and try again.";
      if (msg.includes("expired") || msg.includes("Token has expired")) {
        message = "This code has expired. Please request a new one.";
      }
      return NextResponse.json(
        { success: false, message },
        { status: 401 },
      );
    }

    const userId = sessionData.user?.id;

    // ── Check onboarding status ───────────────────────────────────────────
    let needsOnboarding = true;
    if (userId) {
      const admin = createAdminClient();
      const { data: profile } = (await admin
        .from("profiles")
        .select("gamertag, efootball_username")
        .eq("id", userId)
        .maybeSingle()) as {
        data: { gamertag: string | null; efootball_username: string | null } | null;
      };
      needsOnboarding = !profile?.gamertag || !profile?.efootball_username;
    }

    // ── Return session to client ──────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        needsOnboarding,
        session: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
        },
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
