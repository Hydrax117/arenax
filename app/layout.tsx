import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ---------------------------------------------------------------------------
// Viewport — themeColor lives here (deprecated in metadata since Next.js 14)
// ---------------------------------------------------------------------------
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export const metadata: Metadata = {
  title: {
    default: "ArenaX",
    template: "%s | ArenaX",
  },
  description: "ArenaX — your competitive arena",
  applicationName: "ArenaX",

  // Tells the browser where the web app manifest lives.
  // Next.js resolves app/manifest.ts automatically, but being explicit
  // makes the link tag appear in <head> unconditionally.
  manifest: "/manifest.webmanifest",

  // Apple-specific PWA meta
  appleWebApp: {
    capable: true,
    title: "ArenaX",
    statusBarStyle: "black-translucent",
  },

  // Standard icon references (complement the file-based manifest icons)
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/icons/favicon.ico",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
