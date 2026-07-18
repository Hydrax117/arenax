import Link from "next/link";
import { ArrowRight, Timer } from "lucide-react";

export function CtaBanner() {
  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-2xl">
          {/* Background gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,224,90,0.08) 0%, rgba(138,43,226,0.08) 50%, rgba(10,10,10,0) 100%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 border border-[rgba(0,224,90,0.15)] rounded-2xl"
            aria-hidden="true"
          />

          {/* Corner glows */}
          <div
            className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(0,224,90,0.08) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(138,43,226,0.1) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-12">
            {/* Left — text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-[rgba(0,224,90,0.15)] bg-[rgba(0,224,90,0.05)]">
                <Timer size={12} className="text-green" aria-hidden="true" />
                <span className="font-body text-xs text-green font-semibold tracking-widest uppercase">
                  Next tournament starts soon
                </span>
              </div>
              <h2
                id="cta-heading"
                className="font-heading font-black text-3xl sm:text-4xl text-fg-primary leading-tight"
              >
                READY TO <span className="gradient-text">COMPETE?</span>
              </h2>
              <p className="font-body text-fg-secondary mt-3 text-base max-w-md mx-auto lg:mx-0">
                Join hundreds of Nigerian players. Register free, pay only for
                premium tournaments, win real Naira.
              </p>
            </div>

            {/* Right — countdown + CTA */}
            <div className="flex flex-col items-center gap-6 shrink-0">
              {/* Countdown display */}
              <div className="flex items-center gap-3">
                {[
                  { value: "02", label: "Days" },
                  { value: "14", label: "Hrs" },
                  { value: "36", label: "Mins" },
                  { value: "25", label: "Secs" },
                ].map(({ value, label }, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="glass-green rounded-lg w-14 h-14 flex items-center justify-center">
                        <span className="font-heading font-black text-xl text-fg-primary">
                          {value}
                        </span>
                      </div>
                      <span className="font-body text-[10px] text-fg-muted mt-1 uppercase tracking-widest">
                        {label}
                      </span>
                    </div>
                    {i < 3 && (
                      <span
                        className="font-heading font-black text-green text-lg mb-4"
                        aria-hidden="true"
                      >
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Event starts in label */}
              <p className="font-body text-xs text-fg-muted uppercase tracking-widest -mt-2">
                Event Starts In
              </p>

              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-10 rounded-lg font-body font-bold text-base tracking-wide bg-green text-bg-base hover:bg-green-electric transition-all duration-150 shadow-[0_0_24px_rgba(0,224,90,0.28)] hover:shadow-[0_0_40px_rgba(0,224,90,0.42)] w-full"
              >
                Create Account
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

