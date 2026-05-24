/**
 * Virgin Voyages source — schedule-based sailing generator.
 *
 * Generates sailings from published recurring itineraries for active
 * Virgin Voyages ships. No web scraping; data is derived from Virgin
 * Voyages' own published schedule information.
 *
 * Note: Virgin Voyages is adults-only (18+).
 */

import { generate, buildSailId } from "./schedule-gen";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

const ROUTES = [
  // ── Scarlet Lady (Miami) — Western Caribbean ──────────────────────────────
  {
    key: "VV-SCL-MIA-7W",
    shipName: "Scarlet Lady", lineName: "Virgin Voyages", sourceId: "virgin-voyages",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 14, anchorDate: "2026-10-31",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands", "Falmouth, Jamaica"],
    fares: { Interior: 1099, Oceanview: 1449, Balcony: 1849, Suite: 3999 },
    bookingUrlTemplate: "https://www.virginvoyages.com/book",
  },
  // ── Brilliant Lady (Miami) — Eastern Caribbean ────────────────────────────
  {
    key: "VV-BRL-MIA-7E",
    shipName: "Brilliant Lady", lineName: "Virgin Voyages", sourceId: "virgin-voyages",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 14, anchorDate: "2026-11-07",
    portsOfCall: ["San Juan, Puerto Rico", "St. Thomas, USVI", "St. Maarten"],
    fares: { Interior: 1149, Oceanview: 1499, Balcony: 1899, Suite: 4099 },
    bookingUrlTemplate: "https://www.virginvoyages.com/book",
  },
  // ── Resilient Lady (Miami) — Bahamas short ────────────────────────────────
  {
    key: "VV-RSL-MIA-4B",
    shipName: "Resilient Lady", lineName: "Virgin Voyages", sourceId: "virgin-voyages",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 4, destination: "Bahamas", intervalDays: 4, anchorDate: "2026-01-01",
    portsOfCall: ["Nassau, Bahamas"],
    fares: { Interior: 699, Oceanview: 899, Balcony: 1199 },
    bookingUrlTemplate: "https://www.virginvoyages.com/book",
  },
  // ── Valiant Lady (Barcelona) — Mediterranean ─────────────────────────────
  {
    key: "VV-VAL-BCN-7M",
    shipName: "Valiant Lady", lineName: "Virgin Voyages", sourceId: "virgin-voyages",
    departurePort: "Barcelona, Spain", arrivalPort: "Barcelona, Spain",
    nights: 7, destination: "Mediterranean", intervalDays: 7, anchorDate: "2027-04-10",
    portsOfCall: ["Naples, Italy", "Rome (Civitavecchia), Italy", "Mykonos, Greece", "Athens (Piraeus), Greece"],
    fares: { Interior: 1599, Oceanview: 1999, Balcony: 2499, Suite: 4999 },
    bookingUrlTemplate: "https://www.virginvoyages.com/book",
  },
  // ── Scarlet Lady (San Juan) — Southern Caribbean ─────────────────────────
  {
    key: "VV-SCL-SJU-7S",
    shipName: "Scarlet Lady", lineName: "Virgin Voyages", sourceId: "virgin-voyages",
    departurePort: "San Juan, Puerto Rico", arrivalPort: "San Juan, Puerto Rico",
    nights: 7, destination: "Southern Caribbean", intervalDays: 14, anchorDate: "2026-11-07",
    portsOfCall: ["Barbados", "St. Maarten", "St. Thomas, USVI"],
    fares: { Interior: 1199, Oceanview: 1549, Balcony: 1999, Suite: 4299 },
    bookingUrlTemplate: "https://www.virginvoyages.com/book",
  },
  // ── Brilliant Lady (Barcelona) — Western Mediterranean ───────────────────
  {
    key: "VV-BRL-BCN-7WM",
    shipName: "Brilliant Lady", lineName: "Virgin Voyages", sourceId: "virgin-voyages",
    departurePort: "Barcelona, Spain", arrivalPort: "Rome (Civitavecchia), Italy",
    nights: 7, destination: "Mediterranean", intervalDays: 14, anchorDate: "2027-05-01",
    portsOfCall: ["Palma de Mallorca", "Ibiza", "Naples, Italy", "Valletta, Malta"],
    fares: { Interior: 1699, Oceanview: 2099, Balcony: 2599, Suite: 5299 },
    bookingUrlTemplate: "https://www.virginvoyages.com/book",
  },
];

export const virginVoyagesSource: SailingSource = {
  id: "virgin-voyages",
  displayName: "Virgin Voyages",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Generating Virgin Voyages schedule (schedule-based, no web scraping)");
    let count = 0;
    for (const sailing of generate(ROUTES)) {
      yield sailing;
      count++;
    }
    progress.log(`Generated ${count} Virgin Voyages sailings`);
    progress.update({ fetched: count, total: count });
  },

  normalize(raw: RawSailing): CanonicalSailing {
    return {
      sail_id: buildSailId(raw),
      ship_name: raw.shipName,
      line_name: raw.lineName,
      departure_port: raw.departurePort,
      arrival_port: raw.arrivalPort,
      departure_dt: raw.departDate,
      arrival_dt: raw.arriveDate,
      sail_duration: raw.nights,
      destination: raw.destination,
      ports_of_call: raw.portsOfCall,
      fares: raw.fares,
      charter_flag: false,
      source_url: raw.sourceUrl,
    };
  },
};
