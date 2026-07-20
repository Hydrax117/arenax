import type { LeagueTableRow, MatchWithPlayers } from "@/types/database";
import { cn } from "@/lib/utils";

interface Props {
  table: LeagueTableRow[];
  matches: MatchWithPlayers[];
}

export function LeagueTableView({ table, matches }: Props) {
  return (
    <div className="space-y-8">
      {/* ── Standings table — Req 8 criterion 4 & 5 ── */}
      {table.length > 0 ? (
        <div>
          <h3 className="font-heading font-bold text-sm text-fg-primary mb-3">
            Standings
          </h3>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[480px] text-sm font-body border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Player", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className={cn(
                          "py-2 px-2 text-[10px] font-semibold text-fg-muted uppercase tracking-widest",
                          h === "Player" ? "text-left w-full" : "text-center",
                        )}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr
                    key={row.player_id}
                    className="border-b border-border/50 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="py-2.5 px-2 text-center font-heading font-bold text-fg-muted text-xs">
                      {row.position}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="font-semibold text-fg-primary">
                        {row.gamertag}
                      </span>
                    </td>
                    {[
                      row.played,
                      row.won,
                      row.drawn,
                      row.lost,
                      row.goals_for,
                      row.goals_against,
                      row.goal_difference,
                    ].map((val, i) => (
                      <td
                        key={i}
                        className="py-2.5 px-2 text-center text-fg-secondary"
                      >
                        {val >= 0 ? val : `+${Math.abs(val)}`}
                      </td>
                    ))}
                    <td className="py-2.5 px-2 text-center font-heading font-black text-green">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="font-body text-sm text-fg-muted">
          Standings will appear once matches are played.
        </p>
      )}

      {/* ── Fixtures list ── */}
      {matches.length > 0 && (
        <div>
          <h3 className="font-heading font-bold text-sm text-fg-primary mb-3">
            Fixtures
          </h3>
          <div className="space-y-2">
            {matches.map((m) => {
              const isVerified =
                m.result_status === "auto_verified" ||
                m.result_status === "admin_verified";
              return (
                <div
                  key={m.id}
                  className="glass rounded-xl px-4 py-3 flex items-center gap-4"
                >
                  {/* Round badge */}
                  <span className="font-body text-[10px] text-fg-muted uppercase tracking-widest w-14 shrink-0">
                    Rd {m.round}
                  </span>

                  {/* Player 1 */}
                  <span
                    className={cn(
                      "font-body text-sm font-semibold flex-1 text-right truncate",
                      isVerified && m.winner_id === m.player1_id
                        ? "text-green"
                        : "text-fg-secondary",
                    )}
                  >
                    {m.player1?.gamertag ?? "TBD"}
                  </span>

                  {/* Score / VS */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isVerified &&
                    m.player1_score !== null &&
                    m.player2_score !== null ? (
                      <>
                        <span className="font-heading font-black text-fg-primary text-base w-6 text-center">
                          {m.player1_score}
                        </span>
                        <span className="font-body text-xs text-fg-muted">–</span>
                        <span className="font-heading font-black text-fg-primary text-base w-6 text-center">
                          {m.player2_score}
                        </span>
                      </>
                    ) : (
                      <span className="font-body text-xs text-fg-muted px-2">
                        vs
                      </span>
                    )}
                  </div>

                  {/* Player 2 */}
                  <span
                    className={cn(
                      "font-body text-sm font-semibold flex-1 truncate",
                      isVerified && m.winner_id === m.player2_id
                        ? "text-green"
                        : "text-fg-secondary",
                    )}
                  >
                    {m.player2?.gamertag ?? "TBD"}
                  </span>

                  {/* Status chip */}
                  <span
                    className={cn(
                      "font-body text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-widest shrink-0",
                      isVerified
                        ? "text-green border-[rgba(0,224,90,0.3)] bg-[rgba(0,224,90,0.08)]"
                        : m.result_status === "disputed"
                          ? "text-error border-[rgba(255,59,48,0.3)] bg-[rgba(255,59,48,0.08)]"
                          : "text-fg-muted border-border",
                    )}
                  >
                    {isVerified
                      ? "Done"
                      : m.result_status === "disputed"
                        ? "Disputed"
                        : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
