import { db, sqlite } from "./client";
import { sailings, ships, ports, cruiseLines, ingestionRuns, itineraryStops } from "./schema";
import { eq, asc, desc, and, gte, lte, like, sql, inArray } from "drizzle-orm";

export type SailingRow = typeof sailings.$inferSelect;
export type ShipRow = typeof ships.$inferSelect;
export type PortRow = typeof ports.$inferSelect;
export type CruiseLineRow = typeof cruiseLines.$inferSelect;
export type IngestionRunRow = typeof ingestionRuns.$inferSelect;

export interface SailingWithRelations extends SailingRow {
  ship: ShipRow & { line: CruiseLineRow };
  departurePort: PortRow;
  arrivalPort: PortRow;
  stops: Array<typeof itineraryStops.$inferSelect & { port: PortRow | null }>;
}

export type SortBy = "date-asc" | "date-desc" | "price-asc" | "price-desc" | "nights-asc" | "nights-desc";

export interface SearchFilters {
  month?: string;
  destination?: string;
  departurePort?: string;
  arrivalPort?: string;
  openJaw?: boolean;
  portOfCall?: string;
  ship?: string;
  durationBucket?: "short" | "medium" | "long" | "extended";
  charter?: boolean;
  lineId?: string;   // kept for single-line pages (lines/[line])
  lineIds?: string[]; // multi-select from search page
  sortBy?: SortBy;
}

function durationRange(bucket: string): [number, number] {
  switch (bucket) {
    case "short": return [1, 5];
    case "medium": return [6, 9];
    case "long": return [10, 14];
    case "extended": return [15, 999];
    default: return [1, 999];
  }
}

export function searchSailings(filters: SearchFilters, limit = 50, offset = 0) {
  let query = db
    .select({
      sailing: sailings,
      ship: ships,
      line: cruiseLines,
      departurePort: ports,
    })
    .from(sailings)
    .innerJoin(ships, eq(sailings.shipId, ships.id))
    .innerJoin(cruiseLines, eq(ships.lineId, cruiseLines.id))
    .innerJoin(ports, eq(sailings.departurePortId, ports.id))
    .$dynamic();

  const conditions = [];

  if (filters.month) {
    conditions.push(like(sailings.departDate, `${filters.month}%`));
  }
  if (filters.destination) {
    conditions.push(eq(sailings.destination, filters.destination));
  }
  if (filters.departurePort) {
    conditions.push(eq(sailings.departurePortId, filters.departurePort));
  }
  if (filters.arrivalPort) {
    conditions.push(eq(sailings.arrivalPortId, filters.arrivalPort));
  }
  if (filters.openJaw === false) {
    conditions.push(sql`${sailings.departurePortId} = ${sailings.arrivalPortId}`);
  } else if (filters.openJaw === true) {
    conditions.push(sql`${sailings.departurePortId} != ${sailings.arrivalPortId}`);
  }
  if (filters.ship) {
    conditions.push(eq(sailings.shipId, filters.ship));
  }
  if (filters.durationBucket) {
    const [min, max] = durationRange(filters.durationBucket);
    conditions.push(gte(sailings.nights, min));
    conditions.push(lte(sailings.nights, max));
  }
  if (filters.charter !== undefined) {
    conditions.push(eq(sailings.charterFlag, filters.charter));
  }
  if (filters.lineIds && filters.lineIds.length > 0) {
    conditions.push(inArray(cruiseLines.id, filters.lineIds));
  } else if (filters.lineId) {
    conditions.push(eq(cruiseLines.id, filters.lineId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  const priceExpr = sql`CAST(json_extract(${sailings.sampleFares}, '$.Interior') AS REAL)`;
  switch (filters.sortBy ?? "date-asc") {
    case "date-desc":  return query.orderBy(desc(sailings.departDate)).limit(limit).offset(offset).all();
    case "price-asc":  return query.orderBy(asc(priceExpr)).limit(limit).offset(offset).all();
    case "price-desc": return query.orderBy(desc(priceExpr)).limit(limit).offset(offset).all();
    case "nights-asc": return query.orderBy(asc(sailings.nights)).limit(limit).offset(offset).all();
    case "nights-desc":return query.orderBy(desc(sailings.nights)).limit(limit).offset(offset).all();
    default:           return query.orderBy(asc(sailings.departDate)).limit(limit).offset(offset).all();
  }
}

export function getSailingById(id: string): SailingWithRelations | null {
  const row = db
    .select({
      sailing: sailings,
      ship: ships,
      line: cruiseLines,
      departurePort: ports,
    })
    .from(sailings)
    .innerJoin(ships, eq(sailings.shipId, ships.id))
    .innerJoin(cruiseLines, eq(ships.lineId, cruiseLines.id))
    .innerJoin(ports, eq(sailings.departurePortId, ports.id))
    .where(eq(sailings.id, id))
    .get();

  if (!row) return null;

  const arrivalPort = db.select().from(ports).where(eq(ports.id, row.sailing.arrivalPortId)).get();
  if (!arrivalPort) return null;

  const rawStops = db
    .select()
    .from(itineraryStops)
    .where(eq(itineraryStops.sailingId, id))
    .orderBy(itineraryStops.dayNumber)
    .all();

  const portIds = rawStops.map((s) => s.portId).filter((p): p is string => p !== null);
  const stopPorts = portIds.length > 0
    ? db.select().from(ports).where(inArray(ports.id, portIds)).all()
    : [];
  const portMap = new Map(stopPorts.map((p) => [p.id, p]));

  const stops = rawStops.map((s) => ({
    ...s,
    port: s.portId ? (portMap.get(s.portId) ?? null) : null,
  }));

  return {
    ...row.sailing,
    ship: { ...row.ship, line: row.line },
    departurePort: row.departurePort,
    arrivalPort,
    stops,
  };
}

export function getAllCruiseLines() {
  return db.select().from(cruiseLines).orderBy(cruiseLines.name).all();
}

export function getCruiseLineById(id: string) {
  return db.select().from(cruiseLines).where(eq(cruiseLines.id, id)).get() ?? null;
}

export function getShipById(id: string) {
  const row = db
    .select({ ship: ships, line: cruiseLines })
    .from(ships)
    .innerJoin(cruiseLines, eq(ships.lineId, cruiseLines.id))
    .where(eq(ships.id, id))
    .get();
  if (!row) return null;
  return { ...row.ship, line: row.line };
}

export function getShipsByLine(lineId: string) {
  return db.select().from(ships).where(eq(ships.lineId, lineId)).orderBy(ships.name).all();
}

export function getAllShips() {
  return db
    .select({ ship: ships, line: cruiseLines })
    .from(ships)
    .innerJoin(cruiseLines, eq(ships.lineId, cruiseLines.id))
    .orderBy(cruiseLines.name, ships.name)
    .all();
}

export function getPortById(id: string) {
  return db.select().from(ports).where(eq(ports.id, id)).get() ?? null;
}

export function getAllPorts() {
  return db.select().from(ports).orderBy(ports.name).all();
}

export function getSailingsByDeparturePort(portId: string, limit = 50) {
  return db
    .select({ sailing: sailings, ship: ships, line: cruiseLines })
    .from(sailings)
    .innerJoin(ships, eq(sailings.shipId, ships.id))
    .innerJoin(cruiseLines, eq(ships.lineId, cruiseLines.id))
    .where(eq(sailings.departurePortId, portId))
    .orderBy(sailings.departDate)
    .limit(limit)
    .all();
}

export function getSailingsByDestination(destination: string, limit = 50) {
  return db
    .select({ sailing: sailings, ship: ships, line: cruiseLines, departurePort: ports })
    .from(sailings)
    .innerJoin(ships, eq(sailings.shipId, ships.id))
    .innerJoin(cruiseLines, eq(ships.lineId, cruiseLines.id))
    .innerJoin(ports, eq(sailings.departurePortId, ports.id))
    .where(eq(sailings.destination, destination))
    .orderBy(sailings.departDate)
    .limit(limit)
    .all();
}

export function getSailingsByShip(shipId: string, limit = 50) {
  return db
    .select({ sailing: sailings, ship: ships, line: cruiseLines, departurePort: ports })
    .from(sailings)
    .innerJoin(ships, eq(sailings.shipId, ships.id))
    .innerJoin(cruiseLines, eq(ships.lineId, cruiseLines.id))
    .innerJoin(ports, eq(sailings.departurePortId, ports.id))
    .where(eq(sailings.shipId, shipId))
    .orderBy(sailings.departDate)
    .limit(limit)
    .all();
}

export function getCharterSailings() {
  return db
    .select({ sailing: sailings, ship: ships, line: cruiseLines, departurePort: ports })
    .from(sailings)
    .innerJoin(ships, eq(sailings.shipId, ships.id))
    .innerJoin(cruiseLines, eq(ships.lineId, cruiseLines.id))
    .innerJoin(ports, eq(sailings.departurePortId, ports.id))
    .where(eq(sailings.charterFlag, true))
    .orderBy(sailings.departDate)
    .all();
}

export function getDestinations() {
  return db
    .selectDistinct({ destination: sailings.destination })
    .from(sailings)
    .orderBy(sailings.destination)
    .all()
    .map((r) => r.destination);
}

export function getRecentIngestionRuns(limit = 50) {
  return db
    .select({ run: ingestionRuns, line: cruiseLines })
    .from(ingestionRuns)
    .innerJoin(cruiseLines, eq(ingestionRuns.lineId, cruiseLines.id))
    .orderBy(desc(ingestionRuns.startedAt))
    .limit(limit)
    .all();
}

export function getIngestionRunById(id: string) {
  return db.select().from(ingestionRuns).where(eq(ingestionRuns.id, id)).get() ?? null;
}

export function getActiveIngestionRuns() {
  return db
    .select({ run: ingestionRuns, line: cruiseLines })
    .from(ingestionRuns)
    .innerJoin(cruiseLines, eq(ingestionRuns.lineId, cruiseLines.id))
    .where(inArray(ingestionRuns.status, ["pending", "running"]))
    .orderBy(ingestionRuns.startedAt)
    .all();
}

export function getLastSuccessfulRun(lineId: string) {
  return db
    .select()
    .from(ingestionRuns)
    .where(and(eq(ingestionRuns.lineId, lineId), eq(ingestionRuns.status, "completed")))
    .orderBy(desc(ingestionRuns.completedAt))
    .limit(1)
    .get() ?? null;
}

export function getSailingCountByLine(lineId: string): number {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(sailings)
    .innerJoin(ships, eq(sailings.shipId, ships.id))
    .where(eq(ships.lineId, lineId))
    .get();
  return result?.count ?? 0;
}

export function ftsSearch(query: string, limit = 50) {
  return sqlite.prepare(`
    SELECT s.*, fts.ship_name, fts.line_name, fts.departure_port, fts.arrival_port, fts.destination as fts_destination
    FROM sailings_fts fts
    JOIN sailings s ON s.id = fts.sailing_id
    WHERE sailings_fts MATCH ?
    LIMIT ?
  `).all(query, limit) as (SailingRow & {
    ship_name: string;
    line_name: string;
    departure_port: string;
    arrival_port: string;
    fts_destination: string;
  })[];
}
