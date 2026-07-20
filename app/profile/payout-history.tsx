import { Badge } from "@/components/ui/badge";
import { formatNaira, formatDate } from "@/lib/utils";
import type { PlayerPayout } from "@/lib/profile";
import type { BadgeProps } from "@/components/ui/badge";

function payoutBadge(status: string): BadgeProps["variant"] {
  switch (status) {
    case "completed":  return "success";
    case "processing": return "warning";
    case "failed":     return "error";
    default:           return "neutral";
  }
}

export function PayoutHistoryTable({ payouts }: { payouts: PlayerPayout[] }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border">
              {["Tournament", "Amount", "Position", "Date", "Status"].map(
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
            {payouts.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border/40 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-fg-primary">
                  {p.tournament_title}
                </td>
                <td className="px-4 py-3 text-center font-heading font-black text-green">
                  {formatNaira(p.amount / 100)}
                </td>
                <td className="px-4 py-3 text-center text-fg-secondary">
                  {p.position === 1 ? "🥇 1st" : p.position === 2 ? "🥈 2nd" : p.position === 3 ? "🥉 3rd" : `#${p.position}`}
                </td>
                <td className="px-4 py-3 text-center text-fg-muted">
                  {p.completed_at
                    ? formatDate(p.completed_at)
                    : formatDate(p.created_at)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={payoutBadge(p.status)}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
