import { UserPlus, Search, Gamepad2, Upload, Trophy } from "lucide-react";

// Req 3 — "How It Works": register, join, play, submit, win
const STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register",
    description:
      "Sign up with your Nigerian phone number. Verify with OTP and build your player profile with your gamertag and eFootball username.",
  },
  {
    icon: Search,
    step: "02",
    title: "Join a Tournament",
    description:
      "Browse open Cup or League tournaments. Pay the entry fee securely via Paystack, or join free events — instantly confirmed.",
  },
  {
    icon: Gamepad2,
    step: "03",
    title: "Play Your Matches",
    description:
      "Your bracket or fixture is auto-generated. Find your opponent's gamertag, challenge them in eFootball Mobile, and play.",
  },
  {
    icon: Upload,
    step: "04",
    title: "Submit Results",
    description:
      "Enter the final score and upload a screenshot as proof. Scores matched by both players are auto-verified instantly.",
  },
  {
    icon: Trophy,
    step: "05",
    title: "Win Prizes",
    description:
      "Climb the standings and win. Prizes are transferred directly to your Nigerian bank account via Paystack.",
  },
];

export function HowItWorks() {
  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-dark"
      aria-labelledby="hiw-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* ── Header ── */}
        <div className="text-center mb-16">
          <p className="font-body text-xs text-green font-semibold tracking-widest uppercase mb-3">
            Simple Process
          </p>
          <h2
            id="hiw-heading"
            className="font-heading font-black text-3xl sm:text-4xl text-fg-primary"
          >
            HOW IT <span className="gradient-text">WORKS</span>
          </h2>
          <p className="font-body text-fg-muted mt-3 text-sm max-w-lg mx-auto">
            From registration to prize payout in five easy steps. No complex
            setup — just play.
          </p>
        </div>

        {/* ── Steps ── */}
        <ol className="relative list-none">
          {/* Connecting line (desktop) */}
          <div
            className="hidden lg:block absolute top-10 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--border) 10%, var(--border) 90%, transparent 100%)",
            }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {STEPS.map(({ icon: Icon, step, title, description }, i) => (
              <li key={step} className="flex flex-col items-center text-center lg:items-center group">
                {/* Icon circle */}
                <div className="relative z-10 mb-5">
                  <div className="w-20 h-20 rounded-full bg-bg-surface border-2 border-border group-hover:border-green transition-colors duration-250 flex items-center justify-center shadow-[0_0_0_6px_var(--bg-dark)]">
                    <Icon
                      size={28}
                      className="text-green group-hover:scale-110 transition-transform duration-250"
                      aria-hidden="true"
                    />
                  </div>
                  {/* Step number */}
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green text-bg-base font-heading font-black text-[10px] flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>

                {/* Text */}
                <h3 className="font-heading font-bold text-sm text-fg-primary tracking-wide mb-2">
                  {title}
                </h3>
                <p className="font-body text-xs text-fg-muted leading-relaxed max-w-[200px]">
                  {description}
                </p>
              </li>
            ))}
          </div>
        </ol>
      </div>
    </section>
  );
}

