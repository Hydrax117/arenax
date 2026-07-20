import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to register." },
        { status: 401 },
      );
    }

    const { id: tournamentId } = await params;
    const playerId = session.user.id;
    const admin = createAdminClient();

    // Fetch tournament
    const { data: tournamentRaw, error: tError } = await admin
      .from("tournaments")
      .select("id, status, entry_fee, max_slots")
      .eq("id", tournamentId)
      .single();

    if (tError || !tournamentRaw) {
      return NextResponse.json(
        { success: false, message: "Tournament not found." },
        { status: 404 },
      );
    }

    const tournament = tournamentRaw as {
      id: string;
      status: string;
      entry_fee: number;
      max_slots: number;
    };

    // Only open tournaments accept registrations
    if (tournament.status !== "open") {
      return NextResponse.json(
        { success: false, message: "This tournament is no longer accepting registrations." },
        { status: 409 },
      );
    }

    // Check slot count (Req 6 criterion 5 & 7)
    const { count: confirmedCount } = await admin
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("tournament_id", tournamentId)
      .eq("status", "confirmed");

    if ((confirmedCount ?? 0) >= tournament.max_slots) {
      return NextResponse.json(
        { success: false, message: "This tournament is full." },
        { status: 409 },
      );
    }

    // Check duplicate (Req 6 criterion 6)
    const { data: existingRaw } = await admin
      .from("registrations")
      .select("id, status")
      .eq("tournament_id", tournamentId)
      .eq("player_id", playerId)
      .maybeSingle();

    const existing = existingRaw as { id: string; status: string } | null;

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            existing.status === "confirmed"
              ? "You are already registered for this tournament."
              : "You have a pending registration for this tournament.",
        },
        { status: 409 },
      );
    }

    // Free tournament — register immediately (Req 6 criterion 1)
    if (tournament.entry_fee === 0) {
      const { error: regError } = await admin.from("registrations").insert({
        tournament_id: tournamentId,
        player_id:     playerId,
        status:        "confirmed",
        paid_amount:   0,
      } as never);

      if (regError) throw regError;

      return NextResponse.json(
        { success: true, message: "You are registered! Good luck." },
        { status: 201 },
      );
    }

    // Paid tournament — initiate Paystack (Req 6 criterion 2)
    // TODO: wire up Paystack when payment integration is built.
    // For now create a pending registration and return a placeholder URL.
    const { error: regError } = await admin.from("registrations").insert({
      tournament_id: tournamentId,
      player_id:     playerId,
      status:        "pending",
      paid_amount:   0,
    } as never);

    if (regError) throw regError;

    return NextResponse.json(
      {
        success: true,
        requiresPayment: true,
        message: "Proceed to payment to complete registration.",
        // paymentUrl will be a real Paystack URL once integrated
        paymentUrl: `/tournaments/${tournamentId}?payment=pending`,
      },
      { status: 202 },
    );
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
