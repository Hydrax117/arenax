import type { Metadata } from "next";
import { Suspense } from "react";
import { getTournaments } from "@/lib/tournaments";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { TournamentFilters } from "./tournament-filters";
import type { TournamentStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Tournaments",
  description: "Browse eFootball Mobile tournaments in Nigeria. Filter by Open, Ongoing, or Completed.",
};

// Revalidate every 60 seconds so slot counts stay fresh
export const revalidate = 60;

const VALID_STATUSES: TournamentStatus[] = ["open", "ongoing", "completed"];

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function TournamentsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const status = VALID_STATUSES.includes(params.status as TournamentStatus)
    ? (params.status as TournamentStatus)
    : undefined;

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const { tournaments, total, pageSize } = await getTournaments({ status, page });

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="font-body text-xs text-green font-semibold tracking-widest uppercase mb-3">
            eFootball Mobile · Nigeria
          </p>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-fg-primary">
            TOURNAMENTS
          </h1>
          <p className="font-body text-fg-muted mt-2 text-sm max-w-lg">
            {total > 0
              ? `${total} tournament${total !== 1 ? "s" : ""} available`
              : "No tournaments found"}
          </p>
        </div>

        {/* ── Status filters (client component for instant switching) ── */}
        <Suspense>
          <TournamentFilters activeStatus={status} total={total} />
        </Suspense>

        {/* ── Grid ── */}
        {tournaments.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 list-none mt-8">
              {tournaments.map((t) => (
                <li key={t.id}>
                  <TournamentCard tournament={t} />
                </li>
              ))}
            </ul>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-center gap-2 mt-12"
                aria-label="Pagination"
              >
                <PaginationLink
                  href={buildHref(params, page - 1)}
                  disabled={!hasPrevPage}
                  aria-label="Previous page"
                >
                  ←
                </PaginationLink>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationLink
                    key={p}
                    href={buildHref(params, p)}
                    active={p === page}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </PaginationLink>
                ))}

                <PaginationLink
                  href={buildHref(params, page + 1)}
                  disabled={!hasNextPage}
                  aria-label="Next page"
                >
                  →
                </PaginationLink>
              </nav>
            )}
          </>
        ) : (
          <EmptyState status={status} />
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function buildHref(
  current: Record<string, string | undefined>,
  newPage: number,
) {
  const p = new URLSearchParams();
  if (current.status) p.set("status", current.status);
  if (newPage > 1) p.set("page", String(newPage));
  const qs = p.toString();
  return `/tournaments${qs ? `?${qs}` : ""}`;
}

interface PaginationLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}

function PaginationLink({
  href,
  disabled,
  active,
  children,
  ...props
}: PaginationLinkProps) {
  if (disabled) {
    return (
      <span className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-body text-fg-muted opacity-30 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      className={[
        "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-body transition-all duration-150",
        active
          ? "bg-green text-bg-base font-bold"
          : "text-fg-secondary border border-border hover:border-green hover:text-green",
      ].join(" ")}
      {...props}
    >
      {children}
    </a>
  );
}

function EmptyState({ status }: { status?: TournamentStatus }) {
  const messages: Record<string, string> = {
    open:      "No open tournaments right now. Check back soon!",
    ongoing:   "No tournaments are currently in progress.",
    completed: "No completed tournaments yet.",
  };
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center mt-8">
      <div
        className="w-16 h-16 rounded-full mb-6 flex items-center justify-center"
        style={{ background: "rgba(0,224,90,0.08)", border: "1px solid rgba(0,224,90,0.18)" }}
        aria-hidden="true"
      >
        <span className="text-2xl">🏆</span>
      </div>
      <h2 className="font-heading font-bold text-lg text-fg-primary mb-2">
        No Tournaments Found
      </h2>
      <p className="font-body text-sm text-fg-muted max-w-sm">
        {status ? messages[status] : "No tournaments are available right now. Check back soon!"}
      </p>
    </div>
  );
}
