"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";

interface Props {
  tournamentId: string;
  entryFee: number; // kobo
  isFull: boolean;
}

export function RegisterButton({ tournamentId, entryFee, isFull }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isFree = entryFee === 0;

  if (isFull) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-fg-muted font-body text-sm font-semibold cursor-not-allowed">
        Tournament Full
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="h-12 w-40 rounded-lg bg-bg-surface animate-pulse" />
    );
  }

  // Not logged in — redirect to login
  if (!session?.user) {
    return (
      <a
        href={`/login?redirect=/tournaments/${tournamentId}`}
        className={cn(
          "inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-lg",
          "font-body font-bold text-sm tracking-wide transition-all duration-150",
          "bg-green text-bg-base hover:bg-green-electric",
          "shadow-[0_0_12px_rgba(0,224,90,0.25)]",
        )}
      >
        Sign In to Register
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    );
  }

  if (success) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[rgba(0,224,90,0.10)] border border-[rgba(0,224,90,0.25)] text-green font-body text-sm font-semibold">
        <CheckCircle2 size={16} aria-hidden="true" />
        Registered!
      </div>
    );
  }

  async function handleRegister() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: "POST",
      });
      const data = (await res.json()) as { success: boolean; message?: string };

      if (!data.success) {
        setError(data.message ?? "Registration failed.");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleRegister}
        disabled={loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-lg",
          "font-body font-bold text-sm tracking-wide transition-all duration-150",
          "bg-green text-bg-base hover:bg-green-electric",
          "shadow-[0_0_12px_rgba(0,224,90,0.25)] hover:shadow-[0_0_20px_rgba(0,224,90,0.38)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
        )}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Registering…
          </>
        ) : (
          <>
            {isFree ? "Register Free" : `Register · ${formatNaira(entryFee / 100)}`}
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="text-xs text-error font-body">
          {error}
        </p>
      )}
    </div>
  );
}
