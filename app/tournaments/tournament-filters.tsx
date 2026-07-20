"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { TournamentStatus } from "@/types/database";

const FILTERS: { label: string; value: TournamentStatus | "all" }[] = [
  { label: "All",       value: "all" },
  { label: "Open",      value: "open" },
  { label: "Live",      value: "ongoing" },
  { label: "Completed", value: "completed" },
];

interface Props {
  activeStatus?: TournamentStatus;
  total: number;
}

export function TournamentFilters({ activeStatus }: Props) {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  function handleFilter(value: TournamentStatus | "all") {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("page"); // reset to page 1 on filter change
    if (value === "all") {
      p.delete("status");
    } else {
      p.set("status", value);
    }
    const qs = p.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  const active = activeStatus ?? "all";

  return (
    <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter tournaments by status">
      {FILTERS.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleFilter(value)}
          aria-pressed={active === value}
          className={cn(
            "min-h-[36px] px-4 rounded-lg text-sm font-body font-semibold transition-all duration-150",
            "border",
            active === value
              ? "bg-green text-bg-base border-green shadow-[0_0_12px_rgba(0,224,90,0.25)]"
              : "text-fg-secondary border-border hover:border-green hover:text-green",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
