import type { Metadata } from "next";
import { getDeparturePortsWithCounts } from "@/db/queries";
import { PhotoCard } from "@/components/photo-card";

export const metadata: Metadata = {
  title: "Cruises From",
  description: "Browse cruises departing from ports around the world.",
};

function portPhotoUrl(portName: string, portId: string) {
  const keyword = encodeURIComponent(portName.split(",")[0].trim() + " port harbor");
  return `https://source.unsplash.com/600x600/?${keyword}&sig=${encodeURIComponent(portId)}`;
}

export default function CruisesFromPage() {
  const portsWithCounts = getDeparturePortsWithCounts();

  // Group by region
  const byRegion = portsWithCounts.reduce<Record<string, typeof portsWithCounts>>(
    (acc, row) => {
      const region = row.port.region;
      if (!acc[region]) acc[region] = [];
      acc[region].push(row);
      return acc;
    },
    {}
  );

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>Cruises From</h1>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 40 }}>
        Browse sailings by departure port.
      </p>

      {Object.entries(byRegion)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([region, rows]) => (
          <section key={region} style={{ marginBottom: 48 }}>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                marginBottom: 18,
              }}
            >
              {region}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              {rows.map(({ port, count }) => (
                <PhotoCard
                  key={port.id}
                  href={`/cruises-from/${port.id}`}
                  name={port.name}
                  photoUrl={portPhotoUrl(port.name, port.id)}
                  count={count}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
