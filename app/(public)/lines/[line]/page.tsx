import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCruiseLineById, getShipsByLine, searchSailings } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";

interface Props {
  params: Promise<{ line: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { line: lineId } = await params;
  const line = getCruiseLineById(lineId);
  if (!line) return {};
  return {
    title: line.name,
    description: `Browse all sailings and ships for ${line.name}.`,
  };
}

export default async function LinePage({ params }: Props) {
  const { line: lineId } = await params;
  const line = getCruiseLineById(lineId);
  if (!line) notFound();

  const ships = getShipsByLine(lineId);
  const sailings = searchSailings({ lineId }, 12, 0);

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>{line.name}</h1>
      <a
        href={line.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 14, color: "var(--muted)", display: "block", marginBottom: 40 }}
      >
        {line.websiteUrl} ↗
      </a>

      {ships.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Ships</h2>
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
                }}
              >
                {ship.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Upcoming Sailings</h2>
          <Link href={`/search?lineId=${lineId}`} style={{ fontSize: 14, color: "var(--muted)" }}>View all →</Link>
        </div>
        {sailings.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No sailings found.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {sailings.map(({ sailing, ship, departurePort }) => (
              <SailingCard
                key={sailing.id}
                id={sailing.id}
                shipName={ship.name}
                lineName={line.name}
                departurePort={departurePort.name}
                arrivalPort={departurePort.name}
                departDate={sailing.departDate}
                nights={sailing.nights}
                destination={sailing.destination}
                sampleFares={JSON.parse(sailing.sampleFares) as Record<string, number>}
                charterFlag={sailing.charterFlag}
                charterName={sailing.charterName}
                bookingUrl={sailing.bookingUrl}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
