"use client";

/**
 * Client component that provides a reload button on the offline page.
 * Isolated so the parent page remains a Server Component (precacheable).
 */
export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
    >
      Try again
    </button>
  );
}
