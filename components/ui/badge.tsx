import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "cyan" | "purple" | "success" | "warning" | "error" | "neutral";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  cyan: "bg-[rgba(0,212,255,0.12)] text-cyan border-[rgba(0,212,255,0.3)]",
  purple:
    "bg-[rgba(123,0,255,0.12)] text-purple border-[rgba(123,0,255,0.3)]",
  success:
    "bg-[rgba(0,255,136,0.12)] text-success border-[rgba(0,255,136,0.3)]",
  warning:
    "bg-[rgba(255,170,0,0.12)] text-warning border-[rgba(255,170,0,0.3)]",
  error: "bg-[rgba(255,51,102,0.12)] text-error border-[rgba(255,51,102,0.3)]",
  neutral:
    "bg-[rgba(255,255,255,0.06)] text-foreground-muted border-[rgba(255,255,255,0.1)]",
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
        "text-xs font-semibold font-body tracking-wide",
        "rounded-full border",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
