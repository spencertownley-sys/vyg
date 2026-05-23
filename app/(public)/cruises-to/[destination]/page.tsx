import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSailingsByDestination, getDestinations } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";

interface Props {
  params: Promise<{ destination: string }>;
}

function slugToDestination(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destination } = await params;
  const dest = slugToDestination(destination);
  return {
    title: `Cruises to ${dest}`,
    description: `Browse all cruises sailing to ${dest}.`,
  };
}

export default async function CruisesToDestPage({ params }: Props) {
  const { destination: slug } = await params;
  const dest = slugToDestination(slug);

  const sailings = getSailingsByDestination(dest, 48);
  if (sailings.length === 0) notFound();

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 40 }}>
        Cruises to {dest}
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {sailings.map(({ sailing, ship, line, departurePort }) => (
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
    </div>
  );
}
