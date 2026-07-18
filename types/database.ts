/**
 * ArenaX — Supabase database types
 * Keep in sync with supabase/schema.sql
 * Run `npx supabase gen types typescript` to regenerate once credentials are set.
 */

// ── Enums ────────────────────────────────────────────────────────────────────

export type TournamentFormat = "cup" | "league";
export type TournamentStatus =
  | "draft"
  | "open"
  | "ongoing"
  | "completed"
  | "cancelled";
export type ResultStatus =
  | "pending"
  | "auto_verified"
  | "admin_verified"
  | "disputed"
  | "rejected";
export type PayoutStatus = "pending" | "processing" | "completed" | "failed";
export type PlayerStatus = "active" | "suspended";
export type RegistrationStatus = "pending" | "confirmed" | "cancelled";
export type NotificationEvent =
  | "tournament_registered"
  | "tournament_started"
  | "match_assigned"
  | "result_verified"
  | "result_disputed"
  | "payout_completed"
  | "payout_failed";

// ── Row types ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  gamertag: string | null;           // null until onboarding complete
  efootball_username: string | null; // null until onboarding complete
  phone: string | null;
  nigerian_state: string | null;
  avatar_url: string | null;
  role: "player" | "admin";
  status: PlayerStatus;
  bank_account_number: string | null;
  bank_name: string | null;
  push_subscription: PushSubscriptionJSON | null;
  push_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface OtpCode {
  id: string;
  identifier: string;
  code: string;
  expires_at: string;
  attempts: number;
  used: boolean;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  joined_at: string;
  notified: boolean;
}

export interface Tournament {
  id: string;
  title: string;
  description: string | null;
  format: TournamentFormat;
  status: TournamentStatus;
  entry_fee: number;   // kobo
  prize_pool: number;  // kobo
  prize_distribution: PrizeDistributionItem[];
  max_slots: number;
  min_slots: number;
  registration_deadline: string;
  start_date: string;
  ended_at: string | null;
  game: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  tournament_id: string;
  player_id: string;
  status: RegistrationStatus;
  paystack_reference: string | null;
  paid_amount: number;  // kobo
  paid_at: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  round: number;
  position: number | null;
  player1_id: string | null;
  player2_id: string | null;  // null = BYE
  player1_score: number | null;
  player2_score: number | null;
  winner_id: string | null;
  result_status: ResultStatus;
  verified_by: string | null;
  verified_at: string | null;
  override_note: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResultSubmission {
  id: string;
  match_id: string;
  submitted_by: string;
  player_score: number;
  opponent_score: number;
  screenshot_url: string | null;
  submitted_at: string;
}

export interface LeagueStanding {
  id: string;
  tournament_id: string;
  player_id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  updated_at: string;
}

export interface Payout {
  id: string;
  tournament_id: string;
  player_id: string;
  amount: number;  // kobo
  position: number;
  status: PayoutStatus;
  paystack_transfer_code: string | null;
  paystack_reference: string | null;
  failure_reason: string | null;
  initiated_by: string | null;
  initiated_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface PushNotification {
  id: string;
  player_id: string;
  event: NotificationEvent;
  title: string;
  body: string;
  url: string | null;
  sent: boolean;
  sent_at: string | null;
  created_at: string;
}

// ── View types ───────────────────────────────────────────────────────────────

export interface LeagueTableRow extends LeagueStanding {
  goal_difference: number;
  gamertag: string;
  avatar_url: string | null;
  position: number;
}

export interface TournamentSlotCount {
  tournament_id: string;
  confirmed_count: number;
}

// ── Joined / enriched types (for API responses) ──────────────────────────────

export interface TournamentWithSlots extends Tournament {
  confirmed_count: number;
}

export interface MatchWithPlayers extends Match {
  player1: Pick<Profile, "id" | "gamertag" | "avatar_url"> | null;
  player2: Pick<Profile, "id" | "gamertag" | "avatar_url"> | null;
  winner: Pick<Profile, "id" | "gamertag" | "avatar_url"> | null;
}

export interface RegistrationWithPlayer extends Registration {
  player: Pick<Profile, "id" | "gamertag" | "avatar_url" | "nigerian_state">;
}

// ── Utility types ────────────────────────────────────────────────────────────

export interface PrizeDistributionItem {
  position: number;
  label: string;   // "1st Place", "2nd Place", etc.
  amount: number;  // kobo
}

/** Standard Web Push subscription JSON shape */
export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ── Supabase Database type map (used by createClient<Database>()) ─────────────
// Note: Using Record<string, unknown> for Insert/Update to avoid inference issues
// with the Supabase JS client v2 generic system. Row types are fully typed.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export type Database = {
  public: {
    Tables: {
      profiles:            { Row: Profile;            Insert: AnyRecord; Update: AnyRecord };
      otp_codes:           { Row: OtpCode;            Insert: AnyRecord; Update: AnyRecord };
      waitlist:            { Row: WaitlistEntry;      Insert: AnyRecord; Update: AnyRecord };
      tournaments:         { Row: Tournament;         Insert: AnyRecord; Update: AnyRecord };
      registrations:       { Row: Registration;       Insert: AnyRecord; Update: AnyRecord };
      matches:             { Row: Match;              Insert: AnyRecord; Update: AnyRecord };
      result_submissions:  { Row: ResultSubmission;   Insert: AnyRecord; Update: AnyRecord };
      league_standings:    { Row: LeagueStanding;     Insert: AnyRecord; Update: AnyRecord };
      payouts:             { Row: Payout;             Insert: AnyRecord; Update: AnyRecord };
      push_notifications:  { Row: PushNotification;   Insert: AnyRecord; Update: AnyRecord };
    };
    Views: {
      league_table:           { Row: LeagueTableRow };
      tournament_slot_counts: { Row: TournamentSlotCount };
    };
    Functions: {
      is_admin: { Args: Record<never, never>; Returns: boolean };
    };
    Enums: {
      tournament_format:   TournamentFormat;
      tournament_status:   TournamentStatus;
      result_status:       ResultStatus;
      payout_status:       PayoutStatus;
      player_status:       PlayerStatus;
      registration_status: RegistrationStatus;
      notification_event:  NotificationEvent;
    };
  };
};
