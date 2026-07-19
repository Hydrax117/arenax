-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: Drop the foreign key from profiles to auth.users
--
-- The original schema tied profiles.id to auth.users(id) for Supabase Auth.
-- We now use NextAuth with JWT strategy and manage our own UUIDs in profiles.
-- The FK constraint causes "Key is not present in table users" errors.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
