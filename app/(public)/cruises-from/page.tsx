import type { Metadata } from "next";
import Link from "next/link";
import { getAllPorts } from "@/db/queries";

export const metadata: Metadata = {
  title: "Cruises From",
  description: "Browse cruises departing from ports around the world.",
};

export default function CruisesFromPage() {
  const ports = getAllPorts();
  const byRegion = ports.reduce<Record<string, typeof ports>>((acc, p) => {
    if (!acc[p.region]) acc[p.region] = [];
    acc[p.region].push(p);
    return acc;
  }, {});

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>Cruises From</h1>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 40 }}>
        Browse sailings by departure port.
      </p>
      {Object.entries(byRegion).sort(([a], [b]) => a.localeCompare(b)).map(([region, regionPorts]) => (
        <section key={region} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            {region}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {regionPorts.map((port) => (
              <Link
                key={port.id}
                href={`/cruises-from/${port.id}`}
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
                }}
              >
                {port.name}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
