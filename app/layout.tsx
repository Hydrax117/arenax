import type { Metadata, Viewport } from "next";
import { Orbitron, Exo_2, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

/* ── Fonts ──────────────────────────────────────────────────────────────── */

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ── Viewport ────────────────────────────────────────────────────────────── */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00e05a",
};

/* ── Metadata ────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL("https://arenax.com.ng"),

  title: {
    default: "ArenaX — Nigeria's #1 eFootball Mobile Tournament Platform",
    template: "%s | ArenaX",
  },
  description:
    "Join ArenaX — Nigeria's competitive eFootball Mobile arena. Discover tournaments, register online, compete with the best players, and win real Naira prizes paid directly to your bank account.",
  applicationName: "ArenaX",
  keywords: [
    "eFootball Nigeria",
    "eFootball Mobile tournament",
    "Nigerian gaming",
    "football gaming Nigeria",
    "esports Nigeria",
    "win Naira prizes",
    "online tournament Nigeria",
    "eFootball Mobile competition",
    "ArenaX",
    "ArenaX gaming",
    "Amateur gaming"
  ],
  authors: [{ name: "ArenaX" }],
  creator: "ArenaX",
  publisher: "ArenaX",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://arenax.com.ng",
    siteName: "ArenaX",
    title: "ArenaX — Nigeria's #1 eFootball Mobile Tournament Platform",
    description:
      "Compete in eFootball Mobile tournaments across Nigeria. Register, play, and win real Naira prizes paid directly to your bank account.",
    images: [
      {
        url: "/icons/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "ArenaX logo",
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: "summary",
    title: "ArenaX — Nigeria's eFootball Arena",
    description:
      "Compete in eFootball Mobile tournaments and win Naira prizes.",
    images: ["/icons/android-chrome-512x512.png"],
  },

  // Geo — Nigeria
  other: {
    "geo.region": "NG",
    "geo.placename": "Nigeria",
    "og:locale:alternate": "en_NG",
  },

  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ArenaX",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icons/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

/* ── Root Layout ─────────────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${exo2.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <AuthSessionProvider>
          <Navbar />
          <main className="flex-1 page-enter">{children}</main>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
