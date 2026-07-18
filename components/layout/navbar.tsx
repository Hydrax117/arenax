"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Trophy, LayoutDashboard, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-border"
      style={{ background: "rgba(10,10,10,0.92)", backdropFilter: "blur(12px)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo ─────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green rounded-md"
            aria-label="ArenaX home"
          >
            <Image
              src="/icons/arenax-logo.png"
              alt=""
              width={30}
              height={30}
              className="rounded-md"
              aria-hidden="true"
            />
            <span className="font-heading font-black text-xl tracking-[0.15em] text-green glow-green">
              ARENA<span className="text-fg-primary">X</span>
            </span>
          </Link>

          {/* ── Desktop nav ──────────────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium font-body tracking-wide",
                    "min-h-[44px] flex items-center transition-all duration-150",
                    active
                      ? "text-green bg-[rgba(0,255,102,0.08)] border border-[rgba(0,255,102,0.2)]"
                      : "text-fg-secondary hover:text-fg-primary hover:bg-[rgba(255,255,255,0.04)]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop CTAs ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg",
                "text-sm font-semibold font-body tracking-wide transition-all duration-150",
                "border border-border text-fg-secondary",
                "hover:border-green hover:text-green hover:bg-[rgba(0,255,102,0.06)]",
              )}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className={cn(
                "inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg",
                "text-sm font-bold font-body tracking-wide transition-all duration-150",
                "bg-green text-bg-base",
                "hover:bg-green-electric",
                "shadow-[0_0_16px_rgba(0,255,102,0.35)] hover:shadow-[0_0_24px_rgba(0,255,102,0.55)]",
              )}
            >
              Join Now
            </Link>
          </div>

          {/* ── Mobile toggle ────────────────────────────── */}
          <button
            className={cn(
              "md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg",
              "text-fg-secondary hover:text-green transition-colors duration-150",
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ────────────────────────────────── */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-border bg-bg-dark px-4 pb-5 pt-3"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg",
                    "text-sm font-medium font-body min-h-[44px] transition-all duration-150",
                    active
                      ? "text-green bg-[rgba(0,255,102,0.08)] border border-[rgba(0,255,102,0.2)]"
                      : "text-fg-secondary hover:text-fg-primary hover:bg-[rgba(255,255,255,0.04)]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-center min-h-[44px] rounded-lg w-full",
                "text-sm font-semibold font-body tracking-wide transition-all duration-150",
                "border border-border text-fg-secondary",
                "hover:border-green hover:text-green",
              )}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-center min-h-[44px] rounded-lg w-full",
                "text-sm font-bold font-body tracking-wide transition-all duration-150",
                "bg-green text-bg-base",
                "hover:bg-green-electric",
                "shadow-[0_0_16px_rgba(0,255,102,0.35)]",
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
