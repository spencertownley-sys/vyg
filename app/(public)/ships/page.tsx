import type { Metadata } from "next";
import Link from "next/link";
import { getAllCruiseLines, getShipsByLine } from "@/db/queries";

export const metadata: Metadata = {
  title: "Cruise Ships",
  description: "Browse all cruise ships by line.",
};

export default function ShipsPage() {
  const lines = getAllCruiseLines();

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 40 }}>Cruise Ships</h1>
      {lines.map((line) => {
        const ships = getShipsByLine(line.id);
        if (ships.length === 0) return null;
        return (
          <section key={line.id} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
              <Link href={`/lines/${line.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                {line.name}
              </Link>
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ships.map((ship) => (
                <Link
                  key={ship.id}
                  href={`/ships/${ship.id}`}
                  style={{
                    fontSize: 14,
                    padding: "10px 16px",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--ink)",
                    textDecoration: "none",
                    minHeight: 44,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {ship.name}
                  {ship.yearBuilt && (
                    <span style={{ fontSize: 12, color: "var(--subtle)" }}>{ship.yearBuilt}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
