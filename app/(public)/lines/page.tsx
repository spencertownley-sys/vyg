import type { Metadata } from "next";
import Link from "next/link";
import { getAllCruiseLines, getSailingCountByLine } from "@/db/queries";

export const metadata: Metadata = {
  title: "Cruise Lines",
  description: "Browse all cruise lines on vyg.",
};

export default function LinesPage() {
  const lines = getAllCruiseLines();

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 40 }}>Cruise Lines</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        {lines.map((line, i) => {
          const count = getSailingCountByLine(line.id);
          return (
            <Link
              key={line.id}
              href={`/lines/${line.id}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: i < lines.length - 1 ? "1px solid var(--border)" : "none",
                textDecoration: "none",
                color: "var(--ink)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{line.name}</div>
                <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 2 }}>{line.websiteUrl}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 600 }}>{count.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>sailings</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
