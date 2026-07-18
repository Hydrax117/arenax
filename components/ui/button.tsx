import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant — matches the design spec button examples */
  variant?: "primary" | "outline" | "ghost" | "danger" | "gaming";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  /** Optional left-side icon */
  iconLeft?: React.ReactNode;
  /** Optional right-side icon */
  iconRight?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  // ── Primary — neon green fill (design: "Primary Button") ──
  primary: [
    "bg-green text-bg-base font-semibold",
    "hover:bg-green-electric active:scale-[0.97]",
    "shadow-[0_0_16px_rgba(0,255,102,0.4)]",
    "hover:shadow-[0_0_28px_rgba(0,255,102,0.6)]",
    "transition-all",
  ].join(" "),

  // ── Outline — green border (design: "Hover State" / secondary CTA) ──
  outline: [
    "border border-green text-green bg-transparent",
    "hover:bg-[rgba(0,255,102,0.08)] active:scale-[0.97]",
    "shadow-[0_0_8px_rgba(0,255,102,0.15)]",
    "hover:shadow-[0_0_16px_rgba(0,255,102,0.3)]",
    "transition-all",
  ].join(" "),

  // ── Ghost — no border (design: "Ghost Button") ──
  ghost: [
    "text-fg-secondary bg-transparent border border-border",
    "hover:text-fg-primary hover:border-border-light active:scale-[0.97]",
    "transition-all",
  ].join(" "),

  // ── Danger ──
  danger: [
    "bg-error text-white font-semibold",
    "hover:brightness-110 active:scale-[0.97]",
    "transition-all",
  ].join(" "),

  // ── Gaming gradient — primary + purple (design: "Gaming Gradient") ──
  gaming: [
    "text-white font-semibold",
    "bg-[linear-gradient(135deg,#00ff66_0%,#8a2be2_100%)]",
    "hover:brightness-110 active:scale-[0.97]",
    "shadow-[0_0_20px_rgba(0,255,102,0.3)]",
    "transition-all",
  ].join(" "),
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-sm rounded-md gap-1.5",
  md: "h-11 px-5 text-sm rounded-lg gap-2",    // 44px = min touch target (Req 16)
  lg: "h-[52px] px-7 text-base rounded-lg gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft,
  iconRight,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-body font-medium",
        "cursor-pointer select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none",
        "min-h-[44px] min-w-[44px]", // Req 16 — 44×44 touch targets
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <ButtonSpinner />
          <span>{children}</span>
        </>
      ) : (
        <>
          {iconLeft && (
            <span className="shrink-0" aria-hidden="true">
              {iconLeft}
            </span>
          )}
          {children}
          {iconRight && (
            <span className="shrink-0" aria-hidden="true">
              {iconRight}
            </span>
          )}
        </>
      )}
    </button>
  );
}

function ButtonSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
