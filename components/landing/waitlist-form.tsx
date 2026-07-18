"use client";

import { useState, useId } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error" | "duplicate";

interface ApiResponse {
  success: boolean;
  message: string;
  position?: number;
}

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState<number | null>(null);
  const emailId = useId();
  const nameId = useId();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });

      const data = (await res.json()) as ApiResponse;

      if (res.status === 409) {
        setStatus("duplicate");
        setMessage(data.message);
        return;
      }

      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(data.message);
      setPosition(data.position ?? null);
      setEmail("");
      setName("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(0,224,90,0.10)] border border-[rgba(0,224,90,0.25)]">
          <CheckCircle2 size={28} className="text-green" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading font-bold text-lg text-fg-primary">
            You&apos;re on the list!
          </p>
          <p className="font-body text-sm text-fg-secondary mt-1 max-w-sm">
            {message}
          </p>
          {position && (
            <p className="font-body text-xs text-fg-muted mt-2">
              You&apos;re{" "}
              <span className="text-green font-semibold">
                #{position}
              </span>{" "}
              on the waitlist.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="font-body text-xs text-fg-muted hover:text-green transition-colors underline underline-offset-2"
        >
          Submit another email
        </button>
      </div>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="w-full space-y-4">
      {/* Name (optional) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={nameId}
          className="font-body text-sm font-medium text-fg-secondary"
        >
          Name <span className="text-fg-muted">(optional)</span>
        </label>
        <input
          id={nameId}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          maxLength={80}
          className={cn(
            "w-full min-h-[48px] rounded-lg px-4 py-3 text-sm font-body",
            "bg-bg-surface border border-border text-fg-primary placeholder:text-fg-muted",
            "transition-all duration-150",
            "focus:outline-none focus:border-green",
            "focus:shadow-[0_0_0_3px_rgba(0,224,90,0.12),0_0_10px_rgba(0,224,90,0.15)]",
          )}
        />
      </div>

      {/* Email (required) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={emailId}
          className="font-body text-sm font-medium text-fg-secondary"
        >
          Email address <span className="text-green text-xs">*</span>
        </label>
        <input
          id={emailId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          inputMode="email"
          className={cn(
            "w-full min-h-[48px] rounded-lg px-4 py-3 text-sm font-body",
            "bg-bg-surface border border-border text-fg-primary placeholder:text-fg-muted",
            "transition-all duration-150",
            "focus:outline-none focus:border-green",
            "focus:shadow-[0_0_0_3px_rgba(0,224,90,0.12),0_0_10px_rgba(0,224,90,0.15)]",
            (status === "error") &&
              "border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(255,59,48,0.12)]",
          )}
          aria-describedby={
            status === "error" || status === "duplicate"
              ? "waitlist-feedback"
              : undefined
          }
          aria-invalid={status === "error"}
        />
      </div>

      {/* Feedback message */}
      {(status === "error" || status === "duplicate") && message && (
        <div
          id="waitlist-feedback"
          role="alert"
          className={cn(
            "flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs font-body",
            status === "duplicate"
              ? "bg-[rgba(0,224,90,0.08)] border border-[rgba(0,224,90,0.2)] text-green"
              : "bg-[rgba(255,59,48,0.08)] border border-[rgba(255,59,48,0.2)] text-error",
          )}
        >
          <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
        className={cn(
          "w-full min-h-[52px] rounded-lg font-body font-bold text-sm tracking-wide",
          "inline-flex items-center justify-center gap-2",
          "transition-all duration-150",
          "bg-green text-bg-base",
          "hover:bg-green-electric",
          "shadow-[0_0_12px_rgba(0,224,90,0.25)] hover:shadow-[0_0_20px_rgba(0,224,90,0.38)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
        )}
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Joining…
          </>
        ) : (
          <>
            Join the Waitlist
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>

      <p className="font-body text-[11px] text-fg-muted text-center">
        No spam. Just a heads-up when ArenaX goes live.
      </p>
    </form>
  );
}
