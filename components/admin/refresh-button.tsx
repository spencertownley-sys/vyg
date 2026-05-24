"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RefreshButtonProps {
  lineId: string;
  disabled?: boolean;
  onJobStart?: (jobId: string) => void;
}

export function RefreshButton({ lineId, disabled, onJobStart }: RefreshButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ingest/${lineId}`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { jobId: string };
      onJobStart?.(data.jobId);
      router.refresh();
    } catch (err) {
      alert(`Failed to queue job: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      aria-label={`Refresh ${lineId}`}
      style={{
        height: 32,
        padding: "0 12px",
        fontSize: 13,
        fontWeight: 500,
        border: "1px solid var(--border)",
        borderRadius: 6,
        backgroundColor: loading ? "var(--bg)" : "var(--surface)",
        color: disabled ? "var(--subtle)" : "var(--ink)",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        minWidth: 72,
      }}
    >
      {loading ? "Queuing…" : "Refresh"}
    </button>
  );
}

interface RefreshAllButtonProps {
  enabledLineIds: string[];
}

export function RefreshAllButton({ enabledLineIds }: RefreshAllButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (loading || enabledLineIds.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ingest/all", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      alert(`Failed to queue jobs: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || enabledLineIds.length === 0}
      style={{
        height: 40,
        padding: "0 20px",
        fontSize: 14,
        fontWeight: 500,
        border: "none",
        borderRadius: 6,
        backgroundColor: "var(--accent)",
        color: "var(--accent-fg)",
        cursor: loading || enabledLineIds.length === 0 ? "not-allowed" : "pointer",
        opacity: enabledLineIds.length === 0 ? 0.4 : 1,
        minHeight: 44,
      }}
    >
      {loading ? "Queuing…" : "Refresh All Enabled"}
    </button>
  );
}

export function RefreshPhotosButton() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function handleClick() {
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/admin/revalidate", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setState("done");
      setTimeout(() => setState("idle"), 3000);
    } catch (err) {
      alert(`Revalidation failed: ${String(err)}`);
      setState("idle");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      style={{
        height: 40,
        padding: "0 16px",
        fontSize: 13,
        fontWeight: 500,
        border: "1px solid var(--border)",
        borderRadius: 6,
        backgroundColor: "var(--surface)",
        color: "var(--ink)",
        cursor: state === "loading" ? "not-allowed" : "pointer",
        minHeight: 44,
      }}
    >
      {state === "loading" ? "Refreshing…" : state === "done" ? "✓ Photos refreshed" : "Refresh Photos"}
    </button>
  );
}
