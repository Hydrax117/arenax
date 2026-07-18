import Link from "next/link";
import { ArrowRight, MapPin, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";

// ── Static placeholder data (replaced by real DB data once Supabase is wired)
const FEATURED_TOURNAMENTS = [
  {
    id: "1",
    title: "Lagos Champions Cup",
    format: "Cup" as const,
    status: "open" as const,
    prizePool: 50000,
    entryFee: 1000,
    totalSlots: 32,
    filledSlots: 24,
    startDate: "Aug 15, 2025",
    location: "Lagos",
    gradient: "from-[#0d1f15] to-[#0a1a0d]",
  },
  {
    id: "2",
    title: "Abuja Elite League",
    format: "League" as const,
    status: "open" as const,
    prizePool: 100000,
    entryFee: 2500,
    totalSlots: 16,
    filledSlots: 9,
    startDate: "Sep 1, 2025",
    location: "Abuja",
    gradient: "from-[#12101f] to-[#0a0a1a]",
  },
  {
    id: "3",
    title: "Delta State Invitational",
    format: "Cup" as const,
    status: "open" as const,
    prizePool: 25000,
    entryFee: 500,
    totalSlots: 16,
    filledSlots: 16,
    startDate: "Aug 20, 2025",
    location: "Asaba",
    gradient: "from-[#1f0d0d] to-[#1a0a0a]",
  },
  {
    id: "4",
    title: "Pan Nigeria Open",
    format: "Cup" as const,
    status: "open" as const,
    prizePool: 200000,
    entryFee: 0,
    totalSlots: 64,
    filledSlots: 38,
    startDate: "Sep 15, 2025",
    location: "Online",
    gradient: "from-[#0d1a1f] to-[#0a1215]",
  },
];

export function FeaturedTournaments() {
  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8"
      aria-labelledby="featured-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* ── Section header ── */}
        <div className="flex items-end justify-between mb-12 gap-4">
          <div>
            <p className="font-body text-xs text-green font-semibold tracking-widest uppercase mb-3">
              ⚡ Live Now
            </p>
            <h2
              id="featured-heading"
              className="font-heading font-black text-3xl sm:text-4xl text-fg-primary"
            >
              FEATURED{" "}
              <span className="gradient-text">TOURNAMENTS</span>
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

        {/* ── Grid — Req 3: up to 4 open tournaments ── */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 list-none">
          {FEATURED_TOURNAMENTS.map((t) => (
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
      </div>
    </section>
  );
}

/* ── Individual tournament card ─────────────────────────────────────────── */

type Tournament = (typeof FEATURED_TOURNAMENTS)[number];

function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  const isFull = t.filledSlots >= t.totalSlots;
  const fillPct = Math.round((t.filledSlots / t.totalSlots) * 100);
  const isFree = t.entryFee === 0;

  // Extract month/day from startDate string for the date badge
  const dateParts = t.startDate.split(" ");
  const month = dateParts[0]?.toUpperCase().slice(0, 3) ?? "";
  const day = dateParts[1]?.replace(",", "") ?? "";

  return (
    <Link
      href={`/tournaments/${t.id}`}
      className="flex flex-col glass card-hover rounded-xl overflow-hidden h-full group focus-visible:ring-2 focus-visible:ring-green focus-visible:outline-none"
      aria-label={`${t.title} — ${formatNaira(t.prizePool)} prize pool, ${isFull ? "Full" : "Open"}`}
    >
      {/* Image / gradient header */}
      <div
        className={`relative h-36 bg-gradient-to-br ${t.gradient} flex items-end p-4`}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,224,90,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(0,224,90,0.28) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />

        {/* Date badge */}
        <div className="relative flex flex-col items-center bg-bg-base/80 backdrop-blur-sm border border-border rounded-lg px-2.5 py-1.5 min-w-[44px]">
          <span className="font-body text-[10px] text-green uppercase tracking-widest font-semibold">
            {month}
          </span>
          <span className="font-heading font-black text-lg text-fg-primary leading-none">
            {day}
          </span>
        </div>

        {/* Status / sold-out badge */}
        <div className="relative ml-auto">
          {isFull ? (
            <Badge variant="soldout">Sold Out</Badge>
          ) : (
            <Badge variant="new">Open</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title + location */}
        <div>
          <h3 className="font-heading font-bold text-sm text-fg-primary leading-snug group-hover:text-green transition-colors">
            {t.title}
          </h3>
          <p className="font-body text-xs text-fg-muted mt-0.5 flex items-center gap-1">
            <MapPin size={11} aria-hidden="true" />
            {t.location}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3">
          <Badge variant={t.format === "Cup" ? "featured" : "info"}>
            {t.format}
          </Badge>
          <span className="font-body text-xs text-fg-muted flex items-center gap-1">
            <Clock size={11} aria-hidden="true" />
            {t.startDate}
          </span>
        </div>

        {/* Prize + fee */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="font-body text-[10px] text-fg-muted uppercase tracking-wider">
              Prize Pool
            </p>
            <p className="font-heading font-black text-lg text-green glow-green">
              {formatNaira(t.prizePool)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-[10px] text-fg-muted uppercase tracking-wider">
              Entry
            </p>
            <p className="font-body text-sm text-fg-secondary font-semibold">
              {isFree ? (
                <span className="text-green">Free</span>
              ) : (
                formatNaira(t.entryFee)
              )}
            </p>
          </div>
        </div>

        {/* Slots progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-body text-[10px] text-fg-muted flex items-center gap-1">
              <Users size={10} aria-hidden="true" />
              {t.filledSlots} / {t.totalSlots} players
            </span>
            <span
              className={`font-body text-[10px] font-semibold ${isFull ? "text-error" : "text-green"}`}
            >
              {isFull ? "Full" : `${fillPct}%`}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${isFull ? "!bg-error !shadow-none" : ""}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

