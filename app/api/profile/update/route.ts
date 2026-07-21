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
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
  efootball_username: z.string().min(1, "Required").max(50),
  nigerian_state: z.enum(NIGERIAN_STATES as unknown as [string, ...string[]]),
  phone: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_name: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorised" }, { status: 401 });
    }

    const body: unknown = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input", field: parsed.error.issues[0]?.path[0] },
        { status: 422 },
      );
    }

    const { gamertag, efootball_username, nigerian_state, phone, bank_account_number, bank_name } = parsed.data;
    const userId = session.user.id;
    const admin = createAdminClient();

    // Uniqueness check — gamertag (Req 2 criterion 4)
    const { data: existingTag } = await admin
      .from("profiles")
      .select("id")
      .eq("gamertag", gamertag)
      .neq("id", userId)
      .maybeSingle();

    if (existingTag) {
      return NextResponse.json(
        { success: false, message: "That gamertag is already taken. Please choose a different one.", field: "gamertag" },
        { status: 409 },
      );
    }

    // Uniqueness check — phone number
    if (phone) {
      const { data: existingPhone } = await admin
        .from("profiles")
        .select("id")
        .eq("phone", phone)
        .neq("id", userId)
        .maybeSingle();

      if (existingPhone) {
        return NextResponse.json(
          { success: false, message: "That phone number is already linked to another account. Please use a different number.", field: "phone" },
          { status: 409 },
        );
      }
    }

    const { error } = await untyped(admin)
      .from("profiles")
      .update({
        gamertag,
        efootball_username,
        nigerian_state,
        phone: phone ?? null,
        bank_account_number: bank_account_number ?? null,
        bank_name: bank_name ?? null,
      })
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[profile/update] error:", err);
    return NextResponse.json({ success: false, message: "Failed to save profile." }, { status: 500 });
  }
}
