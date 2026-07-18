"use client";

import { Suspense } from "react";
import { OnboardingForm } from "./onboarding-form";

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-bg-surface" />
          <div className="h-12 rounded-lg bg-bg-surface" />
        </div>
      ))}
      <div className="h-[52px] rounded-lg bg-bg-surface" />
    </div>
  );
}

export function OnboardingFormWrapper() {
  return (
    <Suspense fallback={<Skeleton />}>
      <OnboardingForm />
    </Suspense>
  );
}
