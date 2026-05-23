import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getIngestionRunById, getCruiseLineById } from "@/db/queries";

interface Props {
  params: Promise<{ jobId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { jobId } = await params;
  return { title: `Job ${jobId.slice(0, 8)} — Admin` };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

const STATUS_COLORS: Record<string, string> = {
  completed: "var(--success)",
  failed: "var(--danger)",
  aborted: "var(--danger)",
  running: "var(--muted)",
  pending: "var(--muted)",
};

export default async function JobDetailPage({ params }: Props) {
  const { jobId } = await params;
  const run = getIngestionRunById(jobId);
  if (!run) notFound();

  const line = getCruiseLineById(run.lineId);
  const progressLog = (() => {
    try { return JSON.parse(run.progressJson) as string[]; }
    catch { return []; }
  })();

  const durationMs =
    run.startedAt && run.completedAt
      ? new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()
      : null;

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <div style={{ marginBottom: 8 }}>
        <Link
          href={`/admin/sources/${run.lineId}`}
          style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none" }}
        >
          ← {line?.name ?? run.lineId}
        </Link>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Job detail</h1>
        <code
          style={{
            fontSize: 12,
            fontFamily: "var(--font-jetbrains-mono)",
            color: "var(--subtle)",
          }}
        >
          {run.id}
        </code>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {[
          { label: "Status", value: run.status, color: STATUS_COLORS[run.status] },
          { label: "Triggered by", value: run.triggeredBy },
          { label: "Started", value: formatDate(run.startedAt) },
          { label: "Completed", value: formatDate(run.completedAt) },
          { label: "Duration", value: durationMs != null ? `${(durationMs / 1000).toFixed(1)}s` : "—" },
          { label: "Fetched", value: run.recordsFetched.toLocaleString() },
          { label: "Upserted", value: run.recordsUpserted.toLocaleString() },
          { label: "Quarantined", value: run.recordsQuarantined.toLocaleString(), color: run.recordsQuarantined > 0 ? "var(--danger)" : undefined },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "16px",
              backgroundColor: "var(--surface)",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
            <div
              style={{
                fontSize: label === "Started" || label === "Completed" ? 12 : 14,
                fontWeight: 500,
                color: color ?? "var(--ink)",
                fontFamily:
                  label === "Started" || label === "Completed"
                    ? "var(--font-jetbrains-mono)"
                    : undefined,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Error message */}
      {run.errorMessage && (
        <div
          style={{
            border: "1px solid var(--danger)",
            borderRadius: 8,
            padding: "16px 20px",
            backgroundColor: "var(--surface)",
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--danger)", marginBottom: 8 }}>
            Error
          </div>
          <pre
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 13,
              color: "var(--ink)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
            }}
          >
            {run.errorMessage}
          </pre>
        </div>
      )}

      {/* Progress log */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Progress log</h2>
        {progressLog.length === 0 ? (
          <p style={{ color: "var(--subtle)", fontSize: 14 }}>No log entries.</p>
        ) : (
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              backgroundColor: "var(--bg)",
              padding: "16px",
              maxHeight: 480,
              overflowY: "auto",
            }}
          >
            {progressLog.map((entry, i) => (
              <div
                key={i}
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 12,
                  color: "var(--muted)",
                  lineHeight: 1.7,
                  paddingBottom: 2,
                }}
              >
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
