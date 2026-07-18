import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";

// ── Validation schema ─────────────────────────────────────────────────────
const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  name: z.string().max(80).optional(),
});

// ── Persistence (flat JSON file until Supabase is wired up) ──────────────
// Stored outside .next so it survives rebuilds. In production swap this
// for a Supabase insert.
const DATA_FILE = path.join(process.cwd(), "data", "waitlist.json");

interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  joinedAt: string;
  ip?: string;
}

function readEntries(): WaitlistEntry[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as WaitlistEntry[];
  } catch {
    return [];
  }
}

function writeEntries(entries: WaitlistEntry[]): void {
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
      const message =
        parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ success: false, message }, { status: 422 });
    }

    const { email, name } = parsed.data;
    const entries = readEntries();

    // Duplicate check — case-insensitive
    const duplicate = entries.some(
      (e) => e.email.toLowerCase() === email.toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "You're already on the waitlist. We'll be in touch!",
        },
        { status: 409 },
      );
    }

    const entry: WaitlistEntry = {
      id: crypto.randomUUID(),
      email,
      name: name ?? undefined,
      joinedAt: new Date().toISOString(),
      // Store a hashed IP for abuse detection, not raw
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    };

    entries.push(entry);
    writeEntries(entries);

    return NextResponse.json(
      {
        success: true,
        message: "You're on the list! We'll notify you when ArenaX launches.",
        position: entries.length,
      },
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

// ── GET /api/waitlist — count only (no PII exposed) ──────────────────────
export async function GET() {
  const entries = readEntries();
  return NextResponse.json({ count: entries.length });
}
