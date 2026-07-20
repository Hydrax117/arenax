import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Clock, Users, ArrowRight, AlertCircle,
} from "lucide-react";
import { auth } from "@/auth";
import { getProfile, getPlayerStats, getPlayerTournamentHistory } from "@/lib/profile";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { formatNaira, formatDate } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Match, Tournament, TournamentWithSlots } from "@/types/database";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirect=/dashboard");

  const userId = session.user.id;

  const [profile, stats, history] = await Promise.all([
    getProfile(userId),
    getPlayerStats(userId),
    getPlayerTournamentHistory(userId),
  ]);

  if (!profile) redirect("/onboarding");

  // Onboarding nudge — Req 2 criterion 1
  if (!profile.gamertag) redirect("/onboarding");

  // Fetch pending matches for this player (from ongoing tournaments)
  const admin = createAdminClient();

  const { data: pendingMatchesRaw } = await admin
    .from("matches")
    .select("*, tournament:tournaments!tournament_id(id, title, format, status)")
    .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
    .eq("result_status", "pending")
    .limit(5);

  type MatchWithTournament = Match & {
    tournament: Pick<Tournament, "id" | "title" | "format" | "status"> | null;
  };
  const pendingMatches = (pendingMatchesRaw ?? []) as unknown as MatchWithTournament[];

  // Active registrations (open/ongoing tournaments)
  const activeEntries = history.filter(
    (e) => e.tournament.status === "open" || e.tournament.status === "ongoing",
  );

  // Past results (completed)
  const completedEntries = history
    .filter((e) => e.tournament.status === "completed")
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Welcome header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatar_url}
              alt={profile.gamertag}
              size="lg"
            />
            <div>
              <h1 className="font-heading font-black text-xl text-fg-primary">
                Welcome back,{" "}
                <span className="text-green glow-green">{profile.gamertag}</span>
              </h1>
              <p className="font-body text-sm text-fg-muted">
                {profile.efootball_username && `eFootball: ${profile.efootball_username}`}
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="text-sm font-body text-fg-muted hover:text-green transition-colors inline-flex items-center gap-1"
          >
            Edit Profile <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={<Trophy size={16} />}
            value={String(stats.tournamentsEntered)}
            label="Entered"
          />
          <StatCard
            icon={<Trophy size={16} />}
            value={String(stats.wins)}
            label="Wins"
            accent
          />
          <StatCard
            icon={<Trophy size={16} />}
            value={formatNaira(stats.totalEarningsKobo / 100)}
            label="Earned"
            accent
          />
        </div>

        {/* ── Bank details nudge for payout eligibility ── */}
        {!profile.bank_account_number && (
          <div className="glass rounded-xl p-4 flex items-start gap-3 border border-[rgba(255,184,0,0.25)] bg-[rgba(255,184,0,0.06)]">
            <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-body text-sm font-semibold text-fg-primary">
                Add bank details to receive prize payouts
              </p>
              <p className="font-body text-xs text-fg-muted mt-0.5">
                You need a Nigerian bank account on file before winnings can be transferred.{" "}
                <Link href="/profile" className="text-green hover:underline">
                  Add now →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ── Pending matches ── */}
        {pendingMatches.length > 0 && (
          <Section
            title="Action Required"
            subtitle="Matches waiting for your result"
            icon={<Clock size={16} />}
            badge={String(pendingMatches.length)}
          >
            <ul className="space-y-3 list-none">
              {pendingMatches.map((m) => (
                <PendingMatchCard key={m.id} match={m} />
              ))}
            </ul>
          </Section>
        )}

        {/* ── Active tournaments ── */}
        {activeEntries.length > 0 && (
          <Section
            title="Your Active Tournaments"
            icon={<Users size={16} />}
          >
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none">
              {activeEntries.map(({ tournament }) => (
                <li key={tournament.id}>
                  <TournamentCard
                    tournament={{ ...tournament, confirmed_count: 0 } as TournamentWithSlots}
                  />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── Find tournaments CTA ── */}
        <div className="glass-green rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-fg-primary">
              Ready to compete?
            </h2>
            <p className="font-body text-sm text-fg-muted mt-1">
              Browse open tournaments and register now.
            </p>
          </div>
          <Link
            href="/tournaments?status=open"
            className="inline-flex items-center gap-2 min-h-[48px] px-8 rounded-lg font-body font-bold text-sm tracking-wide bg-green text-bg-base hover:bg-green-electric transition-all shadow-[0_0_12px_rgba(0,224,90,0.25)] shrink-0"
          >
            Browse Tournaments
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {/* ── Recent results ── */}
        {completedEntries.length > 0 && (
          <Section title="Recent Results" icon={<Trophy size={16} />}>
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border">
                    {["Tournament", "Date", "Result"].map((h) => (
                      <th key={h} scope="col" className={`px-4 py-3 text-[10px] font-semibold text-fg-muted uppercase tracking-widest ${h === "Tournament" ? "text-left" : "text-center"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completedEntries.map(({ tournament: t, won }) => (
                    <tr key={t.id} className="border-b border-border/40 hover:bg-[rgba(255,255,255,0.02)]">
                      <td className="px-4 py-3">
                        <Link href={`/tournaments/${t.id}`} className="font-semibold text-fg-primary hover:text-green transition-colors">
                          {t.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center text-fg-muted">
                        {t.ended_at ? formatDate(t.ended_at) : formatDate(t.start_date)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {won ? (
                          <span className="inline-flex items-center gap-1 text-green font-semibold text-xs">
                            <Trophy size={12} aria-hidden="true" /> Won
                          </span>
                        ) : (
                          <span className="text-fg-muted text-xs">Participated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function StatCard({
  icon, value, label, accent,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col items-center gap-2 text-center">
      <span className={`${accent ? "text-green" : "text-fg-muted"}`} aria-hidden="true">
        {icon}
      </span>
      <span className={`font-heading font-black text-xl ${accent ? "text-green glow-green" : "text-fg-primary"}`}>
        {value}
      </span>
      <span className="font-body text-[10px] text-fg-muted uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function Section({
  title, subtitle, icon, badge, children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-green" aria-hidden="true">{icon}</span>
        <h2 className="font-heading font-bold text-base text-fg-primary">{title}</h2>
        {badge && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-green text-bg-base font-heading font-black text-[10px]">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="font-body text-xs text-fg-muted -mt-3 mb-4">{subtitle}</p>
      )}
      {children}
    </section>
  );
}

type MatchWithTournament = Match & {
  tournament: Pick<Tournament, "id" | "title" | "format" | "status"> | null;
};

function PendingMatchCard({ match: m }: { match: MatchWithTournament }) {
  return (
    <li>
      <Link
        href={`/tournaments/${m.tournament_id}`}
        className="glass card-hover rounded-xl p-4 flex items-center justify-between gap-4"
      >
        <div>
          <p className="font-body text-sm font-semibold text-fg-primary">
            {m.tournament?.title ?? "Unknown Tournament"}
          </p>
          <p className="font-body text-xs text-fg-muted mt-0.5">
            Round {m.round} · Submit your result
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="warning">Pending</Badge>
          <ArrowRight size={15} className="text-fg-muted" aria-hidden="true" />
        </div>
      </Link>
    </li>
  );
}
