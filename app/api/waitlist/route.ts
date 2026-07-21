import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { sendWaitlistWelcomeEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  name:  z.string().max(80).optional(),
});

const USE_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── File fallback ─────────────────────────────────────────────────────────
const DATA_FILE = path.join(process.cwd(), "data", "waitlist.json");

interface FileEntry { id: string; email: string; name?: string; joinedAt: string; }

function fileRead(): FileEntry[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as FileEntry[];
  } catch { return []; }
}

function fileWrite(entries: FileEntry[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

// ── POST /api/waitlist ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 422 },
      );
    }

    const { email, name } = parsed.data;

    // ── Supabase path ─────────────────────────────────────────────────────
    if (USE_SUPABASE) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("waitlist").insert({ email, name: name ?? null } as any);

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json(
            { success: false, message: "You're already on the waitlist — we'll be in touch!" },
            { status: 409 },
          );
        }
        throw error;
      }

      const { count } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true });

      const position = count ?? 1;

      // Send welcome email (non-blocking)
      await sendWaitlistWelcomeEmail(email, name, position);

      return NextResponse.json(
        { success: true, message: "You're on the list! Check your inbox for a welcome email.", position },
        { status: 201 },
      );
    }

    // ── File fallback ─────────────────────────────────────────────────────
    const entries = fileRead();
    const duplicate = entries.some((e) => e.email.toLowerCase() === email.toLowerCase());

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "You're already on the waitlist — we'll be in touch!" },
        { status: 409 },
      );
    }

    entries.push({ id: crypto.randomUUID(), email, name: name ?? undefined, joinedAt: new Date().toISOString() });
    fileWrite(entries);

    const position = entries.length;
    await sendWaitlistWelcomeEmail(email, name, position);

    return NextResponse.json(
      { success: true, message: "You're on the list! Check your inbox for a welcome email.", position },
      { status: 201 },
    );
  } catch (err) {
    console.error("[waitlist] POST error:", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

// ── GET /api/waitlist — count only ────────────────────────────────────────
export async function GET() {
  try {
    if (USE_SUPABASE) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const { count } = await supabase.from("waitlist").select("*", { count: "exact", head: true });
      return NextResponse.json({ count: count ?? 0 });
    }
    return NextResponse.json({ count: fileRead().length });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
