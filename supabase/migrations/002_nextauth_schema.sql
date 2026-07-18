-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: next_auth schema for Auth.js / NextAuth v5 Supabase Adapter
--
-- Run this in your Supabase SQL Editor BEFORE using NextAuth.
-- The @auth/supabase-adapter uses the `next_auth` schema (not `public`).
-- Source: https://authjs.dev/getting-started/adapters/supabase
-- ─────────────────────────────────────────────────────────────────────────────

create schema if not exists next_auth;

grant usage             on schema next_auth to service_role;
grant all privileges    on schema next_auth to service_role;
grant all privileges    on all tables    in schema next_auth to service_role;
grant all privileges    on all sequences in schema next_auth to service_role;

-- ── Users ─────────────────────────────────────────────────────────────────
create table if not exists next_auth.users (
  id              uuid not null default gen_random_uuid(),
  name            text,
  email           text,
  "emailVerified" timestamptz,
  image           text,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email)
);

-- ── Accounts ──────────────────────────────────────────────────────────────
create table if not exists next_auth.accounts (
  id                   uuid not null default gen_random_uuid(),
  type                 text not null,
  provider             text not null,
  "providerAccountId"  text not null,
  refresh_token        text,
  access_token         text,
  expires_at           bigint,
  token_type           text,
  scope                text,
  id_token             text,
  session_state        text,
  "userId"             uuid,
  constraint accounts_pkey primary key (id),
  constraint accounts_userId_fkey foreign key ("userId")
    references next_auth.users(id) on delete cascade
);

-- ── Sessions ──────────────────────────────────────────────────────────────
create table if not exists next_auth.sessions (
  id             uuid not null default gen_random_uuid(),
  expires        timestamptz not null,
  "sessionToken" text not null,
  "userId"       uuid,
  constraint sessions_pkey primary key (id),
  constraint sessions_sessionToken_key unique ("sessionToken"),
  constraint sessions_userId_fkey foreign key ("userId")
    references next_auth.users(id) on delete cascade
);

-- ── Verification tokens ───────────────────────────────────────────────────
create table if not exists next_auth.verification_tokens (
  identifier text not null,
  expires    timestamptz not null,
  token      text not null,
  constraint verification_tokens_pkey primary key (token)
);

-- ── Indexes ───────────────────────────────────────────────────────────────
create index if not exists accounts_userId_idx
  on next_auth.accounts ("userId");
create index if not exists sessions_userId_idx
  on next_auth.sessions ("userId");

-- ── Helper: sync next_auth user to public.profiles on creation ───────────
-- When NextAuth creates a user in next_auth.users, also create a stub
-- in public.profiles so our app code can find it.
create or replace function next_auth.on_user_created()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, gamertag, efootball_username, phone)
  values (new.id, null, null, null)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_next_auth_user_created on next_auth.users;
create trigger trg_next_auth_user_created
  after insert on next_auth.users
  for each row execute function next_auth.on_user_created();
