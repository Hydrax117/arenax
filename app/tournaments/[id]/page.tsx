import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, Calendar, Clock, Gamepad2, ArrowLeft,
} from "lucide-react";
import { getTournamentDetail } from "@/lib/tournaments";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatNaira, formatDate } from "@/lib/utils";
import { RegisterButton } from "./register-button";
import { BracketView } from "./bracket-view";
import { LeagueTableView } from "./league-table-view";
import type { TournamentStatus } from "@/types/database";

export const revalidate = 30;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await getTournamentDetail(id);
  if (!detail) return { title: "Tournament Not Found" };
  const { tournament: t } = detail;
  return {
    title: t.title,
    description: `${t.format === "cup" ? "Cup" : "League"} · ${formatNaira(t.prize_pool / 100)} prize pool · ${t.game}`,
  };
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await getTournamentDetail(id);
  if (!detail) notFound();

  const { tournament: t, registrations, matches, leagueTable } = detail;
  const isFull = t.confirmed_count >= t.max_slots;
  const isOpen = t.status === "open" && !isFull;

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Back link ── */}
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-green transition-colors font-body mb-8"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          All Tournaments
        </Link>

        {/* ── Hero card ── */}
        <div className="glass-green rounded-2xl overflow-hidden mb-8">
          {/* Header band */}
          <div
            className="h-3 w-full"
            style={{ background: "var(--gradient-primary)" }}
            aria-hidden="true"
          />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <StatusBadge status={t.status} />
                  <Badge variant={t.format === "cup" ? "featured" : "info"}>
                    {t.format === "cup" ? "Cup" : "League"}
                  </Badge>
                </div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-fg-primary">
                  {t.title}
                </h1>
                <p className="font-body text-sm text-fg-muted mt-1 flex items-center gap-1.5">
                  <Gamepad2 size={14} aria-hidden="true" />
                  {t.game}
                </p>
              </div>

              {/* Prize pool */}
              <div className="text-left sm:text-right shrink-0">
                <p className="font-body text-xs text-fg-muted uppercase tracking-wider">Prize Pool</p>
                <p className="font-heading font-black text-3xl text-green glow-green">
                  {formatNaira(t.prize_pool / 100)}
                </p>
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <MetaItem
                icon={<Users size={14} />}
                label="Slots"
                value={`${t.confirmed_count} / ${t.max_slots}`}
              />
              <MetaItem
                icon={<Trophy size={14} />}
                label="Entry Fee"
                value={t.entry_fee === 0 ? "Free" : formatNaira(t.entry_fee / 100)}
                valueClass={t.entry_fee === 0 ? "text-green" : undefined}
              />
              <MetaItem
                icon={<Calendar size={14} />}
                label="Starts"
                value={formatDate(t.start_date)}
              />
              <MetaItem
                icon={<Clock size={14} />}
                label="Reg. Deadline"
                value={formatDate(t.registration_deadline)}
              />
            </div>

            {/* Slots progress */}
            <div className="mb-6">
              <div className="flex justify-between mb-1.5">
                <span className="font-body text-xs text-fg-muted">
                  {t.confirmed_count} of {t.max_slots} slots filled
                </span>
                <span className={`font-body text-xs font-semibold ${isFull ? "text-error" : "text-green"}`}>
                  {isFull ? "Full" : `${Math.round((t.confirmed_count / t.max_slots) * 100)}%`}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-bar-fill ${isFull ? "!bg-error !shadow-none" : ""}`}
                  style={{ width: `${Math.min(100, (t.confirmed_count / t.max_slots) * 100)}%` }}
                />
              </div>
            </div>

            {/* Registration CTA — Req 5 criterion 2 */}
            {t.status === "open" && (
              <RegisterButton
                tournamentId={t.id}
                entryFee={t.entry_fee}
                isFull={isFull}
              />
            )}

            {/* Description */}
            {t.description && (
              <p className="font-body text-sm text-fg-secondary mt-4 leading-relaxed">
                {t.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Prize distribution ── */}
        {t.prize_distribution.length > 0 && (
          <Section title="Prize Breakdown" icon={<Trophy size={18} />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {t.prize_distribution.map((p) => (
                <div
                  key={p.position}
                  className="glass rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-black text-lg text-fg-muted w-8">
                      {p.position === 1 ? "🥇" : p.position === 2 ? "🥈" : p.position === 3 ? "🥉" : `#${p.position}`}
                    </span>
                    <span className="font-body text-sm text-fg-secondary">{p.label}</span>
                  </div>
                  <span className="font-heading font-bold text-green">
                    {formatNaira(p.amount / 100)}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Bracket (Cup, Ongoing/Completed) — Req 5 criterion 3 ── */}
        {t.format === "cup" && (t.status === "ongoing" || t.status === "completed") && matches.length > 0 && (
          <Section title="Bracket" icon={<Trophy size={18} />}>
            <BracketView matches={matches} />
          </Section>
        )}

        {/* ── League table + fixtures — Req 5 criterion 4 ── */}
        {t.format === "league" && (t.status === "ongoing" || t.status === "completed") && (
          <Section title="Standings & Fixtures" icon={<Trophy size={18} />}>
            <LeagueTableView table={leagueTable} matches={matches} />
          </Section>
        )}

        {/* ── Registered players — Req 5 criterion 5 ── */}
        {registrations.length > 0 && (
          <Section title={`Players (${registrations.length})`} icon={<Users size={18} />}>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 list-none">
              {registrations.map(({ player }) => (
                <li
                  key={player.id}
                  className="glass rounded-xl p-3 flex items-center gap-3"
                >
                  <Avatar
                    src={player.avatar_url}
                    alt={player.gamertag ?? "Player"}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="font-body text-sm text-fg-primary font-semibold truncate">
                      {player.gamertag ?? "Anonymous"}
                    </p>
                    {player.nigerian_state && (
                      <p className="font-body text-xs text-fg-muted truncate">
                        {player.nigerian_state}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TournamentStatus }) {
  switch (status) {
    case "open":      return <Badge variant="new">Open</Badge>;
    case "ongoing":   return <Badge variant="warning">Live</Badge>;
    case "completed": return <Badge variant="neutral">Completed</Badge>;
    case "cancelled": return <Badge variant="error">Cancelled</Badge>;
    default:          return null;
  }
}

function MetaItem({
  icon, label, value, valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-body text-[10px] text-fg-muted uppercase tracking-wider flex items-center gap-1">
        <span aria-hidden="true">{icon}</span>
        {label}
      </p>
      <p className={`font-body text-sm font-semibold text-fg-primary ${valueClass ?? ""}`}>
        {value}
      </p>
    </div>
  );
}

function Section({
  title, icon, children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="font-heading font-bold text-base text-fg-primary flex items-center gap-2 mb-4">
        <span className="text-green" aria-hidden="true">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
