import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[sign-out] error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
