import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyPreAuthToken } from "@/lib/auth/pre-auth-token";
import { createAdminClient } from "@/lib/supabase/admin";

const credentialsSchema = z.object({
  email:        z.string().email().toLowerCase(),
  preAuthToken: z.string().min(1),
});

export const authConfig = {
  providers: [
    Credentials({
      id: "otp",
      name: "Email OTP",
      credentials: {
        email:        { label: "Email",          type: "email" },
        preAuthToken: { label: "Pre-auth token", type: "text"  },
      },

      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, preAuthToken } = parsed.data;

        // Verify the short-lived HMAC token (OTP already consumed)
        const check = verifyPreAuthToken(preAuthToken);
        if (!check.valid || check.email !== email) return null;

        // Get or create a profile row for this email
        const admin = createAdminClient();

        const { data: existing } = (await admin
          .from("profiles")
          .select("id, gamertag, role")
          .eq("email", email)
          .maybeSingle()) as {
          data: { id: string; gamertag: string | null; role: string } | null;
        };

        if (existing) {
          return { id: existing.id, email, name: existing.gamertag ?? email };
        }

        // New user — create profile stub
        const newId = crypto.randomUUID();
        await (admin as ReturnType<typeof createAdminClient>)
          .from("profiles")
          .insert({ id: newId, email } as never);

        return { id: newId, email, name: email };
      },
    }),
  ],

  pages: {
    signIn:  "/login",
    error:   "/login",
    newUser: "/onboarding",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub   = user.id;
        token.email = user.email ?? token.email;

        const admin = createAdminClient();
        const { data: profile } = (await admin
          .from("profiles")
          .select("gamertag, role")
          .eq("id", user.id as string)
          .maybeSingle()) as {
          data: { gamertag: string | null; role: string } | null;
        };

        token.gamertag        = profile?.gamertag ?? null;
        token.role            = profile?.role ?? "player";
        token.needsOnboarding = !profile?.gamertag;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = session.user as any;
        u.gamertag        = token.gamertag        ?? null;
        u.role            = token.role            ?? "player";
        u.needsOnboarding = token.needsOnboarding ?? true;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60,
  },

  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
