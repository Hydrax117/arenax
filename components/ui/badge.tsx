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
  new:      "bg-[rgba(0,224,90,0.10)] text-green border-[rgba(0,224,90,0.28)]",
  featured: "bg-[rgba(0,208,255,0.10)] text-info border-[rgba(0,208,255,0.28)]",
  soldout:  "bg-[rgba(255,59,48,0.10)] text-error border-[rgba(255,59,48,0.28)]",
  vip:      "bg-[rgba(123,34,212,0.12)] text-purple border-[rgba(123,34,212,0.32)]",
  success:  "bg-[rgba(0,224,90,0.10)] text-green border-[rgba(0,224,90,0.25)]",
  warning:  "bg-[rgba(255,184,0,0.10)] text-warning border-[rgba(255,184,0,0.25)]",
  error:    "bg-[rgba(255,59,48,0.10)] text-error border-[rgba(255,59,48,0.25)]",
  info:     "bg-[rgba(0,208,255,0.10)] text-info border-[rgba(0,208,255,0.25)]",
  neutral:  "bg-[rgba(255,255,255,0.05)] text-fg-secondary border-[rgba(255,255,255,0.08)]",
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
