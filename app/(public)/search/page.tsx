import type { Metadata } from "next";
import { Suspense } from "react";
import { searchSailings, getDestinations, getAllPorts, getAllShips } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SearchBar } from "@/components/search-bar";
import type { SearchFilters } from "@/db/queries";

export const metadata: Metadata = {
  title: "Search Cruises",
  description: "Search thousands of cruises by destination, port, ship, duration, and more.",
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string>>;
}

function SearchContent({ params }: { params: Record<string, string> }) {
  const filters: SearchFilters = {};
  if (params.month) filters.month = params.month;
  if (params.destination) filters.destination = decodeURIComponent(params.destination);
  if (params.departurePort) filters.departurePort = params.departurePort;
  if (params.arrivalPort) filters.arrivalPort = params.arrivalPort;
  if (params.ship) filters.ship = params.ship;
  if (params.durationBucket) filters.durationBucket = params.durationBucket as SearchFilters["durationBucket"];
  if (params.charter === "true") filters.charter = true;

  const offset = parseInt(params.offset ?? "0", 10);
  const results = searchSailings(filters, 24, offset);

  const destinations = getDestinations().map((d) => ({ value: d, label: d }));
  const ports = getAllPorts().map((p) => ({ value: p.id, label: p.name }));
  const ships = getAllShips().map(({ ship }) => ({ value: ship.id, label: ship.name }));

  return (
    <div style={{ display: "flex", gap: 40 }}>
      <Suspense>
        <FilterSidebar destinations={destinations} ports={ports} ships={ships} />
      </Suspense>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
          {results.length === 0 ? "No sailings found." : `${results.length} sailings`}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {results.map(({ sailing, ship, line, departurePort }) => (
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
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        {q ? `Results for "${q}"` : "Search Cruises"}
      </h1>
      <div style={{ marginBottom: 32 }}>
        <Suspense>
          <SearchBar defaultValue={q} />
        </Suspense>
      </div>
      <Suspense fallback={<div style={{ color: "var(--muted)" }}>Loading...</div>}>
        <SearchContent params={params} />
      </Suspense>
    </div>
  );
}
