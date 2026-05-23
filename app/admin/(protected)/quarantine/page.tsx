import type { Metadata } from "next";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Quarantine — Admin",
};

const QUARANTINE_PATH = path.join(process.cwd(), "data", "quarantine.json");

interface QuarantineEntry {
  timestamp: string;
  jobId: string;
  lineId: string;
  reason: string;
  raw?: unknown;
  canonical?: unknown;
}

function loadQuarantine(): QuarantineEntry[] {
  try {
    const raw = fs.readFileSync(QUARANTINE_PATH, "utf-8");
    return (JSON.parse(raw) as QuarantineEntry[]).reverse();
  } catch {
    return [];
  }
}

export default function QuarantinePage() {
  const entries = loadQuarantine();

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Quarantine</h1>
      <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 32 }}>
        Records that failed validation during ingestion. They were not written to the database.
        Source file: <code style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12 }}>data/quarantine.json</code>
      </p>

      {entries.length === 0 ? (
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "40px 24px",
            textAlign: "center",
            backgroundColor: "var(--surface)",
          }}
        >
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No quarantined records.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>{entries.length} entries (newest first)</p>
          {entries.slice(0, 100).map((entry, i) => (
            <div
              key={i}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "20px 24px",
                backgroundColor: "var(--surface)",
              }}
            >
              <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "var(--font-jetbrains-mono)",
                    color: "var(--subtle)",
                  }}
                >
                  {entry.timestamp?.slice(0, 19).replace("T", " ")}
                </span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  Line: <strong>{entry.lineId}</strong>
                </span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  Job: <code style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{entry.jobId?.slice(0, 8)}</code>
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--danger)",
                  backgroundColor: "var(--bg)",
                  padding: "10px 14px",
                  borderRadius: 4,
                  fontFamily: "var(--font-jetbrains-mono)",
                  marginBottom: entry.raw ? 12 : 0,
                }}
              >
                {entry.reason}
              </div>
              {Boolean(entry.raw) && (
                <details>
                  <summary
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      cursor: "pointer",
                      marginTop: 12,
                    }}
                  >
                    Raw record
                  </summary>
                  <pre
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 11,
                      color: "var(--muted)",
                      backgroundColor: "var(--bg)",
                      padding: "12px",
                      borderRadius: 4,
                      overflowX: "auto",
                      marginTop: 8,
                    }}
                  >
                    {JSON.stringify(entry.raw, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
