/**
 * ArenaX — Supabase connection test
 * Usage: node scripts/test-db.mjs
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local manually ──────────────────────────────────────────────
const envPath = resolve(__dirname, "../.env.local");
let envContent;
try {
  envContent = readFileSync(envPath, "utf-8");
} catch {
  console.error("❌  .env.local not found at", envPath);
  process.exit(1);
}

for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  process.env[key] = val;
}

// ── Validate vars ─────────────────────────────────────────────────────────
const SUPABASE_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY        = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error("❌  Missing env vars:");
  if (!SUPABASE_URL)  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  if (!ANON_KEY)      console.error("   - NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!SERVICE_KEY)   console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

console.log("🔑  Env vars loaded");
console.log("   URL:", SUPABASE_URL.replace(/https:\/\/([^.]{8})[^.]+(\.supabase\.co)/, "https://$1...$2"));

// ── Test 1: anon client — basic reachability ───────────────────────────────
console.log("\n📡  Test 1: anon client reachability...");
try {
  const anon = createClient(SUPABASE_URL, ANON_KEY);
  const { error } = await anon.from("waitlist").select("count").limit(1);
  if (error && error.code !== "42P01") {
    throw error;
  }
  if (error?.code === "42P01") {
    console.log("   ⚠️   Connected — schema not yet applied (run supabase/schema.sql)");
  } else {
    console.log("   ✅  Connected and waitlist table exists");
  }
} catch (err) {
  // PGRST116 = table not in schema cache = schema not applied yet
  if (err.message?.includes("schema cache") || err.code === "PGRST116") {
    console.log("   ⚠️   Connected — schema not yet applied (run supabase/schema.sql)");
  } else {
    console.error("   ❌  Anon client failed:", err.message ?? err);
    process.exit(1);
  }
}

// ── Test 2: service role client — write access ─────────────────────────────
console.log("\n🔐  Test 2: service role client...");
try {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await admin.from("waitlist").select("count").limit(1);
  if (error && error.code !== "42P01" && !error.message?.includes("schema cache")) {
    throw error;
  }
  console.log("   ✅  Service role client connected");
} catch (err) {
  console.error("   ❌  Service role client failed:", err.message ?? err);
  process.exit(1);
}

// ── Test 3: check which tables exist via RPC ───────────────────────────────
console.log("\n📋  Test 3: checking applied tables...");
try {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const expected = [
    "profiles", "otp_codes", "waitlist", "tournaments",
    "registrations", "matches", "result_submissions",
    "league_standings", "payouts", "push_notifications"
  ];

  // Query each table directly — fastest way via PostgREST
  const results = await Promise.all(
    expected.map(async (table) => {
      const { error } = await admin.from(table).select("count").limit(1);
      return { table, ok: !error };
    })
  );

  let allGood = true;
  for (const { table, ok } of results) {
    if (ok) {
      console.log(`   ✅  ${table}`);
    } else {
      console.log(`   ❌  ${table} — missing`);
      allGood = false;
    }
  }

  if (allGood) {
    console.log("\n🎉  All 10 tables present — database is ready!");
    console.log("\nNext step: build the auth flow (npm run dev)");
  } else {
    console.log("\n⚠️   Some tables missing — re-run supabase/schema.sql in the SQL Editor.");
  }
} catch (err) {
  console.error("   ❌  Table check failed:", err.message ?? err);
}
