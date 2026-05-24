/**
 * Norwegian Cruise Line source — schedule-based sailing generator.
 */

import { generate, buildSailId } from "./schedule-gen";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

const ROUTES = [
  // ── Norwegian Prima (Miami) ───────────────────────────────────────────────
  {
    key: "NCL-PRI-MIA-7C",
    shipName: "Norwegian Prima", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Great Stirrup Cay, Bahamas", "Cozumel, Mexico", "George Town, Cayman Islands"],
    fares: { Interior: 999, Oceanview: 1299, Balcony: 1799, "Mini-Suite": 2599, Suite: 5499 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
  // ── Norwegian Encore (Seattle → Alaska) ──────────────────────────────────
  {
    key: "NCL-ENC-SEA-7AK",
    shipName: "Norwegian Encore", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "Seattle, WA", arrivalPort: "Seattle, WA",
    nights: 7, destination: "Alaska", intervalDays: 7, anchorDate: "2026-05-02",
    portsOfCall: ["Juneau, AK", "Skagway, AK", "Ketchikan, AK", "Victoria, BC"],
    fares: { Interior: 1099, Oceanview: 1399, Balcony: 1899, "Mini-Suite": 2799, Suite: 5999 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
  // ── Norwegian Bliss (Los Angeles → Alaska) ────────────────────────────────
  {
    key: "NCL-BLI-LAX-7AK",
    shipName: "Norwegian Bliss", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "Los Angeles, CA", arrivalPort: "Vancouver, BC",
    nights: 7, destination: "Alaska", intervalDays: 14, anchorDate: "2026-05-03",
    portsOfCall: ["Juneau, AK", "Skagway, AK", "Ketchikan, AK"],
    fares: { Interior: 1049, Oceanview: 1349, Balcony: 1849, "Mini-Suite": 2699, Suite: 5699 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
  {
    key: "NCL-BLI-LAX-7MR",
    shipName: "Norwegian Bliss", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "Los Angeles, CA", arrivalPort: "Los Angeles, CA",
    nights: 7, destination: "Mexican Riviera", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Puerto Vallarta, Mexico", "Mazatlan, Mexico", "Cabo San Lucas, Mexico"],
    fares: { Interior: 799, Oceanview: 999, Balcony: 1399, "Mini-Suite": 1999, Suite: 4299 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
  // ── Norwegian Joy (New York → Caribbean/Bermuda) ──────────────────────────
  {
    key: "NCL-JOY-NYC-7B",
    shipName: "Norwegian Joy", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "New York, NY", arrivalPort: "New York, NY",
    nights: 7, destination: "Bermuda", intervalDays: 7, anchorDate: "2026-05-02",
    portsOfCall: ["Bermuda"],
    fares: { Interior: 899, Oceanview: 1149, Balcony: 1549, "Mini-Suite": 2199, Suite: 4699 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
  {
    key: "NCL-JOY-NYC-7C",
    shipName: "Norwegian Joy", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "New York, NY", arrivalPort: "New York, NY",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-11-01",
    portsOfCall: ["Nassau, Bahamas", "Great Stirrup Cay, Bahamas", "Port Canaveral, FL"],
    fares: { Interior: 849, Oceanview: 1099, Balcony: 1499, "Mini-Suite": 2099, Suite: 4499 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
  // ── Norwegian Epic (Barcelona → Mediterranean) ────────────────────────────
  {
    key: "NCL-EPI-BCN-7MED",
    shipName: "Norwegian Epic", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "Barcelona, Spain", arrivalPort: "Barcelona, Spain",
    nights: 7, destination: "Mediterranean", intervalDays: 7, anchorDate: "2026-04-05",
    portsOfCall: ["Rome (Civitavecchia), Italy", "Naples, Italy", "Florence (Livorno), Italy", "Cannes, France", "Marseille, France"],
    fares: { Interior: 1099, Oceanview: 1399, Balcony: 1999, "Mini-Suite": 2799, Suite: 5999 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
  // ── Norwegian Breakaway (New York → Bermuda) ──────────────────────────────
  {
    key: "NCL-BRK-NYC-7B",
    shipName: "Norwegian Breakaway", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "New York, NY", arrivalPort: "New York, NY",
    nights: 7, destination: "Bermuda", intervalDays: 7, anchorDate: "2026-05-09",
    portsOfCall: ["Bermuda"],
    fares: { Interior: 849, Oceanview: 1099, Balcony: 1499, "Mini-Suite": 2099, Suite: 4499 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
  // ── Norwegian Viva (Port Canaveral) ───────────────────────────────────────
  {
    key: "NCL-VIV-PCA-7C",
    shipName: "Norwegian Viva", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-01-03",
    portsOfCall: ["Great Stirrup Cay, Bahamas", "Nassau, Bahamas", "Cozumel, Mexico"],
    fares: { Interior: 949, Oceanview: 1199, Balcony: 1649, "Mini-Suite": 2349, Suite: 4999 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
  // ── Norwegian Gem (Boston/New York → Caribbean) ───────────────────────────
  {
    key: "NCL-GEM-NYC-10C",
    shipName: "Norwegian Gem", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "New York, NY", arrivalPort: "New York, NY",
    nights: 10, destination: "Southern Caribbean", intervalDays: 10, anchorDate: "2026-01-05",
    portsOfCall: ["San Juan, Puerto Rico", "St. Thomas, USVI", "Tortola, BVI", "St. Maarten", "Barbados"],
    fares: { Interior: 1099, Oceanview: 1399, Balcony: 1949, "Mini-Suite": 2749, Suite: 5899 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
  // ── Norwegian Jade (Mediterranean/Baltic) ────────────────────────────────
  {
    key: "NCL-JAD-COP-7BAL",
    shipName: "Norwegian Jade", lineName: "Norwegian Cruise Line", sourceId: "norwegian",
    departurePort: "Copenhagen, Denmark", arrivalPort: "Copenhagen, Denmark",
    nights: 7, destination: "Baltic", intervalDays: 7, anchorDate: "2026-05-09",
    portsOfCall: ["Stockholm, Sweden", "Helsinki, Finland", "Tallinn, Estonia", "St. Petersburg, Russia"],
    fares: { Interior: 1199, Oceanview: 1499, Balcony: 2099, "Mini-Suite": 2999, Suite: 6299 },
    bookingUrlTemplate: "https://www.ncl.com/cruises",
  },
];

export const norwegianSource: SailingSource = {
  id: "norwegian",
  displayName: "Norwegian Cruise Line",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Generating Norwegian Cruise Line schedule (schedule-based, no web scraping)");
    let count = 0;
    for (const sailing of generate(ROUTES)) {
      yield sailing;
      count++;
    }
    progress.log(`Generated ${count} Norwegian sailings`);
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
