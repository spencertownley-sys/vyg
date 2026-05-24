import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCruiseLineById, getShipsByLine, searchSailings,
  getDestinations, getAllPorts, getAllShips, getAllCruiseLines,
} from "@/db/queries";
import type { SearchFilters, SortBy } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SortButton } from "@/components/sort-button";

interface Props {
  params: Promise<{ line: string }>;
  searchParams: Promise<Record<string, string>>;
}

const VALID_SORTS = new Set(["date-asc","date-desc","price-asc","price-desc","nights-asc","nights-desc"]);
const LIMIT = 48;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { line: lineId } = await params;
  const line = getCruiseLineById(lineId);
  if (!line) return {};
  return {
    title: line.name,
    description: `Browse all sailings and ships for ${line.name}.`,
  };
}

export default async function LinePage({ params, searchParams }: Props) {
  const { line: lineId } = await params;
  const line = getCruiseLineById(lineId);
  if (!line) notFound();

  const sp = await searchParams;

  const filters: SearchFilters = { lineId };
  if (sp.month) filters.month = sp.month;
  if (sp.destination) filters.destination = decodeURIComponent(sp.destination);
  if (sp.departurePort) filters.departurePort = sp.departurePort;
  if (sp.ship) filters.ship = sp.ship;
  if (sp.durationBucket) filters.durationBucket = sp.durationBucket as SearchFilters["durationBucket"];
  if (sp.charter === "true") filters.charter = true;
  if (sp.sortBy && VALID_SORTS.has(sp.sortBy)) filters.sortBy = sp.sortBy as SortBy;

  const offset = parseInt(sp.offset ?? "0", 10);
  const ships = getShipsByLine(lineId);
  const results = searchSailings(filters, LIMIT, offset);

  const destinations = getDestinations().map((d) => ({ value: d, label: d }));
  const ports = getAllPorts().map((p) => ({ value: p.id, label: p.name }));
  const allShips = getAllShips().map(({ ship }) => ({ value: ship.id, label: ship.name }));
  const lines = getAllCruiseLines().map((l) => ({ value: l.id, label: l.name }));

  const countLabel = results.length === LIMIT
    ? `${LIMIT}+ sailings`
    : results.length === 0 ? "No sailings found"
    : `${results.length} sailing${results.length !== 1 ? "s" : ""}`;

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>{line.name}</h1>
      <a
        href={line.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 14, color: "var(--muted)", display: "block", marginBottom: 32 }}
      >
        {line.websiteUrl} ↗
      </a>

      {ships.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Ships</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ships.map((ship) => (
              <Link
                key={ship.id}
                href={`/ships/${ship.id}`}
                style={{
                  fontSize: 13,
                  padding: "8px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--ink)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {ship.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        <Suspense>
          <FilterSidebar
            destinations={destinations}
            ports={ports}
            ships={allShips}
            lines={lines}
            hide={["lines"]}
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
              {results.map(({ sailing, ship, departurePort }) => (
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
