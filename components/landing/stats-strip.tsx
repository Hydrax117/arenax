import { Zap, Users, Trophy, Banknote } from "lucide-react";

const STATS = [
  { icon: Users, value: "500+", label: "Registered Players" },
  { icon: Trophy, value: "50+", label: "Tournaments Hosted" },
  { icon: Banknote, value: "₦2M+", label: "Total Prizes Paid" },
  { icon: Zap, value: "< 30s", label: "OTP Delivery" },
];

export function StatsStrip() {
  return (
    <section
      className="border-y border-border bg-bg-dark"
      aria-label="Platform statistics"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-border list-none">
          {STATS.map(({ icon: Icon, value, label }) => (
            <li
              key={label}
              className="flex flex-col items-center gap-2 md:px-8 text-center"
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(0,224,90,0.06)] border border-[rgba(0,224,90,0.10)]"
                aria-hidden="true"
              >
                <Icon size={18} className="text-green" />
              </div>
              <span className="font-heading font-black text-2xl text-fg-primary glow-green">
                {value}
              </span>
              <span className="font-body text-xs text-fg-muted tracking-widest uppercase">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

