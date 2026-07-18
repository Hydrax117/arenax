import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storeOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
});

// Loose rate-limit: track last-sent per email in memory.
// Replace with Redis/Upstash for production scale.
const lastSent = new Map<string, number>();
const COOLDOWN_MS = 60_000; // 60 seconds between sends

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

    // Cooldown check
    const last = lastSent.get(email);
    if (last && Date.now() - last < COOLDOWN_MS) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${secondsLeft}s before requesting another code.`,
        },
        { status: 429 },
      );
    }

    // Generate and store OTP
    const code = await storeOtp(email);

    // Send email
    await sendOtpEmail(email, code);

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
