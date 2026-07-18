import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** default = dark surface, green = green neon border, hover = lift on hover */
  variant?: "default" | "green" | "hover";
  noPadding?: boolean;
}

const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "glass",
  green: "glass-green",
  hover: "glass card-hover cursor-pointer",
};

export function Card({
  variant = "default",
  noPadding = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(variantClasses[variant], !noPadding && "p-5 md:p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-heading text-base font-semibold text-fg-primary tracking-wide",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-fg-muted mt-1 font-body", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-4 pt-4 border-t border-border flex items-center gap-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

