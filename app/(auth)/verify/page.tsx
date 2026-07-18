import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyForm } from "./verify-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Enter Code",
  description: "Enter your one-time sign-in code.",
};

export default function VerifyPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Logo */}
      <div className="text-center">
        <Link href="/" className="inline-block focus-visible:outline-none">
          <span className="font-heading font-black text-3xl tracking-[0.15em] text-green glow-green">
            ARENA<span className="text-fg-primary">X</span>
          </span>
        </Link>
      </div>

      {/* Card */}
      <div className="glass-green rounded-2xl p-7">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-xl text-fg-primary">
            Check your email
          </h1>
          <p className="font-body text-sm text-fg-muted mt-1">
            We sent a 6-digit code. It expires in 10 minutes.
          </p>
        </div>

        <Suspense fallback={<VerifyFormSkeleton />}>
          <VerifyForm />
        </Suspense>
      </div>

      <p className="text-center font-body text-sm text-fg-muted">
        Wrong email?{" "}
        <Link
          href="/login"
          className="text-green hover:text-green-electric transition-colors font-semibold"
        >
          Go back
        </Link>
      </p>
    </div>
  );
}

function VerifyFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 w-48 rounded bg-bg-surface mx-auto" />
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-11 h-14 rounded-lg bg-bg-surface" />
        ))}
      </div>
      <div className="h-[52px] rounded-lg bg-bg-surface" />
    </div>
  );
}
