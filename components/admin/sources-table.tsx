"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RefreshButton } from "./refresh-button";

interface SourceRow {
  line: {
    id: string;
    name: string;
    enabled: boolean;
    crawlerId: string;
  };
  lastRun: {
    id: string;
    status: string;
    completedAt: string | null;
    startedAt: string | null;
  } | null;
  sailingCount: number;
}

function timeAgo(isoStr: string | null): string {
  if (!isoStr) return "never";
  const secs = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function StatusCell({ line, activeJobId }: { line: SourceRow["line"]; activeJobId: string | null }) {
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [pollingJobId, setPollingJobId] = useState<string | null>(activeJobId);

  const pollJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`);
      if (!res.ok) return;
      const data = (await res.json()) as { status: string };
      setJobStatus(data.status);
      if (data.status !== "running" && data.status !== "pending") {
        setPollingJobId(null);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!pollingJobId) return;
    void pollJob(pollingJobId);
    const id = setInterval(() => void pollJob(pollingJobId), 2000);
    return () => clearInterval(id);
  }, [pollingJobId, pollJob]);

  const effectiveStatus = jobStatus ?? (pollingJobId ? "running" : null);

  if (!line.enabled) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--subtle)" }}>
        <span className="status-dot status-dot-disabled" />
        disabled
      </span>
    );
  }

  if (effectiveStatus === "running" || effectiveStatus === "pending") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
        <span className="status-dot status-dot-running" />
        running
      </span>
    );
  }

  if (effectiveStatus === "failed" || effectiveStatus === "aborted") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--danger)" }}>
        <span className="status-dot status-dot-failed" />
        {effectiveStatus}
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
      <span className="status-dot status-dot-idle" />
      idle
    </span>
  );
}

export function SourcesTable({ rows }: { rows: SourceRow[] }) {
  const [activeJobs, setActiveJobs] = useState<Record<string, string>>({});

  function handleJobStart(lineId: string, jobId: string) {
    setActiveJobs((prev) => ({ ...prev, [lineId]: jobId }));
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "var(--surface)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Line", "Last Refresh", "Sailings", "Status", "Actions"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ line, lastRun, sailingCount }, i) => (
            <tr
              key={line.id}
              style={{
                borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              {/* Line */}
              <td style={{ padding: "16px", fontSize: 14, fontWeight: 500 }}>
                <Link
                  href={`/admin/sources/${line.id}`}
                  style={{ color: "var(--ink)", textDecoration: "none" }}
                >
                  {line.name}
                </Link>
              </td>

              {/* Last Refresh */}
              <td style={{ padding: "16px", fontSize: 13, color: "var(--muted)" }}>
                {timeAgo(lastRun?.completedAt ?? null)}
              </td>

              {/* Sailings */}
              <td style={{ padding: "16px", fontSize: 14 }}>
                {sailingCount.toLocaleString()}
              </td>

              {/* Status */}
              <td style={{ padding: "16px" }}>
                <StatusCell line={line} activeJobId={activeJobs[line.id] ?? null} />
              </td>

              {/* Actions */}
              <td style={{ padding: "16px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {line.enabled ? (
                    <>
                      <RefreshButton
                        lineId={line.id}
                        onJobStart={(jobId) => handleJobStart(line.id, jobId)}
                      />
                      <Link
                        href={`/admin/sources/${line.id}`}
                        style={{
                          height: 32,
                          padding: "0 12px",
                          fontSize: 13,
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          color: "var(--muted)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        Logs
                      </Link>
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: "var(--subtle)" }}>skeleton</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
