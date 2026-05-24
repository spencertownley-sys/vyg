import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getShipById, searchSailings,
  getDestinations, getAllPorts, getAllShips, getAllCruiseLines,
} from "@/db/queries";
import type { SearchFilters, SortBy } from "@/db/queries";
import { SailingCard } from "@/components/sailing-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SortButton } from "@/components/sort-button";

interface Props {
  params: Promise<{ ship: string }>;
  searchParams: Promise<Record<string, string>>;
}

const VALID_SORTS = new Set(["date-asc","date-desc","price-asc","price-desc","nights-asc","nights-desc"]);
const LIMIT = 48;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ship: shipId } = await params;
  const ship = getShipById(shipId);
  if (!ship) return {};
  return {
    title: ship.name,
    description: `Browse upcoming sailings on ${ship.name} — ${ship.line.name}.`,
  };
}

export default async function ShipPage({ params, searchParams }: Props) {
  const { ship: shipId } = await params;
  const ship = getShipById(shipId);
  if (!ship) notFound();

  const sp = await searchParams;

  const filters: SearchFilters = { ship: shipId };
  if (sp.month) filters.month = sp.month;
  if (sp.destination) filters.destination = decodeURIComponent(sp.destination);
  if (sp.departurePort) filters.departurePort = sp.departurePort;
  if (sp.durationBucket) filters.durationBucket = sp.durationBucket as SearchFilters["durationBucket"];
  if (sp.charter === "true") filters.charter = true;
  if (sp.sortBy && VALID_SORTS.has(sp.sortBy)) filters.sortBy = sp.sortBy as SortBy;

  const offset = parseInt(sp.offset ?? "0", 10);
  const results = searchSailings(filters, LIMIT, offset);

  const destinations = getDestinations().map((d) => ({ value: d, label: d }));
  const ports = getAllPorts().map((p) => ({ value: p.id, label: p.name }));
  const ships = getAllShips().map(({ ship: s }) => ({ value: s.id, label: s.name }));
  const lines = getAllCruiseLines().map((l) => ({ value: l.id, label: l.name }));

  const countLabel = results.length === LIMIT
    ? `${LIMIT}+ sailings`
    : results.length === 0 ? "No sailings found"
    : `${results.length} sailing${results.length !== 1 ? "s" : ""}`;

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <div style={{ marginBottom: 6 }}>
        <Link href={`/lines/${ship.lineId}`} style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none" }}>
          {ship.line.name}
        </Link>
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 20 }}>{ship.name}</h1>

      <div style={{ display: "flex", gap: 32, marginBottom: 36, flexWrap: "wrap" }}>
        {ship.shipClass && (
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Class</div>
            <div style={{ fontSize: 14 }}>{ship.shipClass}</div>
          </div>
        )}
        {ship.yearBuilt && (
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Built</div>
            <div style={{ fontSize: 14 }}>{ship.yearBuilt}</div>
          </div>
        )}
        {ship.capacity && (
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Capacity</div>
            <div style={{ fontSize: 14 }}>{ship.capacity.toLocaleString()} guests</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        <Suspense>
          <FilterSidebar
            destinations={destinations}
            ports={ports}
            ships={ships}
            lines={lines}
            hide={["ship"]}
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
              {results.map(({ sailing, ship: s, line, departurePort }) => (
                <SailingCard
                  key={sailing.id}
                  id={sailing.id}
                  lineId={line.id}
                  shipName={s.name}
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
