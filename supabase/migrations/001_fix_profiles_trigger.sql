-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001: Fix profiles table and handle_new_user trigger
--
-- Problem: The trigger tried to insert a profile with a placeholder gamertag,
-- but the gamertag UNIQUE constraint caused "Database error creating new user"
-- when Supabase Auth tried to create the user.
--
-- Fix:
--   1. Make gamertag and efootball_username nullable (filled during onboarding)
--   2. Drop the unique constraint on gamertag temporarily, re-add as partial
--      unique (only enforced when gamertag IS NOT NULL)
--   3. Rewrite the trigger to insert a minimal row with no gamertag
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1: Make gamertag and efootball_username nullable
alter table profiles
  alter column gamertag drop not null,
  alter column efootball_username drop not null;

-- Step 2: Drop the old unique constraint on gamertag
alter table profiles drop constraint if exists profiles_gamertag_key;

-- Step 3: Add a partial unique index — only enforces uniqueness when gamertag is set
-- This allows multiple NULL gamertags (pre-onboarding users) but unique non-null ones
create unique index if not exists profiles_gamertag_unique
  on profiles (gamertag)
  where gamertag is not null;

-- Step 4: Drop the old format check constraint (gamertag can now be null)
alter table profiles drop constraint if exists gamertag_format;

-- Step 5: Add a new check that allows NULL but validates format when set
alter table profiles
  add constraint gamertag_format
  check (gamertag is null or gamertag ~ '^[a-zA-Z0-9_]{3,20}$');

-- Step 6: Rewrite the trigger to insert a minimal stub profile
-- No gamertag placeholder — onboarding fills that in
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, gamertag, efootball_username, phone)
  values (
    new.id,
    null,
    null,
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
