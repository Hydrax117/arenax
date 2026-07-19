import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { createPreAuthToken } from "@/lib/auth/pre-auth-token";

const schema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6, "Code must be 6 digits"),
});

const ERROR_MESSAGES: Record<string, string> = {
  invalid:      "Incorrect code. Please check and try again.",
  expired:      "This code has expired. Please request a new one.",
  used:         "This code has already been used. Please request a new one.",
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

    // Verify & consume the OTP (marks it as used)
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

    // Issue a short-lived pre-auth token so the client can call signIn()
    // without re-running OTP verification (which would fail — already used)
    const preAuthToken = createPreAuthToken(email);

    return NextResponse.json(
      { success: true, email, preAuthToken },
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
