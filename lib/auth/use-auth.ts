"use client";

/**
 * Re-exports next-auth/react hooks with our extended session type.
 * Use these throughout the app instead of importing next-auth/react directly.
 */
export {
  useSession,
  signIn,
  signOut,
} from "next-auth/react";

export type { Session } from "next-auth";
