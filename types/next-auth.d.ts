import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      gamertag: string | null;
      role: "player" | "admin";
      needsOnboarding: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    sub: string;
    gamertag?: string | null;
    role?: string;
    needsOnboarding?: boolean;
  }
}
