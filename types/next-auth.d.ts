import type { DefaultSession } from "next-auth";

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
