import Link from "next/link";
import { Zap, Shield, Trophy, Star } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/tournaments", label: "Tournaments" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

// Matches the design footer — FAST · SECURE · COMPETE · WIN
const FOOTER_BADGES = [
  { icon: Zap, label: "Fast" },
  { icon: Shield, label: "Secure" },
  { icon: Trophy, label: "Compete" },
  { icon: Star, label: "Win" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-dark mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Trust badges row (from design bottom bar) ── */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {FOOTER_BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-fg-secondary font-body text-sm font-semibold tracking-widest uppercase"
            >
              <Icon size={15} className="text-green" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>

        <div className="neon-divider mb-8" aria-hidden="true" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-heading font-black text-lg tracking-[0.15em] text-green glow-green">
              ARENA<span className="text-fg-primary">X</span>
            </span>
            <p className="text-xs text-fg-muted font-body">
              Futuristic. Energetic. Bold.
              <br />
              Built for gamers. Made for champions.
            </p>
          </div>

          {/* Links */}
          <nav
            className="flex flex-wrap justify-center gap-x-5 gap-y-2"
            aria-label="Footer navigation"
          >
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-fg-muted hover:text-green transition-colors min-h-[44px] flex items-center font-body tracking-wide"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-center text-xs text-fg-muted font-body mt-6">
          © {new Date().getFullYear()} ArenaX. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
