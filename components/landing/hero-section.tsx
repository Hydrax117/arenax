import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="relative min-h-[92svh] flex items-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Ambient backgrounds */}
      <div className="absolute inset-0 bg-bg-base" aria-hidden="true" />
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,224,90,0.06) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(138,43,226,0.06) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #00e05a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">

          {/* Left — text */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-tight mb-6">
              <span className="text-fg-primary">THE ARENA</span>
              <br />
              <span className="gradient-text glow-green">AWAITS YOU</span>
            </h1>

            <p className="font-body text-lg sm:text-xl text-fg-secondary leading-relaxed mb-4 max-w-xl mx-auto lg:mx-0">
              Epic events. Unforgettable moments.
            </p>
            <p className="font-body text-base text-fg-muted leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
              Discover eFootball Mobile tournaments, compete against the best Nigerian players,
              and win real Naira prizes — straight to your bank account.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/tournaments"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 rounded-lg font-body font-bold text-base tracking-wide bg-green text-bg-base hover:bg-green-electric transition-all duration-150 shadow-[0_0_24px_rgba(0,224,90,0.28)] hover:shadow-[0_0_36px_rgba(0,224,90,0.42)]"
              >
                Explore Events
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              {/* Smooth-scroll anchor to the waitlist section */}
              <Link
                href="/#waitlist"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 rounded-lg font-body font-semibold text-base tracking-wide border border-border text-fg-secondary hover:border-green hover:text-green transition-all duration-150"
              >
                Join the Waitlist
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap gap-6 justify-center lg:justify-start">
              {[
                { value: "500+", label: "Active Players" },
                { value: "₦2M+", label: "Prizes Paid" },
                { value: "50+", label: "Tournaments Run" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center lg:items-start">
                  <span className="font-heading font-black text-2xl text-green glow-green">{value}</span>
                  <span className="font-body text-xs text-fg-muted tracking-widest uppercase">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative card */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <HeroCard />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg-base))" }}
        aria-hidden="true"
      />
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-2xl blur-3xl opacity-20 pointer-events-none"
        style={{ background: "var(--gradient-gaming)" }}
        aria-hidden="true"
      />

      <div className="relative glass-green rounded-2xl overflow-hidden">
        {/* Card image area */}
        <div
          className="h-48 w-full relative flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0d1f15 0%, #0a1a2e 50%, #140a1f 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "linear-gradient(rgba(0,224,90,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(0,224,90,0.22) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
            aria-hidden="true"
          />
          <div className="relative text-center">
            <p className="font-heading font-black text-4xl text-green glow-green tracking-widest">
              ARENA<span className="text-fg-primary">X</span>
            </p>
            <p className="font-body text-xs text-fg-muted mt-1 tracking-widest uppercase">Championship Finals</p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center bg-bg-surface border border-border rounded-lg px-3 py-2 min-w-[52px]">
              <span className="font-body text-xs text-green uppercase tracking-widest">AUG</span>
              <span className="font-heading font-black text-2xl text-fg-primary leading-none">15</span>
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-base text-fg-primary leading-snug">
                ArenaX Championship Finals
              </h3>
              <p className="font-body text-xs text-fg-muted mt-0.5 flex items-center gap-1">
                <span aria-hidden="true">📍</span> Lagos Convention Centre
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-body text-xs text-fg-muted uppercase tracking-wider">Prize Pool</p>
              <p className="font-heading font-black text-xl text-green glow-green">₦50,000</p>
            </div>
            <div className="text-right">
              <p className="font-body text-xs text-fg-muted uppercase tracking-wider">Format</p>
              <p className="font-body text-sm text-fg-secondary font-semibold">Cup · 32 Slots</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between mb-1.5">
              <span className="font-body text-xs text-fg-muted">24 / 32 slots filled</span>
              <span className="font-body text-xs text-green font-semibold">75%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: "75%" }} />
            </div>
          </div>

          <Link
            href="/tournaments"
            className="mt-4 flex items-center justify-center gap-2 min-h-[44px] w-full rounded-lg bg-green text-bg-base font-body font-bold text-sm tracking-wide hover:bg-green-electric transition-all duration-150 shadow-[0_0_16px_rgba(0,224,90,0.22)]"
          >
            Register Now
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div
        className="absolute -top-4 -right-4 bg-bg-dark border border-green rounded-lg px-3 py-2 shadow-[0_0_16px_rgba(0,224,90,0.22)]"
        aria-hidden="true"
      >
        <p className="font-heading font-black text-xs text-green tracking-widest">NEXT LEVEL</p>
        <p className="font-body text-[10px] text-fg-muted">ENTERTAINMENT</p>
      </div>
    </div>
  );
}
