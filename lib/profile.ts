import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, Tournament, Payout, PayoutStatus } from "@/types/database";

// ── Full profile ──────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

// ── Tournament history ────────────────────────────────────────────────────

export interface PlayerTournamentEntry {
  tournament: Tournament;
  status: string;
  paid_amount: number;
  registered_at: string;
  won: boolean; // true if this player won (position 1 in payouts)
}

export async function getPlayerTournamentHistory(
  userId: string,
): Promise<PlayerTournamentEntry[]> {
  const admin = createAdminClient();

  const { data: regs } = (await admin
    .from("registrations")
    .select("tournament_id, status, paid_amount, created_at")
    .eq("player_id", userId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })) as {
    data: {
      tournament_id: string;
      status: string;
      paid_amount: number;
      created_at: string;
    }[] | null;
  };

  if (!regs || regs.length === 0) return [];

  const ids = regs.map((r) => r.tournament_id);

  // Fetch tournaments
  const { data: tournamentsRaw } = await admin
    .from("tournaments")
    .select("*")
    .in("id", ids);

  const tournamentsMap = new Map(
    ((tournamentsRaw ?? []) as Tournament[]).map((t) => [t.id, t]),
  );

  // Fetch wins (payouts where position=1 for this player)
  const { data: payoutsRaw } = await admin
    .from("payouts")
    .select("tournament_id, position")
    .eq("player_id", userId)
    .eq("position", 1)
    .in("tournament_id", ids);

  const winSet = new Set(
    ((payoutsRaw ?? []) as { tournament_id: string; position: number }[]).map(
      (p) => p.tournament_id,
    ),
  );

  return regs
    .map((r) => {
      const t = tournamentsMap.get(r.tournament_id);
      if (!t) return null;
      return {
        tournament: t,
        status: r.status,
        paid_amount: r.paid_amount,
        registered_at: r.created_at,
        won: winSet.has(r.tournament_id),
      };
    })
    .filter(Boolean) as PlayerTournamentEntry[];
}

// ── Payout history ────────────────────────────────────────────────────────

export interface PlayerPayout {
  id: string;
  tournament_title: string;
  amount: number; // kobo
  position: number;
  status: PayoutStatus;
  completed_at: string | null;
  created_at: string;
}

export async function getPlayerPayouts(
  userId: string,
): Promise<PlayerPayout[]> {
  const admin = createAdminClient();

  const { data: payoutsRaw } = await admin
    .from("payouts")
    .select("id, tournament_id, amount, position, status, completed_at, created_at")
    .eq("player_id", userId)
    .order("created_at", { ascending: false });

  if (!payoutsRaw || payoutsRaw.length === 0) return [];

  const payouts = payoutsRaw as Payout[];
  const ids = payouts.map((p) => p.tournament_id);

  const { data: tournamentsRaw } = await admin
    .from("tournaments")
    .select("id, title")
    .in("id", ids);

  const titleMap = new Map(
    ((tournamentsRaw ?? []) as { id: string; title: string }[]).map((t) => [
      t.id,
      t.title,
    ]),
  );

  return payouts.map((p) => ({
    id: p.id,
    tournament_title: titleMap.get(p.tournament_id) ?? "Unknown Tournament",
    amount: p.amount,
    position: p.position,
    status: p.status,
    completed_at: p.completed_at,
    created_at: p.created_at,
  }));
}

// ── Stats summary ─────────────────────────────────────────────────────────

export interface PlayerStats {
  tournamentsEntered: number;
  wins: number;
  totalEarningsKobo: number;
}

export async function getPlayerStats(userId: string): Promise<PlayerStats> {
  const admin = createAdminClient();

  const [{ count: entered }, { data: payoutsRaw }] = await Promise.all([
    admin
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("player_id", userId)
      .eq("status", "confirmed"),
    admin
      .from("payouts")
      .select("amount, status, position")
      .eq("player_id", userId),
  ]);

  const payouts = (payoutsRaw ?? []) as {
    amount: number;
    status: string;
    position: number;
  }[];

  const wins = payouts.filter((p) => p.position === 1).length;
  const totalEarningsKobo = payouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    tournamentsEntered: entered ?? 0,
    wins,
    totalEarningsKobo,
  };
}
