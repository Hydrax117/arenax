import { WaitlistForm } from "./waitlist-form";
import { Bell, Users, Zap } from "lucide-react";
import fs from "fs";
import path from "path";

const PERKS = [
  {
    icon: Zap,
    title: "Early Access",
    desc: "Be first to enter tournaments before public launch.",
  },
  {
    icon: Bell,
    title: "Launch Alerts",
    desc: "Get notified the moment registration opens.",
  },
  {
    icon: Users,
    title: "Founder Slot",
    desc: "Reserved spot in our first open tournament — free entry.",
  },
];

/* ── Server-only helper — runs at request/build time, no client JS ──────── */
function getWaitlistCount(): number {
  try {
    const file = path.join(process.cwd(), "data", "waitlist.json");
    if (!fs.existsSync(file)) return 0;
    const data = JSON.parse(fs.readFileSync(file, "utf-8")) as unknown[];
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

/* ── Root section (plain Server Component — NOT async) ───────────────────── */
export function WaitlistSection() {
  const count = getWaitlistCount();

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-dark"
      aria-labelledby="waitlist-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left — copy ─────────────────────────────────────────────── */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border border-[rgba(0,224,90,0.20)] bg-[rgba(0,224,90,0.06)]">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"
                aria-hidden="true"
              />
              <span className="text-green text-xs font-semibold font-body tracking-widest uppercase">
                Coming Soon
              </span>
            </div>

            <h2
              id="waitlist-heading"
              className="font-heading font-black text-3xl sm:text-4xl text-fg-primary leading-tight"
            >
              GET IN BEFORE{" "}
              <span className="gradient-text">THE ARENA</span>
              <br />
              FILLS UP
            </h2>

            <p className="font-body text-fg-secondary mt-4 text-base leading-relaxed max-w-md">
              ArenaX is launching soon for Nigerian eFootball Mobile players.
              Drop your email and secure your place before the gates open.
            </p>

            {/* Perks */}
            <ul className="mt-8 space-y-4 list-none">
              {PERKS.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 mt-0.5"
                    style={{
                      background: "rgba(0,224,90,0.08)",
                      border: "1px solid rgba(0,224,90,0.18)",
                    }}
                  >
                    <Icon size={16} className="text-green" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-sm text-fg-primary">
                      {title}
                    </p>
                    <p className="font-body text-xs text-fg-muted mt-0.5">
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right — form card ────────────────────────────────────────── */}
          <div className="relative">
            {/* Ambient glow */}
            <div
              className="absolute -inset-4 rounded-3xl pointer-events-none blur-2xl opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(0,224,90,0.15) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />

            <div className="relative glass-green rounded-2xl p-6 sm:p-8">
              {/* Card header */}
              <div className="mb-6">
                <h3 className="font-heading font-bold text-lg text-fg-primary tracking-wide">
                  Join the Waitlist
                </h3>
                <p className="font-body text-sm text-fg-muted mt-1">
                  Limited spots available for our beta launch.
                </p>
              </div>

              {/* Live counter — rendered on server, no client JS */}
              <WaitlistCounter count={count} />

              <div className="neon-divider my-5" aria-hidden="true" />

              {/* Form — client component for interactivity */}
              <WaitlistForm />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ── Counter display (plain Server Component, receives count as prop) ────── */
function WaitlistCounter({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-bg-surface border border-border">
      <div className="flex -space-x-2" aria-hidden="true">
        {["bg-green", "bg-[#7b22d4]", "bg-[rgba(0,208,255,0.8)]"].map(
          (bg, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-full border-2 border-bg-surface ${bg}`}
            />
          ),
        )}
      </div>
      <p className="font-body text-xs text-fg-muted">
        <span className="font-semibold text-fg-primary">
          {count > 0 ? `${count.toLocaleString()}+` : "Be the first"}
        </span>{" "}
        {count > 0 ? "players already waiting" : "to join the waitlist"}
      </p>
    </div>
  );
}
