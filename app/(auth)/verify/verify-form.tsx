"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "resending" | "error" | "success";

interface VerifyResponse {
  success: boolean;
  message?: string;
  reason?: string;
  needsOnboarding?: boolean;
  userId?: string;
  email?: string;
  token?: string;
  tokenType?: "magiclink";
}

const CODE_LENGTH = 6;

export function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const redirect = params.get("redirect") ?? "/dashboard";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const code = digits.join("");
  const isComplete = code.length === CODE_LENGTH && !code.includes(" ");

  function handleDigitChange(i: number, value: string) {
    // Allow paste of full code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
      const next = Array(CODE_LENGTH).fill("");
      pasted.split("").forEach((c, idx) => { next[idx] = c; });
      setDigits(next);
      inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < CODE_LENGTH - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || status === "loading") return;
    await verify(code);
  }

  async function verify(submittedCode: string) {
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: submittedCode }),
      });

      const data = (await res.json()) as VerifyResponse;

      if (!data.success || !data.token) {
        setStatus("error");
        setErrorMsg(data.message ?? "Verification failed.");
        if (data.reason === "max_attempts" || data.reason === "expired") {
          setDigits(Array(CODE_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        }
        return;
      }

      // Exchange the server-generated token for a real browser session
      const supabase = createBrowserClient();
      const { error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: data.token,
        type: "magiclink",
      });

      if (sessionError) {
        setStatus("error");
        setErrorMsg("Failed to establish session. Please try again.");
        return;
      }

      setStatus("success");

      // Route based on onboarding status
      if (data.needsOnboarding) {
        router.push(`/onboarding?redirect=${encodeURIComponent(redirect)}`);
      } else {
        router.push(redirect);
        router.refresh(); // force server component re-render with new session
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  async function handleResend() {
    if (cooldown > 0 || status === "resending") return;
    setStatus("resending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { success: boolean; message: string };

      if (!data.success) {
        setStatus("error");
        setErrorMsg(data.message);
      } else {
        setStatus("idle");
        setCooldown(60);
        setDigits(Array(CODE_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setStatus("error");
      setErrorMsg("Failed to resend. Please try again.");
    }
  }

  const isLoading = status === "loading" || status === "resending";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Email display */}
      <p className="font-body text-sm text-fg-secondary text-center">
        Code sent to{" "}
        <span className="text-fg-primary font-semibold">{email}</span>
      </p>

      {/* OTP digit inputs */}
      <div
        className="flex gap-2 justify-center"
        role="group"
        aria-label="6-digit verification code"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={CODE_LENGTH} // allow paste on first input
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            disabled={isLoading}
            aria-label={`Digit ${i + 1}`}
            className={cn(
              "w-11 h-14 text-center text-xl font-heading font-bold rounded-lg",
              "bg-bg-surface border-2 text-fg-primary",
              "transition-all duration-150 focus:outline-none",
              digit
                ? "border-green shadow-[0_0_8px_rgba(0,224,90,0.2)]"
                : "border-border",
              "focus:border-green focus:shadow-[0_0_0_3px_rgba(0,224,90,0.12)]",
              status === "error" && "border-error",
              isLoading && "opacity-60 cursor-not-allowed",
            )}
          />
        ))}
      </div>

      {/* Error message */}
      {status === "error" && errorMsg && (
        <p role="alert" className="text-xs text-error font-body text-center">
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isComplete || isLoading}
        className={cn(
          "w-full min-h-[52px] rounded-lg font-body font-bold text-sm tracking-wide",
          "inline-flex items-center justify-center gap-2 transition-all duration-150",
          "bg-green text-bg-base hover:bg-green-electric",
          "shadow-[0_0_12px_rgba(0,224,90,0.25)] hover:shadow-[0_0_20px_rgba(0,224,90,0.38)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
        )}
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Verifying…
          </>
        ) : (
          <>
            Verify Code
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>

      {/* Resend */}
      <div className="text-center">
        {cooldown > 0 ? (
          <p className="font-body text-xs text-fg-muted">
            Resend available in{" "}
            <span className="text-fg-secondary font-semibold">{cooldown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="font-body text-xs text-fg-muted hover:text-green transition-colors disabled:opacity-50 inline-flex items-center gap-1"
          >
            <RotateCcw size={12} aria-hidden="true" />
            {status === "resending" ? "Resending…" : "Resend code"}
          </button>
        )}
      </div>
    </form>
  );
}
