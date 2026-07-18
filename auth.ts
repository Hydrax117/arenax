import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { createAdminClient } from "@/lib/supabase/admin";

const credentialsSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6),
});

export const authConfig = {
  // SupabaseAdapter expects { url, secret } and uses the next_auth schema
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  providers: [
    Credentials({
      id: "otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code:  { label: "Code",  type: "text"  },
      },

      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, code } = parsed.data;
        const result = await verifyOtp(email, code);
        if (!result.success) return null;

        // Return a minimal user object — the adapter will upsert it
        return {
          id:            email,   // temp ID; adapter replaces with UUID
          email,
          emailVerified: new Date(),
        };
      },
    }),
  ],

  pages: {
    signIn:   "/login",
    error:    "/login",
    newUser:  "/onboarding",
  },

  callbacks: {
    async session({ session, user }) {
      if (user?.id) {
        session.user.id = user.id;

        // Attach ArenaX profile fields to the session
        const admin = createAdminClient();
        const { data: profile } = (await admin
          .from("profiles")
          .select("gamertag, role")
          .eq("id", user.id)
          .maybeSingle()) as {
          data: { gamertag: string | null; role: string } | null;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = session.user as any;
        u.gamertag       = profile?.gamertag ?? null;
        u.role           = profile?.role ?? "player";
        u.needsOnboarding = !profile?.gamertag;
      }
      return session;
    },
  },

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
