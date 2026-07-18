import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground font-body"
          >
            {label}
            {props.required && (
              <span className="text-cyan ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              // Base
              "w-full min-h-[44px] rounded-lg px-4 py-2.5 text-base",
              "bg-[rgba(255,255,255,0.04)] border border-[rgba(0,212,255,0.15)]",
              "text-foreground placeholder:text-foreground-muted",
              "font-body transition-all duration-150",
              // Focus
              "focus:outline-none focus:border-cyan focus:bg-[rgba(0,212,255,0.06)]",
              "focus:shadow-[0_0_0_3px_rgba(0,212,255,0.15)]",
              // Error
              error &&
                "border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(255,51,102,0.15)]",
              // Disabled
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Icon padding
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                  ? `${inputId}-hint`
                  : undefined
            }
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-error" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-foreground-muted">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
