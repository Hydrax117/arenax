import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NIGERIAN_STATES } from "@/lib/constants";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = (sb: SupabaseClient<any>) => sb as SupabaseClient;

const schema = z.object({
  gamertag: z
    .string()
    .min(3, "Gamertag must be at least 3 characters")
    .max(20, "Gamertag must be 20 characters or fewer")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Gamertag can only contain letters, numbers and underscores",
    ),
  efootball_username: z
    .string()
    .min(1, "eFootball username is required")
    .max(50),
  nigerian_state: z.enum(NIGERIAN_STATES as unknown as [string, ...string[]]),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate the caller via next-auth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorised" },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    const body: unknown = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid input",
          field: parsed.error.issues[0]?.path[0],
        },
        { status: 422 },
      );
    }

    const { gamertag, efootball_username, nigerian_state, phone } =
      parsed.data;

    const admin = createAdminClient();

    // Check gamertag uniqueness (Req 2 criterion 4)
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("gamertag", gamertag)
      .neq("id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "That gamertag is already taken. Please choose another.",
          field: "gamertag",
        },
        { status: 409 },
      );
    }

    // Upsert profile
    const { error: upsertError } = await untyped(admin)
      .from("profiles")
      .upsert(
        {
          id: userId,
          gamertag,
          efootball_username,
          nigerian_state,
          phone: phone ?? null,
        },
        { onConflict: "id" },
      );

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[onboarding] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save profile. Please try again." },
      { status: 500 },
    );
  }
}
