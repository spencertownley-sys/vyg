import Link from "next/link";

interface Run {
  id: string;
  lineId: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  recordsUpserted: number;
  recordsQuarantined: number;
  errorMessage: string | null;
}

interface LineInfo {
  id: string;
  name: string;
}

interface RunsHistoryProps {
  runs: Array<{ run: Run; line: LineInfo }>;
  limit?: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  failed: "Failed",
  aborted: "Aborted",
  running: "Running",
  pending: "Pending",
};

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "completed" ? "var(--success)" :
    status === "failed" || status === "aborted" ? "var(--danger)" :
    "var(--muted)";

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
      <span className={`status-dot status-dot-${status}`} />
      <span style={{ color }}>{STATUS_LABELS[status] ?? status}</span>
    </span>
  );
}

export function RunsHistory({ runs, limit = 10 }: RunsHistoryProps) {
  const displayed = runs.slice(0, limit);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        backgroundColor: "var(--surface)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Recent Runs
        </h2>
      </div>
      {displayed.length === 0 ? (
        <p style={{ padding: "20px 24px", fontSize: 14, color: "var(--subtle)" }}>No runs yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Line", "Status", "Started", "Records", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 16px",
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
            {displayed.map(({ run, line }, i) => (
              <tr
                key={run.id}
                style={{
                  borderBottom: i < displayed.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <td style={{ padding: "12px 16px", fontSize: 14 }}>{line.name}</td>
                <td style={{ padding: "12px 16px" }}>
                  <StatusBadge status={run.status} />
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "var(--muted)",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                >
                  {formatDate(run.startedAt)}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)" }}>
                  {run.recordsUpserted.toLocaleString()} upserted
                  {run.recordsQuarantined > 0 && (
                    <span style={{ color: "var(--danger)", marginLeft: 8 }}>
                      {run.recordsQuarantined} quarantined
                    </span>
                  )}
                  {(run.status === "failed" || run.status === "aborted") && run.errorMessage && (
                    <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 2, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {run.errorMessage}
                    </div>
                  )}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Link
                    href={`/admin/jobs/${run.id}`}
                    style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}
                  >
                    Logs →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
