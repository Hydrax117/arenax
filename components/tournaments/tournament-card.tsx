import Link from "next/link";
import { MapPin, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNaira, formatDate } from "@/lib/utils";
import type { TournamentWithSlots } from "@/types/database";

const STATUS_GRADIENTS: Record<string, string> = {
  open:      "from-[#0d1f15] to-[#0a1a0d]",
  ongoing:   "from-[#1a1200] to-[#0f0c00]",
  completed: "from-[#111317] to-[#0a0a0a]",
  cancelled: "from-[#1f0d0d] to-[#1a0a0a]",
};

interface Props {
  tournament: TournamentWithSlots;
}

export function TournamentCard({ tournament: t }: Props) {
  const isFull   = t.confirmed_count >= t.max_slots;
  const fillPct  = Math.min(100, Math.round((t.confirmed_count / t.max_slots) * 100));
  const isFree   = t.entry_fee === 0;
  const gradient = STATUS_GRADIENTS[t.status] ?? STATUS_GRADIENTS.open;

  // Date badge values
  const date   = new Date(t.start_date);
  const month  = date.toLocaleString("en-NG", { month: "short" }).toUpperCase();
  const day    = date.getDate().toString();

  function statusBadge() {
    switch (t.status) {
      case "open":      return <Badge variant="new">Open</Badge>;
      case "ongoing":   return <Badge variant="warning">Live</Badge>;
      case "completed": return <Badge variant="neutral">Ended</Badge>;
      case "cancelled": return <Badge variant="error">Cancelled</Badge>;
      default:          return null;
    }
  }

  return (
    <Link
      href={`/tournaments/${t.id}`}
      className="flex flex-col glass card-hover rounded-xl overflow-hidden h-full group focus-visible:ring-2 focus-visible:ring-green focus-visible:outline-none"
      aria-label={`${t.title} — ${formatNaira(t.prize_pool / 100)} prize pool`}
    >
      {/* Gradient header */}
      <div
        className={`relative h-36 bg-gradient-to-br ${gradient} flex items-end p-4`}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,224,90,0.28) 1px,transparent 1px),linear-gradient(90deg,rgba(0,224,90,0.28) 1px,transparent 1px)",
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
        {/* Status badge */}
        <div className="relative ml-auto">
          {isFull && t.status === "open"
            ? <Badge variant="soldout">Sold Out</Badge>
            : statusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <h3 className="font-heading font-bold text-sm text-fg-primary leading-snug group-hover:text-green transition-colors">
          {t.title}
        </h3>

        {/* Format + date */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant={t.format === "cup" ? "featured" : "info"}>
            {t.format === "cup" ? "Cup" : "League"}
          </Badge>
          <span className="font-body text-xs text-fg-muted flex items-center gap-1">
            <Clock size={11} aria-hidden="true" />
            {formatDate(t.start_date)}
          </span>
        </div>

        {/* Prize + entry */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="font-body text-[10px] text-fg-muted uppercase tracking-wider">Prize Pool</p>
            <p className="font-heading font-black text-lg text-green glow-green">
              {formatNaira(t.prize_pool / 100)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-[10px] text-fg-muted uppercase tracking-wider">Entry</p>
            <p className="font-body text-sm text-fg-secondary font-semibold">
              {isFree ? <span className="text-green">Free</span> : formatNaira(t.entry_fee / 100)}
            </p>
          </div>
        </div>

        {/* Slots progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-body text-[10px] text-fg-muted flex items-center gap-1">
              <Users size={10} aria-hidden="true" />
              {t.confirmed_count} / {t.max_slots} players
            </span>
            <span className={`font-body text-[10px] font-semibold ${isFull ? "text-error" : "text-green"}`}>
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
