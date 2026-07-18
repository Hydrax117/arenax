"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "error";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await res.json()) as { success: boolean; message: string };

      if (!data.success) {
        setStatus("error");
        setErrorMsg(data.message);
        return;
      }

      // Navigate to verify page, carrying email + redirect destination
      const params = new URLSearchParams({
        email: email.trim(),
        redirect,
      });
      router.push(`/verify?${params.toString()}`);
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="font-body text-sm font-medium text-fg-secondary"
        >
          Email address
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            inputMode="email"
            autoFocus
            className={cn(
              "w-full min-h-[48px] pl-9 pr-4 py-3 rounded-lg text-sm font-body",
              "bg-bg-surface border border-border text-fg-primary placeholder:text-fg-muted",
              "transition-all duration-150",
              "focus:outline-none focus:border-green",
              "focus:shadow-[0_0_0_3px_rgba(0,224,90,0.12),0_0_10px_rgba(0,224,90,0.15)]",
              status === "error" && "border-error focus:border-error",
            )}
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? "email-error" : undefined}
          />
        </div>

        {status === "error" && errorMsg && (
          <p
            id="email-error"
            role="alert"
            className="text-xs text-error font-body"
          >
            {errorMsg}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
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
            Sending code…
          </>
        ) : (
          <>
            Continue
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>

      <p className="text-center font-body text-xs text-fg-muted">
        We&apos;ll send a 6-digit code to your inbox. No password needed.
      </p>
    </form>
  );
}
