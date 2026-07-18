import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(0,212,255,0.08)] mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-heading font-bold text-lg gradient-text tracking-widest">
            ARENAX
          </span>

          <p className="text-sm text-foreground-muted font-body text-center">
            The competitive eFootball Mobile arena for Nigerian players.
          </p>

          <nav className="flex items-center gap-4" aria-label="Footer navigation">
            {[
              { href: "/tournaments", label: "Tournaments" },
              { href: "/about", label: "About" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-foreground-muted hover:text-cyan transition-colors min-h-[44px] flex items-center"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="neon-divider my-4" aria-hidden="true" />

        <p className="text-center text-xs text-foreground-muted font-body">
          © {new Date().getFullYear()} ArenaX. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
