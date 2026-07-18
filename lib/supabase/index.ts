/**
 * Supabase client exports.
 *
 * IMPORTANT — import rules:
 *  - createBrowserClient: safe in Client Components AND server
 *  - createServerClient:  server-only (Server Components, Route Handlers, proxy.ts)
 *  - createAdminClient:   server-only, bypasses RLS
 *
 * Never import createServerClient or createAdminClient in a "use client" file.
 * Import them directly from their module files to avoid bundling next/headers on the client.
 */

// Browser client — safe everywhere
export { createClient as createBrowserClient } from "./client";

// Server exports — DO NOT import these in Client Components
// Import directly: import { createClient } from "@/lib/supabase/server"
// Import directly: import { createAdminClient } from "@/lib/supabase/admin"
