import type { Metadata } from "next";
import { getDestinationsWithCounts } from "@/db/queries";
import { PhotoCard } from "@/components/photo-card";
import { destinationPhotoUrl } from "@/lib/travel-photos";
import { getWikipediaThumbnail } from "@/lib/wiki-photos";

export const metadata: Metadata = {
  title: "Cruises To",
  description: "Browse cruises by destination — Caribbean, Mediterranean, Alaska, and more.",
};

function destinationSlug(dest: string) {
  return encodeURIComponent(dest.toLowerCase().replace(/\s+/g, "-"));
}

// Use specific landmark/place articles — broad names return flags or maps.
const DEST_WIKI_TOPICS: Record<string, string> = {
  "Alaska":                  "Kenai Fjords National Park",   // glaciers & water
  "Australia & New Zealand": "Sydney Opera House",           // iconic landmark
  "Bahamas":                 "Exuma",                        // turquoise water
  "Bermuda":                 "Horseshoe Bay Beach",          // pink sand beach
  "Caribbean":               "Exuma",                        // turquoise water
  "Eastern Caribbean":       "Petit Piton",                  // dramatic Pitons
  "Mediterranean":           "Santorini",                    // blue domes
  "Northern Europe":         "Norwegian Fjords",             // fjords & scenery
  "Southern Caribbean":      "Barbados",                     // tropical island
  "Western Caribbean":       "Cozumel",                      // tropical island
  // "World" intentionally omitted — fallback Unsplash used
};

export default async function CruisesToPage() {
  const destinations = getDestinationsWithCounts();

  // Fetch Wikipedia thumbnails in parallel; fall back to curated Unsplash IDs.
  const destPhotos = await Promise.all(
    destinations.map(async ({ destination, count }) => {
      const topic = DEST_WIKI_TOPICS[destination];
      const wikiUrl = topic ? await getWikipediaThumbnail(topic) : null;
      return {
        destination,
        count,
        photoUrl: wikiUrl ?? destinationPhotoUrl(destination),
      };
    })
  );

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
        {destPhotos.map(({ destination, count, photoUrl }) => (
          <PhotoCard
            key={destination}
            href={`/cruises-to/${destinationSlug(destination)}`}
            name={destination}
            photoUrl={photoUrl}
            count={count}
          />
        ))}
      </div>
    </div>
  );
}
