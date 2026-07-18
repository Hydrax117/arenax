import { NextResponse } from "next/server";
import { signOut } from "@/auth";

export async function POST() {
  try {
    await signOut({ redirect: false });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[sign-out] error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
