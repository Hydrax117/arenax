import type { Metadata } from "next";
import { OnboardingFormWrapper } from "./onboarding-form-wrapper";

export const metadata: Metadata = {
  title: "Set Up Your Profile",
  description: "Complete your ArenaX player profile to start competing.",
};

export default function OnboardingPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <span className="font-heading font-black text-3xl tracking-[0.15em] text-green glow-green">
          ARENA<span className="text-fg-primary">X</span>
        </span>
        <p className="font-body text-sm text-fg-muted mt-2">
          One last step before you compete
        </p>
      </div>

      {/* Card */}
      <div className="glass-green rounded-2xl p-7">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-xl text-fg-primary">
            Set Up Your Profile
          </h1>
          <p className="font-body text-sm text-fg-muted mt-1">
            This is how other players will identify you in tournaments.
          </p>
        </div>

        <OnboardingFormWrapper />
      </div>
    </div>
  );
}
