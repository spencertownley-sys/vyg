import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
    title: `${port.name} Cruise Port`,
    description: `Cruise port information and upcoming sailings from ${port.name}.`,
  };
}

export default async function PortPage({ params }: Props) {
  const { port: portId } = await params;
  const port = getPortById(portId);
  if (!port) notFound();

  const sailings = getSailingsByDeparturePort(portId, 24);

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>{port.name}</h1>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 8 }}>
        {port.city}{port.stateOrRegion ? `, ${port.stateOrRegion}` : ""} · {port.country} · {port.region}
      </p>
      <div style={{ display: "flex", gap: 16, marginBottom: 40 }}>
        <Link href={`/cruises-from/${port.id}`} style={{ fontSize: 14, padding: "10px 16px", border: "1px solid var(--border)", borderRadius: 6, textDecoration: "none", color: "var(--ink)", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
          Cruises from here
        </Link>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Upcoming Departures</h2>
      {sailings.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No upcoming sailings from this port.</p>
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
