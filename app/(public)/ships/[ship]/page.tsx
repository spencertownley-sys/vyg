import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getShipById, getSailingsByShip } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";

interface Props {
  params: Promise<{ ship: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ship: shipId } = await params;
  const ship = getShipById(shipId);
  if (!ship) return {};
  return {
    title: ship.name,
    description: `Browse upcoming sailings on ${ship.name} — ${ship.line.name}.`,
  };
}

export default async function ShipPage({ params }: Props) {
  const { ship: shipId } = await params;
  const ship = getShipById(shipId);
  if (!ship) notFound();

  const sailings = getSailingsByShip(shipId, 24);

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <div style={{ marginBottom: 8 }}>
        <Link href={`/lines/${ship.lineId}`} style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none" }}>
          {ship.line.name}
        </Link>
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 24 }}>{ship.name}</h1>

      <div style={{ display: "flex", gap: 32, marginBottom: 40, flexWrap: "wrap" }}>
        {ship.shipClass && (
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Class</div>
            <div style={{ fontSize: 14 }}>{ship.shipClass}</div>
          </div>
        )}
        {ship.yearBuilt && (
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Built</div>
            <div style={{ fontSize: 14 }}>{ship.yearBuilt}</div>
          </div>
        )}
        {ship.capacity && (
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Capacity</div>
            <div style={{ fontSize: 14 }}>{ship.capacity.toLocaleString()} guests</div>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Upcoming Sailings</h2>
      {sailings.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No upcoming sailings.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {sailings.map(({ sailing, ship: s, line, departurePort }) => (
            <SailingCard
              key={sailing.id}
              id={sailing.id}
              shipName={s.name}
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
    </div>
  );
}
