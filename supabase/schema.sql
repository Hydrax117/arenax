-- ═══════════════════════════════════════════════════════════════════════════
-- ArenaX — Complete Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ───────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ───────────────────────────────────────────────────────────────────────────

create type tournament_format  as enum ('cup', 'league');
create type tournament_status  as enum ('draft', 'open', 'ongoing', 'completed', 'cancelled');
create type result_status      as enum ('pending', 'auto_verified', 'admin_verified', 'disputed', 'rejected');
create type payout_status      as enum ('pending', 'processing', 'completed', 'failed');
create type player_status      as enum ('active', 'suspended');
create type registration_status as enum ('pending', 'confirmed', 'cancelled');
create type notification_event as enum (
  'tournament_registered',
  'tournament_started',
  'match_assigned',
  'result_verified',
  'result_disputed',
  'payout_completed',
  'payout_failed'
);

-- ───────────────────────────────────────────────────────────────────────────
-- PROFILES  (extends Supabase auth.users)
-- ───────────────────────────────────────────────────────────────────────────

create table profiles (
  id                  uuid primary key default gen_random_uuid(),
  gamertag            text unique,               -- nullable until onboarding is complete
  efootball_username  text,                      -- nullable until onboarding is complete
  phone               text unique,
  nigerian_state      text,
  avatar_url          text,
  role                text not null default 'player' check (role in ('player', 'admin')),
  status              player_status not null default 'active',
  bank_account_number text,
  bank_name           text,
  push_subscription   jsonb,
  push_enabled        boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Only enforce gamertag format when it's actually set (post-onboarding)
  constraint gamertag_format check (gamertag is null or gamertag ~ '^[a-zA-Z0-9_]{3,20}$')
);

-- ───────────────────────────────────────────────────────────────────────────
-- OTP CODES  (phone / email verification)
-- ───────────────────────────────────────────────────────────────────────────

create table otp_codes (
  id          uuid primary key default gen_random_uuid(),
  identifier  text not null,            -- phone or email
  code        text not null,            -- 6-digit OTP
  expires_at  timestamptz not null,
  attempts    smallint not null default 0,
  used        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_otp_identifier on otp_codes (identifier);

-- ───────────────────────────────────────────────────────────────────────────
-- WAITLIST
-- ───────────────────────────────────────────────────────────────────────────

create table waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  name        text,
  joined_at   timestamptz not null default now(),
  notified    boolean not null default false
);

-- ───────────────────────────────────────────────────────────────────────────
-- TOURNAMENTS
-- ───────────────────────────────────────────────────────────────────────────

create table tournaments (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  description           text,
  format                tournament_format not null,
  status                tournament_status not null default 'draft',
  -- Financials (Req 10 — admin sets prize pool manually)
  entry_fee             integer not null default 0 check (entry_fee >= 0),   -- kobo (₦ × 100)
  prize_pool            integer not null default 0 check (prize_pool >= 0),  -- kobo
  prize_distribution    jsonb not null default '[]',  -- [{position:1, amount:50000, label:"1st"}]
  -- Capacity
  max_slots             integer not null check (max_slots >= 4),
  min_slots             integer not null default 4,
  -- Dates
  registration_deadline timestamptz not null,
  start_date            timestamptz not null,
  ended_at              timestamptz,
  -- Meta
  game                  text not null default 'eFootball Mobile',
  created_by            uuid not null references profiles(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint deadline_before_start check (registration_deadline < start_date)
);

create index idx_tournaments_status on tournaments (status);
create index idx_tournaments_start  on tournaments (start_date desc);

-- ───────────────────────────────────────────────────────────────────────────
-- REGISTRATIONS
-- ───────────────────────────────────────────────────────────────────────────

create table registrations (
  id                  uuid primary key default gen_random_uuid(),
  tournament_id       uuid not null references tournaments(id) on delete cascade,
  player_id           uuid not null references profiles(id) on delete cascade,
  status              registration_status not null default 'pending',
  -- Payment
  paystack_reference  text unique,
  paid_amount         integer not null default 0,   -- kobo
  paid_at             timestamptz,
  -- Timestamps
  created_at          timestamptz not null default now(),

  unique (tournament_id, player_id)
);

create index idx_registrations_tournament on registrations (tournament_id);
create index idx_registrations_player     on registrations (player_id);

-- ───────────────────────────────────────────────────────────────────────────
-- MATCHES  (Cup bracket + League fixtures share this table)
-- ───────────────────────────────────────────────────────────────────────────

create table matches (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null references tournaments(id) on delete cascade,
  round           smallint not null,          -- 1-based round number
  position        smallint,                   -- position within the round (for bracket rendering)
  -- Players
  player1_id      uuid references profiles(id) on delete set null,
  player2_id      uuid references profiles(id) on delete set null,   -- null = BYE
  -- Scores
  player1_score   smallint,
  player2_score   smallint,
  winner_id       uuid references profiles(id) on delete set null,
  -- Result tracking
  result_status   result_status not null default 'pending',
  verified_by     uuid references profiles(id) on delete set null,
  verified_at     timestamptz,
  -- Admin override
  override_note   text,
  -- Timestamps
  scheduled_at    timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_matches_tournament on matches (tournament_id);
create index idx_matches_round      on matches (tournament_id, round);
create index idx_matches_player1    on matches (player1_id);
create index idx_matches_player2    on matches (player2_id);

-- ───────────────────────────────────────────────────────────────────────────
-- RESULT SUBMISSIONS  (Req 9 — players submit, admin verifies)
-- ───────────────────────────────────────────────────────────────────────────

create table result_submissions (
  id              uuid primary key default gen_random_uuid(),
  match_id        uuid not null references matches(id) on delete cascade,
  submitted_by    uuid not null references profiles(id) on delete cascade,
  player_score    smallint not null check (player_score >= 0),
  opponent_score  smallint not null check (opponent_score >= 0),
  screenshot_url  text,
  submitted_at    timestamptz not null default now(),

  -- One submission per player per match
  unique (match_id, submitted_by)
);

create index idx_submissions_match on result_submissions (match_id);

-- ───────────────────────────────────────────────────────────────────────────
-- LEAGUE TABLE  (materialised standings for League tournaments)
-- ───────────────────────────────────────────────────────────────────────────

create table league_standings (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null references tournaments(id) on delete cascade,
  player_id       uuid not null references profiles(id) on delete cascade,
  played          smallint not null default 0,
  won             smallint not null default 0,
  drawn           smallint not null default 0,
  lost            smallint not null default 0,
  goals_for       smallint not null default 0,
  goals_against   smallint not null default 0,
  points          smallint not null default 0,
  updated_at      timestamptz not null default now(),

  unique (tournament_id, player_id)
);

create index idx_standings_tournament on league_standings (tournament_id, points desc, goals_for desc);

-- ───────────────────────────────────────────────────────────────────────────
-- PAYOUTS  (Req 13 — Paystack prize transfers)
-- ───────────────────────────────────────────────────────────────────────────

create table payouts (
  id                    uuid primary key default gen_random_uuid(),
  tournament_id         uuid not null references tournaments(id) on delete cascade,
  player_id             uuid not null references profiles(id) on delete cascade,
  amount                integer not null check (amount > 0),  -- kobo
  position              smallint not null,                    -- 1st, 2nd, etc.
  status                payout_status not null default 'pending',
  -- Paystack transfer
  paystack_transfer_code text,
  paystack_reference    text,
  failure_reason        text,
  initiated_by          uuid references profiles(id),
  initiated_at          timestamptz,
  completed_at          timestamptz,
  created_at            timestamptz not null default now()
);

create index idx_payouts_tournament on payouts (tournament_id);
create index idx_payouts_player     on payouts (player_id);

-- ───────────────────────────────────────────────────────────────────────────
-- PUSH NOTIFICATION LOG
-- ───────────────────────────────────────────────────────────────────────────

create table push_notifications (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references profiles(id) on delete cascade,
  event       notification_event not null,
  title       text not null,
  body        text not null,
  url         text,           -- deep-link URL for tap action
  sent        boolean not null default false,
  sent_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_push_player on push_notifications (player_id, created_at desc);

-- ───────────────────────────────────────────────────────────────────────────
-- VIEWS
-- ───────────────────────────────────────────────────────────────────────────

-- Confirmed registration count per tournament (for slot tracking)
create or replace view tournament_slot_counts as
select
  tournament_id,
  count(*) as confirmed_count
from registrations
where status = 'confirmed'
group by tournament_id;

-- League table with player info, sorted per spec (Req 8)
create or replace view league_table as
select
  ls.*,
  (ls.goals_for - ls.goals_against) as goal_difference,
  p.gamertag,
  p.avatar_url,
  rank() over (
    partition by ls.tournament_id
    order by ls.points desc,
             (ls.goals_for - ls.goals_against) desc,
             ls.goals_for desc
  ) as position
from league_standings ls
join profiles p on p.id = ls.player_id;

-- ───────────────────────────────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ───────────────────────────────────────────────────────────────────────────

-- Auto-update updated_at on any row change
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_tournaments_updated_at
  before update on tournaments
  for each row execute function set_updated_at();

create trigger trg_matches_updated_at
  before update on matches
  for each row execute function set_updated_at();

-- Auto-create profile stub when a new auth user is created.
-- Gamertag and efootball_username are filled during onboarding.
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, gamertag, efootball_username, phone)
  values (new.id, null, null, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-close registration when tournament is full (Req 6 criterion 7)
create or replace function check_tournament_full()
returns trigger language plpgsql as $$
declare
  v_confirmed integer;
  v_max       integer;
begin
  if new.status = 'confirmed' then
    select count(*) into v_confirmed
    from registrations
    where tournament_id = new.tournament_id and status = 'confirmed';

    select max_slots into v_max
    from tournaments where id = new.tournament_id;

    if v_confirmed >= v_max then
      update tournaments
      set status = 'open'  -- stays open visually but registration button is hidden by slot check
      where id = new.tournament_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_check_tournament_full
  after insert or update on registrations
  for each row execute function check_tournament_full();

-- ───────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────────────────

alter table profiles           enable row level security;
alter table otp_codes          enable row level security;
alter table waitlist           enable row level security;
alter table tournaments        enable row level security;
alter table registrations      enable row level security;
alter table matches            enable row level security;
alter table result_submissions enable row level security;
alter table league_standings   enable row level security;
alter table payouts            enable row level security;
alter table push_notifications enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ────────────────────────────────────────────────────────────────
create policy "Players can view all profiles"
  on profiles for select using (true);

create policy "Players can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can update any profile"
  on profiles for update using (is_admin());

-- ── tournaments ─────────────────────────────────────────────────────────────
create policy "Anyone can view non-draft tournaments"
  on tournaments for select
  using (status != 'draft' or is_admin());

create policy "Admins can insert tournaments"
  on tournaments for insert with check (is_admin());

create policy "Admins can update tournaments"
  on tournaments for update using (is_admin());

-- ── registrations ───────────────────────────────────────────────────────────
create policy "Players can view own registrations"
  on registrations for select
  using (auth.uid() = player_id or is_admin());

create policy "Players can insert own registrations"
  on registrations for insert
  with check (auth.uid() = player_id);

create policy "Admins can update registrations"
  on registrations for update using (is_admin());

-- ── matches ─────────────────────────────────────────────────────────────────
create policy "Anyone can view matches"
  on matches for select using (true);

create policy "Admins can manage matches"
  on matches for all using (is_admin());

-- ── result_submissions ──────────────────────────────────────────────────────
create policy "Players can view submissions for their matches"
  on result_submissions for select
  using (
    auth.uid() = submitted_by or
    is_admin() or
    exists (
      select 1 from matches m
      where m.id = match_id
      and (m.player1_id = auth.uid() or m.player2_id = auth.uid())
    )
  );

create policy "Players can submit results for their matches"
  on result_submissions for insert
  with check (
    auth.uid() = submitted_by and
    exists (
      select 1 from matches m
      where m.id = match_id
      and (m.player1_id = auth.uid() or m.player2_id = auth.uid())
      and m.result_status = 'pending'
    )
  );

-- ── league_standings ────────────────────────────────────────────────────────
create policy "Anyone can view league standings"
  on league_standings for select using (true);

create policy "Admins can manage standings"
  on league_standings for all using (is_admin());

-- ── payouts ─────────────────────────────────────────────────────────────────
create policy "Players can view own payouts"
  on payouts for select
  using (auth.uid() = player_id or is_admin());

create policy "Admins can manage payouts"
  on payouts for all using (is_admin());

-- ── push_notifications ──────────────────────────────────────────────────────
create policy "Players can view own notifications"
  on push_notifications for select
  using (auth.uid() = player_id);

create policy "Service role can insert notifications"
  on push_notifications for insert
  with check (true);  -- restricted to service role key via API route

-- ── waitlist (public insert, admin read) ────────────────────────────────────
create policy "Anyone can join waitlist"
  on waitlist for insert with check (true);

create policy "Admins can view waitlist"
  on waitlist for select using (is_admin());

-- ── otp_codes (service role only) ───────────────────────────────────────────
create policy "No direct access to OTP codes"
  on otp_codes for all using (false);
