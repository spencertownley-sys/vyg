/**
 * MSC Cruises source — schedule-based sailing generator.
 */

import { generate, buildSailId } from "./schedule-gen";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

const ROUTES = [
  // ── MSC World Europa (Miami) ──────────────────────────────────────────────
  {
    key: "MSC-WEU-MIA-7C",
    shipName: "MSC World Europa", lineName: "MSC Cruises", sourceId: "msc",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Ocean Cay, Bahamas", "Cozumel, Mexico", "George Town, Cayman Islands"],
    fares: { Interior: 799, Oceanview: 999, Balcony: 1399, Suite: 3299 },
    bookingUrlTemplate: "https://www.msccruisesusa.com/en-us/cruise-search.aspx",
  },
  // ── MSC Seascape (Miami) ──────────────────────────────────────────────────
  {
    key: "MSC-SSP-MIA-7C",
    shipName: "MSC Seascape", lineName: "MSC Cruises", sourceId: "msc",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-01-03",
    portsOfCall: ["Ocean Cay, Bahamas", "Nassau, Bahamas", "Ocho Rios, Jamaica"],
    fares: { Interior: 749, Oceanview: 949, Balcony: 1349, Suite: 3099 },
    bookingUrlTemplate: "https://www.msccruisesusa.com/en-us/cruise-search.aspx",
  },
  // ── MSC Meraviglia (Miami) ────────────────────────────────────────────────
  {
    key: "MSC-MER-MIA-7E",
    shipName: "MSC Meraviglia", lineName: "MSC Cruises", sourceId: "msc",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 7, anchorDate: "2026-01-05",
    portsOfCall: ["San Juan, Puerto Rico", "St. Maarten", "Nassau, Bahamas"],
    fares: { Interior: 779, Oceanview: 979, Balcony: 1379, Suite: 3199 },
    bookingUrlTemplate: "https://www.msccruisesusa.com/en-us/cruise-search.aspx",
  },
  // ── MSC Seaside (Miami) ───────────────────────────────────────────────────
  {
    key: "MSC-SSI-MIA-7C",
    shipName: "MSC Seaside", lineName: "MSC Cruises", sourceId: "msc",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands", "Falmouth, Jamaica"],
    fares: { Interior: 729, Oceanview: 929, Balcony: 1299, Suite: 2999 },
    bookingUrlTemplate: "https://www.msccruisesusa.com/en-us/cruise-search.aspx",
  },
  // ── MSC Magnifica (Port Canaveral) ────────────────────────────────────────
  {
    key: "MSC-MAG-PCA-7C",
    shipName: "MSC Magnifica", lineName: "MSC Cruises", sourceId: "msc",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-01-03",
    portsOfCall: ["Nassau, Bahamas", "Cozumel, Mexico", "Ocean Cay, Bahamas"],
    fares: { Interior: 699, Oceanview: 899, Balcony: 1249, Suite: 2899 },
    bookingUrlTemplate: "https://www.msccruisesusa.com/en-us/cruise-search.aspx",
  },
  // ── MSC Bellissima (Mediterranean) ───────────────────────────────────────
  {
    key: "MSC-BEL-BCN-7MED",
    shipName: "MSC Bellissima", lineName: "MSC Cruises", sourceId: "msc",
    departurePort: "Barcelona, Spain", arrivalPort: "Barcelona, Spain",
    nights: 7, destination: "Mediterranean", intervalDays: 7, anchorDate: "2026-04-05",
    portsOfCall: ["Marseille, France", "Genoa, Italy", "Naples, Italy", "Valletta, Malta", "Palermo, Italy"],
    fares: { Interior: 799, Oceanview: 1049, Balcony: 1499, Suite: 3499 },
    bookingUrlTemplate: "https://www.msccruisesusa.com/en-us/cruise-search.aspx",
  },
  // ── MSC Grandiosa (Mediterranean) ────────────────────────────────────────
  {
    key: "MSC-GRA-GEN-7MED",
    shipName: "MSC Grandiosa", lineName: "MSC Cruises", sourceId: "msc",
    departurePort: "Genoa, Italy", arrivalPort: "Genoa, Italy",
    nights: 7, destination: "Mediterranean", intervalDays: 7, anchorDate: "2026-04-04",
    portsOfCall: ["Barcelona, Spain", "Palma, Mallorca", "Naples, Italy", "Messina, Italy", "Valletta, Malta"],
    fares: { Interior: 849, Oceanview: 1099, Balcony: 1549, Suite: 3599 },
    bookingUrlTemplate: "https://www.msccruisesusa.com/en-us/cruise-search.aspx",
  },
  // ── MSC Virtuosa (Northern Europe) ───────────────────────────────────────
  {
    key: "MSC-VIR-SOT-7NE",
    shipName: "MSC Virtuosa", lineName: "MSC Cruises", sourceId: "msc",
    departurePort: "Southampton, UK", arrivalPort: "Southampton, UK",
    nights: 7, destination: "Northern Europe", intervalDays: 7, anchorDate: "2026-05-09",
    portsOfCall: ["Hamburg, Germany", "Copenhagen, Denmark", "Bruges (Zeebrugge), Belgium"],
    fares: { Interior: 899, Oceanview: 1149, Balcony: 1599, Suite: 3699 },
    bookingUrlTemplate: "https://www.msccruisesusa.com/en-us/cruise-search.aspx",
  },
  // ── MSC Divina (New York) ─────────────────────────────────────────────────
  {
    key: "MSC-DIV-NYC-7C",
    shipName: "MSC Divina", lineName: "MSC Cruises", sourceId: "msc",
    departurePort: "New York, NY", arrivalPort: "New York, NY",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-04-04",
    portsOfCall: ["Nassau, Bahamas", "Ocean Cay, Bahamas", "San Juan, Puerto Rico"],
    fares: { Interior: 699, Oceanview: 899, Balcony: 1249, Suite: 2899 },
    bookingUrlTemplate: "https://www.msccruisesusa.com/en-us/cruise-search.aspx",
  },
];

export const mscSource: SailingSource = {
  id: "msc",
  displayName: "MSC Cruises",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Generating MSC Cruises schedule (schedule-based, no web scraping)");
    let count = 0;
    for (const sailing of generate(ROUTES)) {
      yield sailing;
      count++;
    }
    progress.log(`Generated ${count} MSC sailings`);
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
