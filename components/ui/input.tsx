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
  (
    { label, error, hint, leftIcon, rightIcon, className, id, ...props },
    ref,
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const inputId = id ?? React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-fg-primary font-body"
          >
            {label}
            {props.required && (
              <span className="text-green ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              // Base — matches design "Input Field" and "Focused" states
              "w-full min-h-[44px] rounded-lg px-4 py-2.5",
              "bg-bg-surface border border-border",
              "text-fg-primary placeholder:text-fg-muted text-sm",
              "font-body transition-all duration-150",
              // Focused state — green border + glow (matches design exactly)
              "focus:outline-none focus:border-green",
              "focus:shadow-[0_0_0_3px_rgba(0,224,90,0.10),0_0_12px_rgba(0,224,90,0.15)]",
              // Error state
              error &&
                "border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(255,59,48,0.15)]",
              // Disabled
              "disabled:opacity-40 disabled:cursor-not-allowed",
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
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-error font-body"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-fg-muted font-body">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

