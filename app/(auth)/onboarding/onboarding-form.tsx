"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, User, Gamepad2, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { NIGERIAN_STATES } from "@/lib/constants";

// ── Validation schema (mirrors API) ─────────────────────────────────────────
const schema = z.object({
  gamertag: z
    .string()
    .min(3, "Must be at least 3 characters")
    .max(20, "Must be 20 characters or fewer")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Letters, numbers and underscores only",
    ),
  efootball_username: z
    .string()
    .min(1, "eFootball username is required")
    .max(50, "Too long"),
  nigerian_state: z.string().min(1, "Please select your state"),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ApiResponse {
  success: boolean;
  message?: string;
  field?: string;
}

export function OnboardingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError("");

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as ApiResponse;

      if (!json.success) {
        // Field-level server error (e.g. duplicate gamertag)
        if (json.field && json.field in data) {
          setError(json.field as keyof FormData, {
            message: json.message,
          });
        } else {
          setServerError(json.message ?? "Something went wrong.");
        }
        return;
      }

      router.push(redirect);
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* Gamertag */}
      <Field
        label="Gamertag"
        hint="3–20 characters, letters/numbers/underscores"
        required
        error={errors.gamertag?.message}
        icon={<User size={15} />}
      >
        <input
          {...register("gamertag")}
          type="text"
          placeholder="e.g. NaijaBaller99"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={inputClass(!!errors.gamertag)}
        />
      </Field>

      {/* eFootball Username */}
      <Field
        label="eFootball Mobile Username"
        hint="Your in-game display name"
        required
        error={errors.efootball_username?.message}
        icon={<Gamepad2 size={15} />}
      >
        <input
          {...register("efootball_username")}
          type="text"
          placeholder="Your eFootball username"
          autoCapitalize="none"
          className={inputClass(!!errors.efootball_username)}
        />
      </Field>

      {/* Nigerian State */}
      <Field
        label="State"
        required
        error={errors.nigerian_state?.message}
        icon={<MapPin size={15} />}
      >
        <select
          {...register("nigerian_state")}
          className={cn(inputClass(!!errors.nigerian_state), "cursor-pointer")}
          defaultValue=""
        >
          <option value="" disabled>
            Select your state…
          </option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      {/* Phone (optional) */}
      <Field
        label="Phone Number"
        hint="Optional — Nigerian number (e.g. 08012345678)"
        error={errors.phone?.message}
        icon={<Phone size={15} />}
      >
        <input
          {...register("phone")}
          type="tel"
          placeholder="08012345678"
          inputMode="tel"
          className={inputClass(!!errors.phone)}
        />
      </Field>

      {/* Server error */}
      {serverError && (
        <p role="alert" className="text-xs text-error font-body text-center">
          {serverError}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full min-h-[52px] rounded-lg font-body font-bold text-sm tracking-wide",
          "inline-flex items-center justify-center gap-2 transition-all duration-150",
          "bg-green text-bg-base hover:bg-green-electric",
          "shadow-[0_0_12px_rgba(0,224,90,0.25)] hover:shadow-[0_0_20px_rgba(0,224,90,0.38)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Saving…
          </>
        ) : (
          <>
            Enter the Arena
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}

// ── Shared field wrapper ─────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
  return cn(
    "w-full min-h-[48px] pl-9 pr-4 py-3 rounded-lg text-sm font-body",
    "bg-bg-surface border text-fg-primary placeholder:text-fg-muted",
    "transition-all duration-150 appearance-none",
    "focus:outline-none focus:border-green",
    "focus:shadow-[0_0_0_3px_rgba(0,224,90,0.12),0_0_10px_rgba(0,224,90,0.15)]",
    hasError
      ? "border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(255,59,48,0.12)]"
      : "border-border",
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, hint, required, error, icon, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-sm font-medium text-fg-secondary">
        {label}
        {required && (
          <span className="text-green ml-1 text-xs" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
          aria-hidden="true"
        >
          {icon}
        </span>
        {children}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-error font-body">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-fg-muted font-body">{hint}</p>
      ) : null}
    </div>
  );
}
