"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  loading: boolean;
}

/**
 * Hook — subscribes to Supabase auth state changes.
 * Returns the current user and a loading flag.
 * Safe to call in any Client Component.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createBrowserClient();

    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setState({ user: data.user, loading: false });
    });

    // Subscribe to auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, loading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

/**
 * Sign out — calls the API route which clears the server-side cookie,
 * then clears the client-side session.
 */
export async function signOut(): Promise<void> {
  const supabase = createBrowserClient();
  await fetch("/api/auth/sign-out", { method: "POST" });
  await supabase.auth.signOut();
}
