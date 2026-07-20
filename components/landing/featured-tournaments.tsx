import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedTournaments } from "@/lib/tournaments";
import { TournamentCard } from "@/components/tournaments/tournament-card";

export async function FeaturedTournaments() {
  const tournaments = await getFeaturedTournaments();

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8"
      aria-labelledby="featured-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-end justify-between mb-12 gap-4">
          <div>
            <p className="font-body text-xs text-green font-semibold tracking-widest uppercase mb-3">
              ⚡ Live Now
            </p>
            <h2
              id="featured-heading"
              className="font-heading font-black text-3xl sm:text-4xl text-fg-primary"
            >
              FEATURED <span className="gradient-text">TOURNAMENTS</span>
            </h2>
            <p className="font-body text-fg-muted mt-2 text-sm max-w-md">
              Open competitions you can register for right now. Entry fees in
              Naira, prizes paid directly to your bank account.
            </p>
          </div>
          <Link
            href="/tournaments"
            className="hidden sm:inline-flex items-center gap-2 font-body text-sm text-green hover:text-green-electric transition-colors shrink-0"
          >
            View all
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-fg-muted text-sm">
              No open tournaments right now. Check back soon!
            </p>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 list-none">
              {tournaments.map((t) => (
                <li key={t.id}>
                  <TournamentCard tournament={t} />
                </li>
              ))}
            </ul>

            {/* Mobile view-all */}
            <div className="mt-8 flex justify-center sm:hidden">
              <Link
                href="/tournaments"
                className="inline-flex items-center gap-2 min-h-[44px] px-6 rounded-lg border border-border text-fg-secondary font-body font-semibold text-sm hover:border-green hover:text-green transition-all duration-150"
              >
                View all tournaments
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
