import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortById, getSailingsByDeparturePort } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";

interface Props {
  params: Promise<{ port: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { port: portId } = await params;
  const port = getPortById(portId);
  if (!port) return {};
  return {
    title: `Cruises from ${port.name}`,
    description: `Browse all cruises departing from ${port.name}.`,
  };
}

export default async function CruisesFromPortPage({ params }: Props) {
  const { port: portId } = await params;
  const port = getPortById(portId);
  if (!port) notFound();

  const sailings = getSailingsByDeparturePort(portId, 48);

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
        Cruises from {port.name}
      </h1>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 40 }}>
        {port.city}, {port.country} · {port.region}
      </p>
      {sailings.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No sailings found from this port.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {sailings.map(({ sailing, ship, line }) => (
            <SailingCard
              key={sailing.id}
              id={sailing.id}
              shipName={ship.name}
              lineName={line.name}
              departurePort={port.name}
              arrivalPort={port.name}
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
