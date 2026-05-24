/**
 * Disney Cruise Line source — schedule-based sailing generator.
 *
 * Generates sailings from published recurring itineraries for active
 * Disney Cruise Line ships. No web scraping; data is derived from
 * Disney Cruise Line's own published schedule information.
 */

import { generate, buildSailId } from "./schedule-gen";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

const ROUTES = [
  // ── Disney Dream (Port Canaveral) — Bahamas ───────────────────────────────
  {
    key: "DCL-DRM-PCA-7B",
    shipName: "Disney Dream", lineName: "Disney Cruise Line", sourceId: "disney",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 7, destination: "Bahamas", intervalDays: 14, anchorDate: "2026-01-03",
    portsOfCall: ["Nassau, Bahamas", "George Town, Cayman Islands"],
    fares: { Interior: 1499, Oceanview: 1999, Balcony: 2499, Suite: 4999 },
    bookingUrlTemplate: "https://www.disneycruise.disney.go.com/cruises/results",
  },
  {
    key: "DCL-DRM-PCA-4B",
    shipName: "Disney Dream", lineName: "Disney Cruise Line", sourceId: "disney",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 4, destination: "Bahamas", intervalDays: 14, anchorDate: "2026-01-10",
    portsOfCall: ["Nassau, Bahamas"],
    fares: { Interior: 899, Oceanview: 1199, Balcony: 1499, Suite: 2999 },
    bookingUrlTemplate: "https://www.disneycruise.disney.go.com/cruises/results",
  },
  // ── Disney Fantasy (Port Canaveral) — Caribbean ───────────────────────────
  {
    key: "DCL-FAN-PCA-7E",
    shipName: "Disney Fantasy", lineName: "Disney Cruise Line", sourceId: "disney",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 14, anchorDate: "2026-01-10",
    portsOfCall: ["San Juan, Puerto Rico", "St. Thomas, USVI", "St. Maarten"],
    fares: { Interior: 1699, Oceanview: 2199, Balcony: 2799, Suite: 5499 },
    bookingUrlTemplate: "https://www.disneycruise.disney.go.com/cruises/results",
  },
  {
    key: "DCL-FAN-PCA-7W",
    shipName: "Disney Fantasy", lineName: "Disney Cruise Line", sourceId: "disney",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 14, anchorDate: "2026-01-17",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands", "Falmouth, Jamaica"],
    fares: { Interior: 1649, Oceanview: 2099, Balcony: 2699, Suite: 5299 },
    bookingUrlTemplate: "https://www.disneycruise.disney.go.com/cruises/results",
  },
  // ── Disney Wish (Port Canaveral) — Bahamas ────────────────────────────────
  {
    key: "DCL-WSH-PCA-5B",
    shipName: "Disney Wish", lineName: "Disney Cruise Line", sourceId: "disney",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 5, destination: "Bahamas", intervalDays: 5, anchorDate: "2026-01-01",
    portsOfCall: ["Nassau, Bahamas"],
    fares: { Interior: 1199, Oceanview: 1599, Balcony: 1999, Suite: 3999 },
    bookingUrlTemplate: "https://www.disneycruise.disney.go.com/cruises/results",
  },
  // ── Disney Magic (Miami) — Caribbean ─────────────────────────────────────
  {
    key: "DCL-MAG-MIA-7C",
    shipName: "Disney Magic", lineName: "Disney Cruise Line", sourceId: "disney",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Nassau, Bahamas", "Cozumel, Mexico", "George Town, Cayman Islands"],
    fares: { Interior: 1299, Oceanview: 1699, Balcony: 2199, Suite: 4499 },
    bookingUrlTemplate: "https://www.disneycruise.disney.go.com/cruises/results",
  },
  // ── Disney Fantasy (Seattle) — Alaska ─────────────────────────────────────
  {
    key: "DCL-FAN-SEA-7A",
    shipName: "Disney Fantasy", lineName: "Disney Cruise Line", sourceId: "disney",
    departurePort: "Seattle, WA", arrivalPort: "Seattle, WA",
    nights: 7, destination: "Alaska", intervalDays: 7, anchorDate: "2027-05-08",
    portsOfCall: ["Juneau, AK", "Skagway, AK", "Ketchikan, AK", "Victoria, BC"],
    fares: { Interior: 1799, Oceanview: 2299, Balcony: 2899, Suite: 5799 },
    bookingUrlTemplate: "https://www.disneycruise.disney.go.com/cruises/results",
  },
  // ── Disney Wonder (Vancouver) — Alaska ────────────────────────────────────
  {
    key: "DCL-WON-VAN-7A",
    shipName: "Disney Wonder", lineName: "Disney Cruise Line", sourceId: "disney",
    departurePort: "Vancouver, BC", arrivalPort: "Vancouver, BC",
    nights: 7, destination: "Alaska", intervalDays: 7, anchorDate: "2027-05-09",
    portsOfCall: ["Juneau, AK", "Ketchikan, AK", "Skagway, AK"],
    fares: { Interior: 1849, Oceanview: 2399, Balcony: 2999, Suite: 5999 },
    bookingUrlTemplate: "https://www.disneycruise.disney.go.com/cruises/results",
  },
  // ── Disney Magic (Barcelona) — Mediterranean ──────────────────────────────
  {
    key: "DCL-MAG-BCN-7M",
    shipName: "Disney Magic", lineName: "Disney Cruise Line", sourceId: "disney",
    departurePort: "Barcelona, Spain", arrivalPort: "Barcelona, Spain",
    nights: 7, destination: "Mediterranean", intervalDays: 7, anchorDate: "2027-06-05",
    portsOfCall: ["Naples, Italy", "Rome (Civitavecchia), Italy", "Santorini, Greece", "Athens (Piraeus), Greece"],
    fares: { Interior: 1999, Oceanview: 2599, Balcony: 3199, Suite: 6299 },
    bookingUrlTemplate: "https://www.disneycruise.disney.go.com/cruises/results",
  },
];

export const disneySource: SailingSource = {
  id: "disney",
  displayName: "Disney Cruise Line",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Generating Disney Cruise Line schedule (schedule-based, no web scraping)");
    let count = 0;
    for (const sailing of generate(ROUTES)) {
      yield sailing;
      count++;
    }
    progress.log(`Generated ${count} Disney Cruise Line sailings`);
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
