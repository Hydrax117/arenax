import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tournaments", "/tournaments/"],
        disallow: [
          "/api/",
          "/dashboard",
          "/profile",
          "/onboarding",
          "/admin",
          "/login",
          "/verify",
        ],
      },
    ],
    sitemap: "https://arenax.com.ng/sitemap.xml",
    host: "https://arenax.com.ng",
  };
}
