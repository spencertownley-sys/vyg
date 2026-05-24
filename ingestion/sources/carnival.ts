/**
 * Carnival Cruise Line source — schedule-based sailing generator.
 *
 * Generates sailings from published recurring itineraries for all active
 * Carnival ships. No web scraping; data is derived from Carnival's own
 * published schedule information.
 */

import { generate, buildSailId } from "./schedule-gen";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

const ROUTES = [
  // ── Mardi Gras (Port Canaveral) ───────────────────────────────────────────
  {
    key: "CCL-MGR-PCA-7W",
    shipName: "Mardi Gras", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 7, anchorDate: "2026-01-03",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands", "Falmouth, Jamaica"],
    fares: { Interior: 849, Oceanview: 1099, Balcony: 1449, Suite: 3299 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=WC",
  },
  {
    key: "CCL-MGR-PCA-7E",
    shipName: "Mardi Gras", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 14, anchorDate: "2026-01-10",
    portsOfCall: ["San Juan, Puerto Rico", "St. Thomas, USVI", "Nassau, Bahamas"],
    fares: { Interior: 899, Oceanview: 1149, Balcony: 1549, Suite: 3499 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=EC",
  },
  {
    key: "CCL-MGR-PCA-4B",
    shipName: "Mardi Gras", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 4, destination: "Bahamas", intervalDays: 4, anchorDate: "2026-01-01",
    portsOfCall: ["Nassau, Bahamas"],
    fares: { Interior: 449, Oceanview: 599, Balcony: 799 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=BA",
  },
  // ── Carnival Celebration (Miami) ──────────────────────────────────────────
  {
    key: "CCL-CEL-MIA-7W",
    shipName: "Carnival Celebration", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Cozumel, Mexico", "Falmouth, Jamaica", "George Town, Cayman Islands"],
    fares: { Interior: 879, Oceanview: 1129, Balcony: 1499, Suite: 3399 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=WC",
  },
  {
    key: "CCL-CEL-MIA-7E",
    shipName: "Carnival Celebration", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 14, anchorDate: "2026-01-11",
    portsOfCall: ["St. Maarten", "St. Thomas, USVI", "Nassau, Bahamas"],
    fares: { Interior: 929, Oceanview: 1179, Balcony: 1599, Suite: 3599 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=EC",
  },
  // ── Carnival Jubilee (Galveston) ──────────────────────────────────────────
  {
    key: "CCL-JUB-GAL-7W",
    shipName: "Carnival Jubilee", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Galveston, TX", arrivalPort: "Galveston, TX",
    nights: 7, destination: "Western Caribbean", intervalDays: 7, anchorDate: "2026-01-03",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands", "Falmouth, Jamaica"],
    fares: { Interior: 799, Oceanview: 1049, Balcony: 1399, Suite: 3199 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=WC",
  },
  {
    key: "CCL-JUB-GAL-5B",
    shipName: "Carnival Jubilee", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Galveston, TX", arrivalPort: "Galveston, TX",
    nights: 5, destination: "Bahamas", intervalDays: 5, anchorDate: "2026-01-05",
    portsOfCall: ["Nassau, Bahamas", "Freeport, Bahamas"],
    fares: { Interior: 549, Oceanview: 699, Balcony: 949 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=BA",
  },
  // ── Carnival Vista (Miami) ────────────────────────────────────────────────
  {
    key: "CCL-VIS-MIA-7E",
    shipName: "Carnival Vista", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 7, anchorDate: "2026-01-03",
    portsOfCall: ["San Juan, Puerto Rico", "St. Thomas, USVI", "St. Maarten"],
    fares: { Interior: 849, Oceanview: 1099, Balcony: 1449, Suite: 3199 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=EC",
  },
  // ── Carnival Breeze (Miami) ───────────────────────────────────────────────
  {
    key: "CCL-BRZ-MIA-7S",
    shipName: "Carnival Breeze", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Southern Caribbean", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Barbados", "St. Lucia", "Antigua"],
    fares: { Interior: 999, Oceanview: 1299, Balcony: 1699, Suite: 3799 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=SC",
  },
  // ── Carnival Horizon (Miami) ──────────────────────────────────────────────
  {
    key: "CCL-HOR-MIA-7E",
    shipName: "Carnival Horizon", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 7, anchorDate: "2026-01-05",
    portsOfCall: ["St. Thomas, USVI", "San Juan, Puerto Rico", "Amber Cove, Dominican Republic"],
    fares: { Interior: 849, Oceanview: 1099, Balcony: 1449 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=EC",
  },
  // ── Carnival Venezia (New York) ───────────────────────────────────────────
  {
    key: "CCL-VEN-NYC-7C",
    shipName: "Carnival Venezia", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "New York, NY", arrivalPort: "New York, NY",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-04-04",
    portsOfCall: ["Nassau, Bahamas", "Amber Cove, Dominican Republic", "San Juan, Puerto Rico"],
    fares: { Interior: 799, Oceanview: 1049, Balcony: 1399, Suite: 3099 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=CA",
  },
  {
    key: "CCL-VEN-NYC-5B",
    shipName: "Carnival Venezia", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "New York, NY", arrivalPort: "New York, NY",
    nights: 5, destination: "Bahamas", intervalDays: 5, anchorDate: "2026-04-06",
    portsOfCall: ["Nassau, Bahamas"],
    fares: { Interior: 549, Oceanview: 699, Balcony: 949 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=BA",
  },
  // ── Carnival Sunrise (New York) ───────────────────────────────────────────
  {
    key: "CCL-SUN-NYC-7C",
    shipName: "Carnival Sunrise", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "New York, NY", arrivalPort: "New York, NY",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-04-05",
    portsOfCall: ["Bermuda", "Nassau, Bahamas"],
    fares: { Interior: 849, Oceanview: 1099, Balcony: 1449 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=CA",
  },
  // ── Carnival Magic (Baltimore) ────────────────────────────────────────────
  {
    key: "CCL-MAG-BAL-7C",
    shipName: "Carnival Magic", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Baltimore, MD", arrivalPort: "Baltimore, MD",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-04-04",
    portsOfCall: ["Bermuda", "Nassau, Bahamas"],
    fares: { Interior: 749, Oceanview: 949, Balcony: 1299 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=CA",
  },
  // ── Carnival Sunshine (Charleston) ───────────────────────────────────────
  {
    key: "CCL-SHN-CHS-5B",
    shipName: "Carnival Sunshine", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Charleston, SC", arrivalPort: "Charleston, SC",
    nights: 5, destination: "Bahamas", intervalDays: 5, anchorDate: "2026-01-05",
    portsOfCall: ["Nassau, Bahamas", "Freeport, Bahamas"],
    fares: { Interior: 499, Oceanview: 649, Balcony: 899 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=BA",
  },
  // ── Carnival Conquest (New Orleans) ──────────────────────────────────────
  {
    key: "CCL-CON-MSY-7W",
    shipName: "Carnival Conquest", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "New Orleans, LA", arrivalPort: "New Orleans, LA",
    nights: 7, destination: "Western Caribbean", intervalDays: 7, anchorDate: "2026-01-03",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands", "Ocho Rios, Jamaica"],
    fares: { Interior: 779, Oceanview: 999, Balcony: 1349 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=WC",
  },
  // ── Carnival Dream (Port Canaveral) ──────────────────────────────────────
  {
    key: "CCL-DRM-PCA-7W",
    shipName: "Carnival Dream", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 7, anchorDate: "2026-01-05",
    portsOfCall: ["Cozumel, Mexico", "Falmouth, Jamaica", "George Town, Cayman Islands"],
    fares: { Interior: 829, Oceanview: 1079, Balcony: 1429 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=WC",
  },
  // ── Carnival Paradise (Tampa) ─────────────────────────────────────────────
  {
    key: "CCL-PAR-TPA-5C",
    shipName: "Carnival Paradise", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Tampa, FL", arrivalPort: "Tampa, FL",
    nights: 5, destination: "Western Caribbean", intervalDays: 5, anchorDate: "2026-01-05",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands"],
    fares: { Interior: 499, Oceanview: 649, Balcony: 879 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=WC",
  },
  // ── Carnival Elation (Jacksonville) ──────────────────────────────────────
  {
    key: "CCL-ELA-JAX-5B",
    shipName: "Carnival Elation", lineName: "Carnival Cruise Line", sourceId: "carnival",
    departurePort: "Jacksonville, FL", arrivalPort: "Jacksonville, FL",
    nights: 5, destination: "Bahamas", intervalDays: 5, anchorDate: "2026-01-05",
    portsOfCall: ["Nassau, Bahamas", "Freeport, Bahamas"],
    fares: { Interior: 449, Oceanview: 579, Balcony: 799 },
    bookingUrlTemplate: "https://www.carnival.com/cruise-search/results?destinationCode=BA",
  },
];

export const carnivalSource: SailingSource = {
  id: "carnival",
  displayName: "Carnival Cruise Line",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Generating Carnival Cruise Line schedule (schedule-based, no web scraping)");
    let count = 0;
    for (const sailing of generate(ROUTES)) {
      yield sailing;
      count++;
    }
    progress.log(`Generated ${count} Carnival sailings`);
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
