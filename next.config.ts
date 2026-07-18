import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  // Disable PWA in development to avoid service worker noise
  disable: process.env.NODE_ENV === "development",

  // Output service worker to /public
  dest: "public",

  // Automatically register the service worker
  register: true,

  // Reload app when it comes back online
  reloadOnOnline: true,

  // Cache the start URL so the app loads offline
  cacheStartUrl: true,

  // Use dynamic start URL handling (handles auth redirects gracefully)
  dynamicStartUrl: true,

  // Cache resources on Next.js client-side navigation
  cacheOnFrontEndNav: true,

  // Fallback page served by the service worker when the user is offline
  fallbacks: {
    document: "/~offline",
  },

  workboxOptions: {
    // Remove outdated caches on activation
    cleanupOutdatedCaches: true,

    // Take control of all clients immediately on activation
    clientsClaim: true,

    // Skip the waiting phase so updates are applied straight away
    skipWaiting: true,

    // Strip common tracking query params when matching precache entries
    ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],

    // Exclude source maps and webpack manifests from precaching
    exclude: [/\.map$/, /^manifest.*\.js$/, /\/_next\/static\/.*(?<!\.p)\.woff2/],

    runtimeCaching: [
      // Google Fonts stylesheet — StaleWhileRevalidate
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
          expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      // Google Fonts webfont files — CacheFirst (immutable)
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Next.js static assets — CacheFirst
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-assets",
          expiration: {
            maxEntries: 256,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          },
        },
      },
      // Next.js image optimisation — StaleWhileRevalidate
      {
        urlPattern: /\/_next\/image\?.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-image-cache",
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
      // Static images in /public — CacheFirst
      {
        urlPattern: /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "image-cache",
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // API routes — NetworkFirst with offline fallback
      {
        urlPattern: /^\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // All other same-origin requests — NetworkFirst
      {
        urlPattern: ({ sameOrigin }) => sameOrigin,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
