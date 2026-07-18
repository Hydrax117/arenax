import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Variants match the design spec badge examples:
   * new | featured | soldout | vip | success | warning | error | neutral
   */
  variant?:
    | "new"
    | "featured"
    | "soldout"
    | "vip"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "neutral";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  // ── Design spec badges ──────────────────────────────────────────────────
  new: "bg-[rgba(0,255,102,0.12)] text-green border-[rgba(0,255,102,0.35)]",
  featured:
    "bg-[rgba(0,208,255,0.12)] text-info border-[rgba(0,208,255,0.35)]",
  soldout:
    "bg-[rgba(255,59,48,0.12)] text-error border-[rgba(255,59,48,0.35)]",
  vip: "bg-[rgba(138,43,226,0.15)] text-purple border-[rgba(138,43,226,0.4)]",

  // ── Semantic ─────────────────────────────────────────────────────────────
  success:
    "bg-[rgba(0,255,102,0.12)] text-green border-[rgba(0,255,102,0.3)]",
  warning:
    "bg-[rgba(255,184,0,0.12)] text-warning border-[rgba(255,184,0,0.3)]",
  error:
    "bg-[rgba(255,59,48,0.12)] text-error border-[rgba(255,59,48,0.3)]",
  info: "bg-[rgba(0,208,255,0.12)] text-info border-[rgba(0,208,255,0.3)]",
  neutral:
    "bg-[rgba(255,255,255,0.06)] text-fg-secondary border-[rgba(255,255,255,0.1)]",
};

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5",
        "text-xs font-semibold font-body tracking-widest uppercase",
        "rounded-sm border",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
