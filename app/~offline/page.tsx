import type { Metadata } from "next";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = {
  title: "Offline",
  description: "You are currently offline.",
};

/**
 * Offline fallback page.
 *
 * The service worker (via @ducanh2912/next-pwa) serves this page whenever
 * a navigation request fails because the network is unavailable.
 * Pre-rendered as a static Server Component so Next.js can precache it
 * during the build.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      {/* Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-20 w-20 text-neutral-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18M8.111 8.111A7.5 7.5 0 0115.89 15.89M1.5 8.25a10.5 10.5 0 0115.14-3.89M21 15.75a10.5 10.5 0 01-15.14 3.89M6.343 6.343A8.25 8.25 0 0117.657 17.657"
        />
      </svg>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          You&apos;re offline
        </h1>
        <p className="max-w-sm text-neutral-500">
          It looks like you&apos;ve lost your internet connection. Check your
          network and try again.
        </p>
      </div>

      {/* Client component handles the click/reload */}
      <RetryButton />
    </main>
  );
}
