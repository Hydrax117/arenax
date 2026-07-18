import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";

/**
 * ArenaX proxy — runs before every matched request.
 * Uses next-auth v5's `auth()` helper to read the session from the cookie.
 */
export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // ── Protected player routes ──────────────────────────────────────────────
  const playerRoutes = ["/dashboard", "/profile", "/onboarding"];
  if (playerRoutes.some((r) => pathname.startsWith(r)) && !session?.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── Admin routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session.user as any).role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|workbox-.*\\.js|swe-worker-.*\\.js|api/auth).*)",
  ],
};
