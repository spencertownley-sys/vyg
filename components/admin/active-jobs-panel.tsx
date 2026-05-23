"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface ActiveJob {
  run: {
    id: string;
    lineId: string;
    status: string;
    recordsFetched: number;
    recordsUpserted: number;
    recordsQuarantined: number;
    startedAt: string | null;
    progressJson: string;
  };
  line: { id: string; name: string };
}

function timeAgo(isoStr: string | null): string {
  if (!isoStr) return "—";
  const secs = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export function ActiveJobsPanel() {
  const [jobs, setJobs] = useState<ActiveJob[]>([]);
  const [lastChecked, setLastChecked] = useState<string>("");

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/jobs/active");
      if (!res.ok) return;
      const data = (await res.json()) as ActiveJob[];
      setJobs(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void poll();
    const id = setInterval(() => void poll(), 2000);
    return () => clearInterval(id);
  }, [poll]);

  if (jobs.length === 0) {
    return (
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "20px 24px",
          backgroundColor: "var(--surface)",
          marginBottom: 32,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Active Jobs
          </h2>
          {lastChecked && (
            <span style={{ fontSize: 12, color: "var(--subtle)" }}>checked {lastChecked}</span>
          )}
        </div>
        <p style={{ fontSize: 14, color: "var(--subtle)", marginTop: 12 }}>No active jobs.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        backgroundColor: "var(--surface)",
        marginBottom: 32,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Active Jobs ({jobs.length})
        </h2>
        {lastChecked && (
          <span style={{ fontSize: 12, color: "var(--subtle)" }}>checked {lastChecked}</span>
        )}
      </div>
      {jobs.map(({ run, line }) => {
        const progress = (() => {
          try { return (JSON.parse(run.progressJson) as string[]).slice(-3); }
          catch { return []; }
        })();
        return (
          <div
            key={run.id}
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`status-dot status-dot-${run.status}`} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{line.name}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-jetbrains-mono)",
                    color: "var(--subtle)",
                    padding: "2px 6px",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                  }}
                >
                  {run.status}
                </span>
              </div>
              <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>
                  <strong style={{ color: "var(--ink)" }}>{run.recordsFetched}</strong> fetched
                </span>
                <span style={{ color: "var(--muted)" }}>
                  <strong style={{ color: "var(--ink)" }}>{run.recordsUpserted}</strong> upserted
                </span>
              </div>
            </div>
            {progress.length > 0 && (
              <div
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-jetbrains-mono)",
                  color: "var(--subtle)",
                  backgroundColor: "var(--bg)",
                  padding: "8px 12px",
                  borderRadius: 4,
                }}
              >
                {progress[progress.length - 1]}
              </div>
            )}
            <Link
              href={`/admin/jobs/${run.id}`}
              style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}
            >
              View full log →
            </Link>
          </div>
        );
      })}
    </div>
  );
}
