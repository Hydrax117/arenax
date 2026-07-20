"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AvatarUpload() {
  const router  = useRouter();
  const ref     = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const form = new FormData();
    form.append("avatar", file);

    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
      const data = (await res.json()) as { success: boolean; message?: string };

      if (!data.success) {
        setError(data.message ?? "Upload failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-body font-semibold",
          "text-fg-muted hover:text-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        )}
        aria-label="Change avatar photo"
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" aria-hidden="true" />
        ) : (
          <Camera size={13} aria-hidden="true" />
        )}
        {loading ? "Uploading…" : "Change photo"}
      </button>
      {error && (
        <p role="alert" className="text-[10px] text-error font-body max-w-[160px] text-center">
          {error}
        </p>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
