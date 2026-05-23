import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCruiseLineById, getRecentIngestionRuns, getSailingCountByLine } from "@/db/queries";
import { RunsHistory } from "@/components/admin/runs-history";
import { RefreshButton } from "@/components/admin/refresh-button";

interface Props {
  params: Promise<{ lineId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lineId } = await params;
  const line = getCruiseLineById(lineId);
  return { title: line ? `${line.name} — Admin` : "Source — Admin" };
}

export default async function SourceDetailPage({ params }: Props) {
  const { lineId } = await params;
  const line = getCruiseLineById(lineId);
  if (!line) notFound();

  const allRuns = getRecentIngestionRuns(50);
  const lineRuns = allRuns.filter((r) => r.run.lineId === lineId);
  const sailingCount = getSailingCountByLine(lineId);

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <div style={{ marginBottom: 8 }}>
        <Link href="/admin" style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none" }}>
          ← Sources
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{line.name}</h1>
          <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", gap: 16 }}>
            <span>
              Crawler:{" "}
              <code
                style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: "var(--ink)" }}
              >
                {line.crawlerId}
              </code>
            </span>
            <span>{sailingCount.toLocaleString()} sailings</span>
            <span
              style={{
                color: line.enabled ? "var(--success)" : "var(--subtle)",
              }}
            >
              {line.enabled ? "● enabled" : "○ disabled"}
            </span>
          </div>
        </div>
        {line.enabled && <RefreshButton lineId={line.id} />}
      </div>

      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "20px 24px",
            backgroundColor: "var(--surface)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Website</div>
            <a
              href={line.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {line.websiteUrl}
            </a>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Booking URL template</div>
            <code
              style={{
                fontSize: 12,
                fontFamily: "var(--font-jetbrains-mono)",
                color: "var(--muted)",
                wordBreak: "break-all",
              }}
            >
              {line.bookingUrlTemplate}
            </code>
          </div>
        </div>
      </div>

      <RunsHistory runs={lineRuns} limit={50} />
    </div>
  );
}
