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

/** Call the Supabase Admin REST API directly — bypasses JS client retry logic */
async function adminFetch(path: string, body: unknown, method = "POST") {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    body: body !== null ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10_000),
  });

  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

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
        { success: false, message: ERROR_MESSAGES[result.reason] ?? "Verification failed.", reason: result.reason },
        { status: 401 },
      );
    }

    // ── Step 2: Get or create the auth user via direct REST ───────────────
    // List users to find existing
    const listRes = await adminFetch(`/users?email=${encodeURIComponent(email)}`, null, "GET");

    type AdminUser = { id: string; email: string; email_confirmed_at: string | null };
    type ListResponse = { users?: AdminUser[] };

    let userId: string | null = null;

    if (listRes.ok) {
      const listData = listRes.data as ListResponse;
      const found = listData.users?.find(
        (u) => u.email?.toLowerCase() === email,
      );
      if (found) userId = found.id;
    }

    if (!userId) {
      // Create new user
      const createRes = await adminFetch("/users", {
        email,
        email_confirm: true,
      });

      if (!createRes.ok) {
        console.error("[verify-otp] createUser failed:", createRes.status, createRes.data);
        return NextResponse.json(
          { success: false, message: "Failed to create account. Please try again." },
          { status: 500 },
        );
      }
      userId = (createRes.data as { id: string }).id;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Could not resolve user account." },
        { status: 500 },
      );
    }

    // ── Step 3: Generate a magic link token ───────────────────────────────
    const linkRes = await adminFetch("/generate_link", {
      type: "magiclink",
      email,
    });

    if (!linkRes.ok) {
      console.error("[verify-otp] generateLink failed:", linkRes.status, linkRes.data);
      return NextResponse.json(
        { success: false, message: "Failed to create session. Please try again." },
        { status: 500 },
      );
    }

    type LinkResponse = { properties?: { hashed_token?: string } };
    const hashed_token = (linkRes.data as LinkResponse).properties?.hashed_token;

    if (!hashed_token) {
      return NextResponse.json(
        { success: false, message: "Failed to generate session token." },
        { status: 500 },
      );
    }

    // ── Step 4: Check onboarding status ──────────────────────────────────
    const admin = createAdminClient();
    const { data: profile } = (await admin
      .from("profiles")
      .select("gamertag, efootball_username")
      .eq("id", userId)
      .maybeSingle()) as {
      data: { gamertag: string | null; efootball_username: string | null } | null;
    };

    const needsOnboarding = !profile?.gamertag || !profile?.efootball_username;

    return NextResponse.json(
      { success: true, needsOnboarding, email, token: hashed_token, tokenType: "magiclink" },
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
