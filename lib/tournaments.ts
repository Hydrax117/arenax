/**
 * Tournament data access helpers.
 * All functions use the admin client so they work without a session cookie.
 * RLS is bypassed intentionally — tournament data is public.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Tournament,
  TournamentWithSlots,
  TournamentStatus,
  RegistrationWithPlayer,
  MatchWithPlayers,
  LeagueTableRow,
} from "@/types/database";

const PAGE_SIZE = 20;

// ── Listing ───────────────────────────────────────────────────────────────

export interface TournamentListParams {
  status?: TournamentStatus;
  page?: number;
}

export interface TournamentListResult {
  tournaments: TournamentWithSlots[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getTournaments(
  params: TournamentListParams = {},
): Promise<TournamentListResult> {
  const { status, page = 1 } = params;
  const admin = createAdminClient();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from("tournaments")
    .select("*", { count: "exact" })
    .neq("status", "draft")
    .order("start_date", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) throw error;

  const tournaments = (data ?? []) as Tournament[];

  // Fetch slot counts for this page's tournaments
  const ids = tournaments.map((t) => t.id);
  let slotCounts: Record<string, number> = {};

  if (ids.length > 0) {
    const { data: counts } = await admin
      .from("registrations")
      .select("tournament_id")
      .eq("status", "confirmed")
      .in("tournament_id", ids);

    if (counts) {
      slotCounts = (counts as { tournament_id: string }[]).reduce(
        (acc, r) => {
          acc[r.tournament_id] = (acc[r.tournament_id] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
    }
  }

  return {
    tournaments: tournaments.map((t) => ({
      ...t,
      confirmed_count: slotCounts[t.id] ?? 0,
    })),
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

// ── Detail ────────────────────────────────────────────────────────────────

export interface TournamentDetail {
  tournament: TournamentWithSlots;
  registrations: RegistrationWithPlayer[];
  matches: MatchWithPlayers[];
  leagueTable: LeagueTableRow[];
}

export async function getTournamentDetail(
  id: string,
): Promise<TournamentDetail | null> {
  const admin = createAdminClient();

  // Tournament
  const { data: t, error } = await admin
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .neq("status", "draft")
    .single();

  if (error || !t) return null;
  const tournament = t as Tournament;

  // Confirmed registrations + player profiles
  const { data: regsRaw } = await admin
    .from("registrations")
    .select("*, player:profiles!player_id(id, gamertag, avatar_url, nigerian_state)")
    .eq("tournament_id", id)
    .eq("status", "confirmed")
    .order("created_at", { ascending: true });

  const registrations = (regsRaw ?? []) as unknown as RegistrationWithPlayer[];
  const confirmedCount = registrations.length;

  // Matches with player profiles
  const { data: matchesRaw } = await admin
    .from("matches")
    .select(
      `*, 
       player1:profiles!player1_id(id, gamertag, avatar_url),
       player2:profiles!player2_id(id, gamertag, avatar_url),
       winner:profiles!winner_id(id, gamertag, avatar_url)`,
    )
    .eq("tournament_id", id)
    .order("round", { ascending: true })
    .order("position", { ascending: true });

  const matches = (matchesRaw ?? []) as unknown as MatchWithPlayers[];

  // League table (only for league format)
  let leagueTable: LeagueTableRow[] = [];
  if (tournament.format === "league") {
    const { data: tableRaw } = await admin
      .from("league_table")
      .select("*")
      .eq("tournament_id", id);
    leagueTable = (tableRaw ?? []) as LeagueTableRow[];
  }

  return {
    tournament: { ...tournament, confirmed_count: confirmedCount },
    registrations,
    matches,
    leagueTable,
  };
}

// ── Featured (for landing page — 4 open tournaments) ─────────────────────

export async function getFeaturedTournaments(): Promise<TournamentWithSlots[]> {
  const result = await getTournaments({ status: "open", page: 1 });
  return result.tournaments.slice(0, 4);
}
