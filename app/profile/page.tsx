import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfile, getPlayerStats, getPlayerTournamentHistory, getPlayerPayouts } from "@/lib/profile";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileEditForm } from "./profile-edit-form";
import { AvatarUpload } from "./avatar-upload";
import { TournamentHistoryTable } from "./tournament-history";
import { PayoutHistoryTable } from "./payout-history";
import { formatNaira } from "@/lib/utils";
import { Trophy, Gamepad2, MapPin, Phone, Building2 } from "lucide-react";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirect=/profile");

  const [profile, stats, history, payouts] = await Promise.all([
    getProfile(session.user.id),
    getPlayerStats(session.user.id),
    getPlayerTournamentHistory(session.user.id),
    getPlayerPayouts(session.user.id),
  ]);

  if (!profile) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Header card ── */}
        <div className="glass-green rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar + upload */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <Avatar
                src={profile.avatar_url}
                alt={profile.gamertag ?? session.user.email ?? "Player"}
                size="xl"
              />
              <AvatarUpload />
            </div>

            {/* Identity */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap mb-1">
                <h1 className="font-heading font-black text-2xl text-fg-primary">
                  {profile.gamertag ?? "No gamertag yet"}
                </h1>
                {profile.role === "admin" && (
                  <Badge variant="vip">Admin</Badge>
                )}
                {profile.status === "suspended" && (
                  <Badge variant="error">Suspended</Badge>
                )}
              </div>
              <p className="font-body text-sm text-fg-muted mb-4">
                {session.user.email}
              </p>

              {/* Quick meta */}
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                {profile.efootball_username && (
                  <MetaPill icon={<Gamepad2 size={13} />} label={profile.efootball_username} />
                )}
                {profile.nigerian_state && (
                  <MetaPill icon={<MapPin size={13} />} label={profile.nigerian_state} />
                )}
                {profile.phone && (
                  <MetaPill icon={<Phone size={13} />} label={profile.phone} />
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
            <StatCard value={String(stats.tournamentsEntered)} label="Tournaments" />
            <StatCard value={String(stats.wins)} label="Wins" />
            <StatCard
              value={formatNaira(stats.totalEarningsKobo / 100)}
              label="Earned"
              valueClass="text-green glow-green"
            />
          </div>
        </div>

        {/* ── Edit form ── */}
        <Section title="Edit Profile" icon={<Trophy size={18} />}>
          <ProfileEditForm profile={profile} />
        </Section>

        {/* ── Tournament history — Req 2 criterion 6 ── */}
        {history.length > 0 && (
          <Section title="Tournament History" icon={<Trophy size={18} />}>
            <TournamentHistoryTable entries={history} />
          </Section>
        )}

        {/* ── Payout history — Req 13 criterion 7 ── */}
        {payouts.length > 0 && (
          <Section title="Prize History" icon={<Building2 size={18} />}>
            <PayoutHistoryTable payouts={payouts} />
          </Section>
        )}
      </div>
    </div>
  );
}

function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-body text-xs text-fg-secondary">
      <span className="text-green" aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}

function StatCard({
  value, label, valueClass,
}: {
  value: string;
  label: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className={`font-heading font-black text-xl text-fg-primary ${valueClass ?? ""}`}>
        {value}
      </span>
      <span className="font-body text-[10px] text-fg-muted uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function Section({
  title, icon, children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading font-bold text-base text-fg-primary flex items-center gap-2 mb-4">
        <span className="text-green" aria-hidden="true">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
