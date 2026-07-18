import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
});

// Loose in-memory rate limit (60s per email)
const lastSent = new Map<string, number>();
const COOLDOWN_MS = 60_000;

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid email" },
        { status: 422 },
      );
    }

    const { email } = parsed.data;

    // Rate limit check
    const last = lastSent.get(email);
    if (last && Date.now() - last < COOLDOWN_MS) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
      return NextResponse.json(
        { success: false, message: `Please wait ${secondsLeft}s before requesting another code.` },
        { status: 429 },
      );
    }

    // Use Supabase's native email OTP — no custom email sending needed
    // Supabase sends a 6-digit OTP to the user's inbox
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("[send-otp] Supabase error:", error.message);
      return NextResponse.json(
        { success: false, message: "Failed to send code. Please try again." },
        { status: 500 },
      );
    }

    lastSent.set(email, Date.now());

    return NextResponse.json(
      { success: true, message: "Code sent — check your email." },
      { status: 200 },
    );
  } catch (err) {
    console.error("[send-otp] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to send code. Please try again." },
      { status: 500 },
    );
  }
}
