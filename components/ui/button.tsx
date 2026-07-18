import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: [
    "bg-cyan text-[#0a0a0f] font-semibold",
    "hover:brightness-110 active:scale-95",
    "shadow-[0_0_15px_rgba(0,212,255,0.4)]",
    "hover:shadow-[0_0_25px_rgba(0,212,255,0.6)]",
  ].join(" "),

  secondary: [
    "bg-purple text-white font-semibold",
    "hover:brightness-110 active:scale-95",
    "shadow-[0_0_15px_rgba(123,0,255,0.4)]",
    "hover:shadow-[0_0_25px_rgba(123,0,255,0.6)]",
  ].join(" "),

  outline: [
    "border border-[rgba(0,212,255,0.4)] text-cyan bg-transparent",
    "hover:bg-[rgba(0,212,255,0.08)] active:scale-95",
  ].join(" "),

  ghost: [
    "text-foreground-muted bg-transparent",
    "hover:text-foreground hover:bg-[rgba(255,255,255,0.06)] active:scale-95",
  ].join(" "),

  danger: [
    "bg-error text-white font-semibold",
    "hover:brightness-110 active:scale-95",
  ].join(" "),
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-sm rounded-md",
  md: "h-11 px-6 text-base rounded-lg",
  lg: "h-[52px] px-8 text-lg rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        // Base — meets 44px touch target (Req 16)
        "inline-flex items-center justify-center gap-2 font-body",
        "transition-all duration-150 cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        "min-h-[44px] min-w-[44px]",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

function Spinner() {
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
