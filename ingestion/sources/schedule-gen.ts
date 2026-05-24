/**
 * Schedule-based sailing generator.
 *
 * Instead of scraping cruise line websites (which are JavaScript-rendered SPAs
 * and not statically parseable), we generate sailings from published recurring
 * route schedules. Routes are derived from the cruise lines' own published
 * itinerary information.
 *
 * generate() yields RawSailing objects for all departures in the window
 * [today - 30 days … today + 18 months].
 */

import type { RawSailing, CabinClass } from "./types";

export interface RouteDefinition {
  /** Unique route key — used to build sail_id */
  key: string;
  shipName: string;
  lineName: string;
  sourceId: string;
  departurePort: string;
  arrivalPort: string;
  nights: number;
  destination: string;
  portsOfCall: string[];
  /** How many days between consecutive departures (e.g. 7) */
  intervalDays: number;
  /** ISO date string of the first sailing in the series */
  anchorDate: string;
  /** Base fares per cabin class */
  fares: Partial<Record<CabinClass, number>>;
  /** Optional booking URL template ("{id}" replaced with sail_id) */
  bookingUrlTemplate?: string;
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split("T")[0];
}

function slugSuffix(s: string): string {
  return s.replace(/\s+/g, "-").toUpperCase().slice(0, 8);
}

/** Generate all sailings within the window for a list of routes. */
export function* generate(routes: RouteDefinition[]): Generator<RawSailing> {
  const today = new Date();
  const windowStart = new Date(today);
  windowStart.setUTCDate(windowStart.getUTCDate() - 30); // include recently-departed sailings
  const windowEnd = new Date(today);
  windowEnd.setUTCMonth(windowEnd.getUTCMonth() + 18);

  for (const route of routes) {
    // Walk forward from anchorDate until we're past the window start
    let current = route.anchorDate;
    // If anchor is far in the past, fast-forward to near windowStart
    const anchorMs = new Date(route.anchorDate + "T00:00:00Z").getTime();
    if (anchorMs < windowStart.getTime()) {
      const gapMs = windowStart.getTime() - anchorMs;
      const intervals = Math.floor(gapMs / (route.intervalDays * 86400000));
      current = addDays(route.anchorDate, Math.max(0, intervals - 1) * route.intervalDays);
    }

    while (true) {
      const depMs = new Date(current + "T00:00:00Z").getTime();
      if (depMs > windowEnd.getTime()) break;

      if (depMs >= windowStart.getTime()) {
        const arriveDate = addDays(current, route.nights);
        const sailId = `${route.key}-${current.replace(/-/g, "")}`;

        yield {
          sourceId: route.sourceId,
          sourceUrl: route.bookingUrlTemplate
            ? route.bookingUrlTemplate.replace("{id}", sailId)
            : `https://www.${route.sourceId}.com/`,
          shipName: route.shipName,
          lineName: route.lineName,
          departurePort: route.departurePort,
          arrivalPort: route.arrivalPort,
          departDate: current,
          arriveDate: arriveDate,
          nights: route.nights,
          destination: route.destination,
          portsOfCall: route.portsOfCall,
          fares: route.fares,
        };
      }

      current = addDays(current, route.intervalDays);
    }
  }
}

/** Build a CanonicalSailing sail_id from a RawSailing. */
export function buildSailId(raw: RawSailing): string {
  const lineCode = raw.lineName.replace(/\s+/g, "").slice(0, 3).toUpperCase();
  const shipCode = raw.shipName.split(" ").pop()?.slice(0, 5).toUpperCase() ?? "SHIP";
  const depCode = raw.departurePort.split(",")[0].replace(/\s+/g, "").slice(0, 4).toUpperCase();
  return `${lineCode}-${shipCode}-${depCode}-${raw.departDate.replace(/-/g, "")}`;
}
