import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  searchSailings, getDestinations,
  getAllPorts, getAllShips, getAllCruiseLines,
} from "@/db/queries";
import type { SearchFilters, SortBy } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SortButton } from "@/components/sort-button";

interface Props {
  params: Promise<{ destination: string }>;
  searchParams: Promise<Record<string, string>>;
}

const VALID_SORTS = new Set(["date-asc","date-desc","price-asc","price-desc","nights-asc","nights-desc"]);
const LIMIT = 48;

function slugToDestination(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destination } = await params;
  const dest = slugToDestination(destination);
  return {
    title: `Cruises to ${dest}`,
    description: `Browse all cruises sailing to ${dest}.`,
  };
}

export default async function CruisesToDestPage({ params, searchParams }: Props) {
  const { destination: slug } = await params;
  const dest = slugToDestination(slug);

  const sp = await searchParams;

  const filters: SearchFilters = { destination: dest };
  if (sp.month) filters.month = sp.month;
  if (sp.departurePort) filters.departurePort = sp.departurePort;
  if (sp.ship) filters.ship = sp.ship;
  if (sp.durationBucket) filters.durationBucket = sp.durationBucket as SearchFilters["durationBucket"];
  if (sp.charter === "true") filters.charter = true;
  if (sp.lines) filters.lineIds = sp.lines.split(",").filter(Boolean);
  if (sp.sortBy && VALID_SORTS.has(sp.sortBy)) filters.sortBy = sp.sortBy as SortBy;

  const offset = parseInt(sp.offset ?? "0", 10);
  const results = searchSailings(filters, LIMIT, offset);
  if (results.length === 0 && Object.keys(sp).length === 0) notFound();

  const destinations = getDestinations().map((d) => ({ value: d, label: d }));
  const ports = getAllPorts().map((p) => ({ value: p.id, label: p.name }));
  const ships = getAllShips().map(({ ship }) => ({ value: ship.id, label: ship.name }));
  const lines = getAllCruiseLines().map((l) => ({ value: l.id, label: l.name }));

  const countLabel = results.length === LIMIT
    ? `${LIMIT}+ sailings`
    : results.length === 0 ? "No sailings found"
    : `${results.length} sailing${results.length !== 1 ? "s" : ""}`;

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 32 }}>
        Cruises to {dest}
      </h1>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        <Suspense>
          <FilterSidebar
            destinations={destinations}
            ports={ports}
            ships={ships}
            lines={lines}
            hide={["destination"]}
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
    </div>
  );
}
