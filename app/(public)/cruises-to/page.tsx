import type { Metadata } from "next";
import { getDestinationsWithCounts } from "@/db/queries";
import { PhotoCard } from "@/components/photo-card";
import { destinationPhotoUrl } from "@/lib/travel-photos";

export const metadata: Metadata = {
  title: "Cruises To",
  description: "Browse cruises by destination — Caribbean, Mediterranean, Alaska, and more.",
};

function destinationSlug(dest: string) {
  return encodeURIComponent(dest.toLowerCase().replace(/\s+/g, "-"));
}

export default function CruisesToPage() {
  const destinations = getDestinationsWithCounts();

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>Cruises To</h1>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 40 }}>
        Browse sailings by destination.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {destinations.map(({ destination, count }) => (
          <PhotoCard
            key={destination}
            href={`/cruises-to/${destinationSlug(destination)}`}
            name={destination}
            photoUrl={destinationPhotoUrl(destination)}
            count={count}
          />
        ))}
      </div>
    </div>
  );
}
