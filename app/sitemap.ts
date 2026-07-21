import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "https://arenax.com.ng";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static routes ─────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE}/tournaments`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // ── Dynamic tournament routes ─────────────────────────────────────────
  let tournamentRoutes: MetadataRoute.Sitemap = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("tournaments")
      .select("id, updated_at")
      .in("status", ["open", "ongoing", "completed"])
      .order("updated_at", { ascending: false })
      .limit(500);

    if (data) {
      tournamentRoutes = (data as { id: string; updated_at: string }[]).map(
        (t) => ({
          url: `${BASE}/tournaments/${t.id}`,
          lastModified: new Date(t.updated_at),
          changeFrequency: "daily" as const,
          priority: 0.8,
        }),
      );
    }
  } catch (err) {
    // Non-fatal — sitemap still works without tournament URLs
    console.error("[sitemap] Failed to fetch tournaments:", err);
  }

  return [...staticRoutes, ...tournamentRoutes];
}
