"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Trophy, LayoutDashboard, User, LogOut, ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard, authOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { data: session, status } = useSession();
  const user    = session?.user;
  const loading = status === "loading";

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-border"
      style={{ background: "rgba(10,10,10,0.92)", backdropFilter: "blur(12px)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green rounded-md" aria-label="ArenaX home">
            <Image src="/icons/arenax-logo.png" alt="" width={30} height={30} className="rounded-md" aria-hidden="true" />
            <span className="font-heading font-black text-xl tracking-[0.15em] text-green glow-green">
              ARENA<span className="text-fg-primary">X</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.filter(({ authOnly }) => !authOnly || !!user).map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium font-body tracking-wide min-h-[44px] flex items-center transition-all duration-150",
                    active
                      ? "text-green bg-[rgba(0,224,90,0.07)] border border-[rgba(0,224,90,0.18)]"
                      : "text-fg-secondary hover:text-fg-primary hover:bg-[rgba(255,255,255,0.04)]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-24 rounded-lg bg-bg-surface animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  className={cn(
                    "inline-flex items-center gap-2 min-h-[44px] px-3 rounded-lg text-sm font-semibold font-body transition-all duration-150 border border-border text-fg-secondary hover:border-green hover:text-green",
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-[rgba(0,224,90,0.15)] border border-[rgba(0,224,90,0.25)] flex items-center justify-center">
                    <User size={12} className="text-green" aria-hidden="true" />
                  </div>
                  <span className="max-w-[120px] truncate">
                    {(user as any).gamertag ?? user.email?.split("@")[0]}
                  </span>
                  <ChevronDown size={14} className={cn("transition-transform duration-150", userMenuOpen && "rotate-180")} aria-hidden="true" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass-green rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-xs text-fg-muted font-body">Signed in as</p>
                      <p className="text-sm text-fg-primary font-semibold font-body truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-fg-secondary hover:text-green hover:bg-[rgba(0,224,90,0.07)] transition-colors font-body">
                        <User size={14} aria-hidden="true" /> My Profile
                      </Link>
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-fg-secondary hover:text-green hover:bg-[rgba(0,224,90,0.07)] transition-colors font-body">
                        <LayoutDashboard size={14} aria-hidden="true" /> Dashboard
                      </Link>
                    </div>
                    <div className="border-t border-border py-1">
                      <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-error hover:bg-[rgba(255,59,48,0.07)] transition-colors font-body">
                        <LogOut size={14} aria-hidden="true" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className={cn("inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg text-sm font-semibold font-body tracking-wide transition-all duration-150 border border-border text-fg-secondary hover:border-green hover:text-green hover:bg-[rgba(0,224,90,0.06)]")}>
                  Sign In
                </Link>
                <Link href="/register" className={cn("inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg text-sm font-bold font-body tracking-wide transition-all duration-150 bg-green text-bg-base hover:bg-green-electric shadow-[0_0_16px_rgba(0,224,90,0.28)] hover:shadow-[0_0_24px_rgba(0,224,90,0.42)]")}>
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-fg-secondary hover:text-green transition-colors duration-150"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden border-t border-border bg-bg-dark px-4 pb-5 pt-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.filter(({ authOnly }) => !authOnly || !!user).map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium font-body min-h-[44px] transition-all duration-150",
                    active ? "text-green bg-[rgba(0,224,90,0.07)] border border-[rgba(0,224,90,0.18)]" : "text-fg-secondary hover:text-fg-primary hover:bg-[rgba(255,255,255,0.04)]")}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={17} aria-hidden="true" />{label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 min-h-[44px] px-4 rounded-lg border border-border text-fg-secondary font-body text-sm font-semibold hover:border-green hover:text-green transition-all">
                  <User size={15} aria-hidden="true" /> My Profile
                </Link>
                <button onClick={handleSignOut} className="flex items-center justify-center gap-2 min-h-[44px] rounded-lg border border-[rgba(255,59,48,0.3)] text-error font-body text-sm font-semibold hover:bg-[rgba(255,59,48,0.07)] transition-all">
                  <LogOut size={15} aria-hidden="true" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center min-h-[44px] rounded-lg w-full text-sm font-semibold font-body tracking-wide border border-border text-fg-secondary hover:border-green hover:text-green transition-all">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center min-h-[44px] rounded-lg w-full text-sm font-bold font-body tracking-wide bg-green text-bg-base hover:bg-green-electric shadow-[0_0_16px_rgba(0,224,90,0.28)] transition-all">
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
