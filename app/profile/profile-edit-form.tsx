"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Gamepad2, MapPin, Phone, Building2, CreditCard,
  Loader2, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NIGERIAN_STATES } from "@/lib/constants";
import type { Profile } from "@/types/database";

const schema = z.object({
  gamertag: z
    .string()
    .min(3, "At least 3 characters")
    .max(20, "20 characters max")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
  efootball_username: z.string().min(1, "Required").max(50),
  nigerian_state:     z.string().min(1, "Please select your state"),
  phone:              z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_name:           z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ApiResponse {
  success: boolean;
  message?: string;
  field?: string;
}

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      gamertag:            profile.gamertag ?? "",
      efootball_username:  profile.efootball_username ?? "",
      nigerian_state:      profile.nigerian_state ?? "",
      phone:               profile.phone ?? "",
      bank_account_number: profile.bank_account_number ?? "",
      bank_name:           profile.bank_name ?? "",
    },
  });

  async function onSubmit(data: FormData) {
    setServerError("");
    setSaved(false);

    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = (await res.json()) as ApiResponse;

    if (!json.success) {
      if (json.field) {
        setError(json.field as keyof FormData, { message: json.message });
      } else {
        setServerError(json.message ?? "Something went wrong.");
      }
      return;
    }

    setSaved(true);
    router.refresh(); // re-fetch server component data
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="glass rounded-2xl p-6 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Gamertag */}
        <Field label="Gamertag" required error={errors.gamertag?.message} icon={<User size={14} />}>
          <input
            {...register("gamertag")}
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={inputCls(!!errors.gamertag)}
          />
        </Field>

        {/* eFootball username */}
        <Field label="eFootball Username" required error={errors.efootball_username?.message} icon={<Gamepad2 size={14} />}>
          <input
            {...register("efootball_username")}
            type="text"
            autoCapitalize="none"
            className={inputCls(!!errors.efootball_username)}
          />
        </Field>

        {/* State */}
        <Field label="State" required error={errors.nigerian_state?.message} icon={<MapPin size={14} />}>
          <select
            {...register("nigerian_state")}
            className={cn(inputCls(!!errors.nigerian_state), "cursor-pointer")}
          >
            <option value="" disabled>Select…</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        {/* Phone */}
        <Field label="Phone Number" hint="Nigerian number" error={errors.phone?.message} icon={<Phone size={14} />}>
          <input
            {...register("phone")}
            type="tel"
            inputMode="tel"
            placeholder="08012345678"
            className={inputCls(!!errors.phone)}
          />
        </Field>

        {/* Bank account */}
        <Field label="Bank Account Number" hint="For prize payouts" error={errors.bank_account_number?.message} icon={<CreditCard size={14} />}>
          <input
            {...register("bank_account_number")}
            type="text"
            inputMode="numeric"
            placeholder="0123456789"
            className={inputCls(!!errors.bank_account_number)}
          />
        </Field>

        {/* Bank name */}
        <Field label="Bank Name" hint="e.g. GTBank, Access" error={errors.bank_name?.message} icon={<Building2 size={14} />}>
          <input
            {...register("bank_name")}
            type="text"
            placeholder="GTBank"
            className={inputCls(!!errors.bank_name)}
          />
        </Field>
      </div>

      {serverError && (
        <p role="alert" className="text-xs text-error font-body">{serverError}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className={cn(
            "inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-lg",
            "font-body font-bold text-sm tracking-wide transition-all duration-150",
            "bg-green text-bg-base hover:bg-green-electric",
            "shadow-[0_0_12px_rgba(0,224,90,0.25)] hover:shadow-[0_0_20px_rgba(0,224,90,0.38)]",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
          )}
        >
          {isSubmitting ? (
            <><Loader2 size={15} className="animate-spin" aria-hidden="true" />Saving…</>
          ) : (
            "Save Changes"
          )}
        </button>

        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-green font-body">
            <CheckCircle2 size={15} aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return cn(
    "w-full min-h-[44px] pl-9 pr-4 py-2.5 rounded-lg text-sm font-body",
    "bg-bg-surface border text-fg-primary placeholder:text-fg-muted",
    "transition-all duration-150 appearance-none",
    "focus:outline-none focus:border-green",
    "focus:shadow-[0_0_0_3px_rgba(0,224,90,0.12)]",
    hasError ? "border-error" : "border-border",
  );
}

function Field({
  label, hint, required, error, icon, children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-sm font-medium text-fg-secondary">
        {label}
        {required && <span className="text-green ml-1 text-xs" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" aria-hidden="true">
          {icon}
        </span>
        {children}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-error font-body">{error}</p>
      ) : hint ? (
        <p className="text-xs text-fg-muted font-body">{hint}</p>
      ) : null}
    </div>
  );
}
