-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: Add email column to profiles table
--
-- Since we switched from Supabase Auth to NextAuth with JWT strategy,
-- we no longer have auth.users. The profiles table is now the sole user store.
-- We need email to look up users on sign-in.
-- ─────────────────────────────────────────────────────────────────────────────

alter table profiles
  add column if not exists email text unique;

-- Index for fast email lookups
create index if not exists profiles_email_idx on profiles (email);

-- Drop the trigger that referenced auth.users (no longer needed)
drop trigger if exists trg_on_auth_user_created on auth.users;
drop function if exists handle_new_user() cascade;
