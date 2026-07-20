import { cn } from "@/lib/utils";
import type { MatchWithPlayers } from "@/types/database";

interface Props {
  matches: MatchWithPlayers[];
}

export function BracketView({ matches }: Props) {
  // Group matches by round
  const rounds = matches.reduce(
    (acc, m) => {
      const r = m.round;
      if (!acc[r]) acc[r] = [];
      acc[r].push(m);
      return acc;
    },
    {} as Record<number, MatchWithPlayers[]>,
  );

  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  if (roundNumbers.length === 0) {
    return (
      <p className="font-body text-sm text-fg-muted">
        Bracket will appear once the tournament starts.
      </p>
    );
  }

  function roundLabel(r: number, total: number): string {
    const remaining = total - r + 1;
    if (remaining === 1) return "Final";
    if (remaining === 2) return "Semi-Finals";
    if (remaining === 3) return "Quarter-Finals";
    return `Round ${r}`;
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="flex gap-6 min-w-max pb-4">
        {roundNumbers.map((r) => (
          <div key={r} className="flex flex-col gap-3">
            {/* Round header */}
            <p className="font-heading font-bold text-xs text-green uppercase tracking-widest mb-1">
              {roundLabel(r, roundNumbers.length)}
            </p>

            {/* Match cards */}
            <div className="flex flex-col gap-3">
              {(rounds[r] ?? []).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match: m }: { match: MatchWithPlayers }) {
  const isVerified =
    m.result_status === "auto_verified" ||
    m.result_status === "admin_verified";

  return (
    <div className="glass rounded-xl overflow-hidden w-52">
      <PlayerRow
        gamertag={m.player1?.gamertag ?? "TBD"}
        avatar={m.player1?.avatar_url}
        score={m.player1_score}
        isWinner={m.winner_id === m.player1_id}
        isVerified={isVerified}
        isBye={false}
      />
      <div className="h-px bg-border" aria-hidden="true" />
      <PlayerRow
        gamertag={m.player2?.gamertag ?? "BYE"}
        avatar={m.player2?.avatar_url}
        score={m.player2_score}
        isWinner={m.winner_id === m.player2_id}
        isVerified={isVerified}
        isBye={m.player2_id === null}
      />
    </div>
  );
}

function PlayerRow({
  gamertag,
  score,
  isWinner,
  isVerified,
  isBye,
}: {
  gamertag: string;
  avatar?: string | null;
  score: number | null;
  isWinner: boolean;
  isVerified: boolean;
  isBye: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2.5 gap-2",
        isWinner && isVerified && "bg-[rgba(0,224,90,0.07)]",
        isBye && "opacity-40",
      )}
    >
      <span
        className={cn(
          "font-body text-xs font-semibold truncate max-w-[120px]",
          isWinner && isVerified ? "text-green" : "text-fg-secondary",
          isBye && "italic",
        )}
      >
        {gamertag}
      </span>
      {isVerified && !isBye && score !== null ? (
        <span
          className={cn(
            "font-heading font-black text-sm min-w-[20px] text-center",
            isWinner ? "text-green" : "text-fg-muted",
          )}
        >
          {score}
        </span>
      ) : null}
    </div>
  );
}
