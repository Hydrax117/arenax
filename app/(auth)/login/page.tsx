import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your ArenaX account with a one-time code.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <Link href="/" className="inline-block focus-visible:outline-none">
          <span className="font-heading font-black text-3xl tracking-[0.15em] text-green glow-green">
            ARENA<span className="text-fg-primary">X</span>
          </span>
        </Link>
        <p className="font-body text-sm text-fg-muted mt-2">
          Nigeria&apos;s eFootball arena
        </p>
      </div>

      <div className="glass-green rounded-2xl p-7">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-xl text-fg-primary">
            Sign In
          </h1>
          <p className="font-body text-sm text-fg-muted mt-1">
            Enter your email to receive a one-time sign-in code.
          </p>
        </div>

        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="text-center font-body text-sm text-fg-muted">
        New to ArenaX?{" "}
        <Link
          href="/register"
          className="text-green hover:text-green-electric transition-colors font-semibold"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-4 w-28 rounded bg-bg-surface" />
        <div className="h-12 rounded-lg bg-bg-surface" />
      </div>
      <div className="h-[52px] rounded-lg bg-bg-surface" />
    </div>
  );
}
