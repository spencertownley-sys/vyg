import type { Metadata } from "next";
import { getCharterSailings } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";

export const metadata: Metadata = {
  title: "Charter Cruises",
  description: "Browse full-ship charter sailings across all cruise lines.",
};

export default function ChartersPage() {
  const sailings = getCharterSailings();

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>Charter Cruises</h1>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 40 }}>
        Full-ship charter sailings across all cruise lines. Contact the charter organizer to book.
      </p>
      {sailings.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No charter sailings found.</p>
      ) : (
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
      )}
    </div>
  );
}
