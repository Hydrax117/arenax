import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: { px: 24, class: "h-6 w-6 text-xs" },
  sm: { px: 32, class: "h-8 w-8 text-sm" },
  md: { px: 40, class: "h-10 w-10 text-sm" },
  lg: { px: 56, class: "h-14 w-14 text-lg" },
  xl: { px: 80, class: "h-20 w-20 text-2xl" },
};

export function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  const { px, class: sizeClass } = sizeMap[size];
  const initials = alt
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden",
        "border border-[rgba(0,255,102,0.25)] bg-bg-surface",
        "font-heading font-bold text-green",
        sizeClass,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
