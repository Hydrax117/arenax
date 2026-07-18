"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Trophy, User, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

const NAV_LINKS = [
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-[rgba(0,212,255,0.1)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded-md"
            aria-label="ArenaX home"
          >
            <Image
              src="/icons/arenax-logo.png"
              alt=""
              width={32}
              height={32}
              className="rounded-md"
              aria-hidden="true"
            />
            <span className="font-heading font-bold text-xl gradient-text tracking-widest">
              ARENAX
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium font-body transition-all duration-150",
                  "min-h-[44px] flex items-center",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "text-cyan bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]"
                    : "text-foreground-muted hover:text-foreground hover:bg-[rgba(255,255,255,0.05)]",
                )}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center justify-center min-h-[44px] px-4 rounded-lg",
                "text-sm font-semibold font-body transition-all duration-150",
                "border border-[rgba(0,212,255,0.4)] text-cyan",
                "hover:bg-[rgba(0,212,255,0.08)]",
              )}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className={cn(
                "inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg",
                "text-sm font-semibold font-body transition-all duration-150",
                "bg-cyan text-[#0a0a0f]",
                "hover:brightness-110 shadow-[0_0_15px_rgba(0,212,255,0.4)]",
              )}
            >
              Join Now
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-foreground-muted hover:text-foreground transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden glass border-t border-[rgba(0,212,255,0.1)] px-4 pb-4 pt-2"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium font-body",
                  "min-h-[44px] transition-all duration-150",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "text-cyan bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]"
                    : "text-foreground-muted hover:text-foreground hover:bg-[rgba(255,255,255,0.05)]",
                )}
                aria-current={pathname === href ? "page" : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-center min-h-[44px] rounded-lg w-full",
                "text-sm font-semibold font-body transition-all duration-150",
                "border border-[rgba(0,212,255,0.4)] text-cyan",
                "hover:bg-[rgba(0,212,255,0.08)]",
              )}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-center min-h-[44px] rounded-lg w-full",
                "text-sm font-semibold font-body transition-all duration-150",
                "bg-cyan text-[#0a0a0f]",
                "hover:brightness-110 shadow-[0_0_15px_rgba(0,212,255,0.4)]",
              )}
            >
              Join Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
