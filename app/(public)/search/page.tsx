import type { Metadata } from "next";
import { Suspense } from "react";
import { searchSailings, getDestinations, getAllPorts, getAllShips, getAllCruiseLines } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SortButton } from "@/components/sort-button";
import { SearchBar } from "@/components/search-bar";
import type { SearchFilters, SortBy } from "@/db/queries";

export const metadata: Metadata = {
  title: "Search Cruises",
  description: "Search thousands of cruises by destination, port, ship, duration, and more.",
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string>>;
}

const VALID_SORTS = new Set(["date-asc","date-desc","price-asc","price-desc","nights-asc","nights-desc"]);

function SearchContent({ params }: { params: Record<string, string> }) {
  const filters: SearchFilters = {};
  if (params.month) filters.month = params.month;
  if (params.destination) filters.destination = decodeURIComponent(params.destination);
  if (params.departurePort) filters.departurePort = params.departurePort;
  if (params.arrivalPort) filters.arrivalPort = params.arrivalPort;
  if (params.ship) filters.ship = params.ship;
  if (params.durationBucket) filters.durationBucket = params.durationBucket as SearchFilters["durationBucket"];
  if (params.charter === "true") filters.charter = true;
  if (params.lines) filters.lineIds = params.lines.split(",").filter(Boolean);
  if (params.sortBy && VALID_SORTS.has(params.sortBy)) filters.sortBy = params.sortBy as SortBy;

  const offset = parseInt(params.offset ?? "0", 10);
  const LIMIT = 48;
  const results = searchSailings(filters, LIMIT, offset);

  const destinations = getDestinations().map((d) => ({ value: d, label: d }));
  const ports = getAllPorts().map((p) => ({ value: p.id, label: p.name }));
  const ships = getAllShips().map(({ ship }) => ({ value: ship.id, label: ship.name }));
  const lines = getAllCruiseLines().map((l) => ({ value: l.id, label: l.name }));

  const countLabel = results.length === LIMIT
    ? `${LIMIT}+ sailings`
    : results.length === 0
    ? "No sailings found"
    : `${results.length} sailing${results.length !== 1 ? "s" : ""}`;

  return (
    <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
      <Suspense>
        <FilterSidebar destinations={destinations} ports={ports} ships={ships} lines={lines} />
      </Suspense>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Results header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>{countLabel}</p>
          <Suspense>
            <SortButton />
          </Suspense>
        </div>
        {results.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 15, paddingTop: 24 }}>
            Try removing some filters to see more results.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {results.map(({ sailing, ship, line, departurePort }) => (
              <SailingCard
                key={sailing.id}
                id={sailing.id}
                lineId={line.id}
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
