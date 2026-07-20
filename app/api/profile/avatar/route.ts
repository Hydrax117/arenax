import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorised" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided." }, { status: 422 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only JPEG, PNG, or WebP files are allowed." },
        { status: 422 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File must be 2 MB or smaller." },
        { status: 422 },
      );
    }

    const admin = createAdminClient();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${session.user.id}/avatar.${ext}`;

    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from("avatars")
      .upload(path, bytes, {
        contentType: file.type,
        upsert: true, // overwrite existing avatar
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = admin.storage
      .from("avatars")
      .getPublicUrl(path);

    const avatarUrl = urlData.publicUrl;

    // Update profile
    const { error: updateError } = await admin
      .from("profiles")
      .update({ avatar_url: avatarUrl } as never)
      .eq("id", session.user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, avatarUrl }, { status: 200 });
  } catch (err) {
    console.error("[profile/avatar] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to upload avatar. Please try again." },
      { status: 500 },
    );
  }
}
