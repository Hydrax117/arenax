import Link from "next/link";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNaira, formatDate } from "@/lib/utils";
import type { PlayerTournamentEntry } from "@/lib/profile";

export function TournamentHistoryTable({
  entries,
}: {
  entries: PlayerTournamentEntry[];
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border">
              {["Tournament", "Format", "Prize Pool", "Date", "Result"].map(
                (h) => (
                  <th
                    key={h}
                    scope="col"
                    className={[
                      "px-4 py-3 text-[10px] font-semibold text-fg-muted uppercase tracking-widest",
                      h === "Tournament" ? "text-left" : "text-center",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {entries.map(({ tournament: t, won, registered_at }) => (
              <tr
                key={t.id}
                className="border-b border-border/40 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="font-semibold text-fg-primary hover:text-green transition-colors"
                  >
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={t.format === "cup" ? "featured" : "info"}>
                    {t.format === "cup" ? "Cup" : "League"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center text-fg-secondary">
                  {formatNaira(t.prize_pool / 100)}
                </td>
                <td className="px-4 py-3 text-center text-fg-muted">
                  {formatDate(registered_at)}
                </td>
                <td className="px-4 py-3 text-center">
                  {won ? (
                    <span className="inline-flex items-center gap-1 text-green font-semibold text-xs">
                      <Trophy size={12} aria-hidden="true" />
                      Won
                    </span>
                  ) : t.status === "completed" ? (
                    <span className="text-fg-muted text-xs">Participated</span>
                  ) : (
                    <Badge variant={t.status === "ongoing" ? "warning" : "new"}>
                      {t.status === "ongoing" ? "Live" : "Registered"}
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
