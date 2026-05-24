import type { Metadata } from "next";
import { getDeparturePortsWithCounts } from "@/db/queries";
import { PhotoCard } from "@/components/photo-card";
import { portPhotoUrl } from "@/lib/travel-photos";
import { getWikipediaThumbnail } from "@/lib/wiki-photos";

export const metadata: Metadata = {
  title: "Cruises From",
  description: "Browse cruises departing from ports around the world.",
};

// Wikipedia search topic per port ID — tuned to the exact article that gives
// the best representative photo of each city / port.
// Use specific landmark/place articles — country/territory names return flags.
const PORT_WIKI_TOPICS: Record<string, string> = {
  // USA — Florida
  "miami-fl":           "Miami Beach, Florida",     // Ocean Drive Art Deco
  "fort-lauderdale-fl": "Fort Lauderdale, Florida", // city skyline + waterways
  "port-canaveral-fl":  "Cape Canaveral",           // launch pads / coast
  "tampa-fl":           "Tampa, Florida",
  "jacksonville-fl":    "Jacksonville, Florida",
  // USA — Gulf / South
  "galveston-tx":       "Galveston, Texas",
  "new-orleans-la":     "New Orleans",
  // USA — East Coast
  "baltimore-md":       "Baltimore Inner Harbor",
  "new-york-ny":        "Manhattan",                // iconic skyline
  "charleston-sc":      "Charleston, South Carolina",
  // USA — Pacific Northwest
  "seattle-wa":         "Seattle",
  // Canada
  "vancouver-bc":       "Coal Harbour, Vancouver",  // skyline + seaplane terminal
  "victoria-bc":        "Victoria, British Columbia",
  // Europe — Med
  "barcelona-spain":    "Park Güell",               // iconic Gaudí mosaic terrace
  "rome-civitavecchia": "Trevi Fountain",           // iconic Rome landmark
  "athens-piraeus":     "Erechtheion",              // real Acropolis temple photo
  "southampton-uk":     "Southampton",
  // Australia / NZ
  "sydney-australia":   "Sydney Harbour Bridge",    // iconic arch bridge + opera house
  "auckland-nz":        "Auckland",                 // city skyline
  // Northern Europe
  "bergen-norway":      "Bryggen",                  // UNESCO wharf
  "stavanger-norway":   "Stavanger",
  "reykjavik-iceland":  "Hallgrímskirkja",          // dramatic church / skyline
  "amsterdam-netherlands": "Amsterdam",
  "copenhagen-denmark": "Nyhavn",                   // colorful canal district
};

export default async function CruisesFromPage() {
  const portsWithCounts = getDeparturePortsWithCounts();

  // Fetch Wikipedia thumbnails in parallel; fall back to curated Unsplash IDs.
  const portPhotos = await Promise.all(
    portsWithCounts.map(async ({ port, count }) => {
      const topic = PORT_WIKI_TOPICS[port.id];
      const wikiUrl = topic ? await getWikipediaThumbnail(topic) : null;
      return {
        port,
        count,
        photoUrl: wikiUrl ?? portPhotoUrl(port.id, port.name),
      };
    })
  );

  // Group by region
  const byRegion = portPhotos.reduce<Record<string, typeof portPhotos>>(
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
              {rows.map(({ port, count, photoUrl }) => (
                <PhotoCard
                  key={port.id}
                  href={`/cruises-from/${port.id}`}
                  name={port.name}
                  photoUrl={photoUrl}
                  count={count}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
