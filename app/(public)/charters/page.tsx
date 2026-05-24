import type { Metadata } from "next";
import { Suspense } from "react";
import {
  searchSailings, getDestinations,
  getAllPorts, getAllShips, getAllCruiseLines,
} from "@/db/queries";
import type { SearchFilters, SortBy } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SortButton } from "@/components/sort-button";

export const metadata: Metadata = {
  title: "Charter Cruises",
  description: "Browse full-ship charter sailings across all cruise lines.",
};

interface Props {
  searchParams: Promise<Record<string, string>>;
}

const VALID_SORTS = new Set(["date-asc","date-desc","price-asc","price-desc","nights-asc","nights-desc"]);
const LIMIT = 48;

export default async function ChartersPage({ searchParams }: Props) {
  const sp = await searchParams;

  const filters: SearchFilters = { charter: true };
  if (sp.month) filters.month = sp.month;
  if (sp.destination) filters.destination = decodeURIComponent(sp.destination);
  if (sp.departurePort) filters.departurePort = sp.departurePort;
  if (sp.ship) filters.ship = sp.ship;
  if (sp.durationBucket) filters.durationBucket = sp.durationBucket as SearchFilters["durationBucket"];
  if (sp.lines) filters.lineIds = sp.lines.split(",").filter(Boolean);
  if (sp.sortBy && VALID_SORTS.has(sp.sortBy)) filters.sortBy = sp.sortBy as SortBy;

  const offset = parseInt(sp.offset ?? "0", 10);
  const results = searchSailings(filters, LIMIT, offset);

  const destinations = getDestinations().map((d) => ({ value: d, label: d }));
  const ports = getAllPorts().map((p) => ({ value: p.id, label: p.name }));
  const ships = getAllShips().map(({ ship }) => ({ value: ship.id, label: ship.name }));
  const lines = getAllCruiseLines().map((l) => ({ value: l.id, label: l.name }));

  const countLabel = results.length === LIMIT
    ? `${LIMIT}+ sailings`
    : results.length === 0 ? "No charter sailings found"
    : `${results.length} sailing${results.length !== 1 ? "s" : ""}`;

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>Charter Cruises</h1>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 32 }}>
        Full-ship charter sailings across all cruise lines.
      </p>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        <Suspense>
          <FilterSidebar
            destinations={destinations}
            ports={ports}
            ships={ships}
            lines={lines}
            hide={["charter"]}
          />
        </Suspense>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>{countLabel}</p>
            <Suspense>
              <SortButton />
            </Suspense>
          </div>
          {results.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 15, paddingTop: 24 }}>
              No charter sailings match these filters. Try removing some filters.
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
    </div>
  );
}
