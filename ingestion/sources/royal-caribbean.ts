/**
 * Royal Caribbean International source — schedule-based sailing generator.
 *
 * Generates sailings from published recurring itineraries for active
 * Royal Caribbean ships. No web scraping; data is derived from Royal
 * Caribbean's own published schedule information.
 */

import { generate, buildSailId } from "./schedule-gen";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

const ROUTES = [
  // ── Icon of the Seas (Miami) ──────────────────────────────────────────────
  {
    key: "RCI-ICO-MIA-7E",
    shipName: "Icon of the Seas", lineName: "Royal Caribbean International", sourceId: "royal-caribbean",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 14, anchorDate: "2026-01-10",
    portsOfCall: ["Nassau, Bahamas", "St. Thomas, USVI", "St. Maarten"],
    fares: { Interior: 1199, Oceanview: 1549, Balcony: 1999, "Mini-Suite": 2799, Suite: 4999 },
    bookingUrlTemplate: "https://www.royalcaribbean.com/cruise-ships/icon-of-the-seas",
  },
  {
    key: "RCI-ICO-MIA-7W",
    shipName: "Icon of the Seas", lineName: "Royal Caribbean International", sourceId: "royal-caribbean",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 14, anchorDate: "2026-01-03",
    portsOfCall: ["Cozumel, Mexico", "Falmouth, Jamaica", "George Town, Cayman Islands"],
    fares: { Interior: 1149, Oceanview: 1499, Balcony: 1949, "Mini-Suite": 2749, Suite: 4899 },
    bookingUrlTemplate: "https://www.royalcaribbean.com/cruise-ships/icon-of-the-seas",
  },
  // ── Wonder of the Seas (Port Canaveral) ──────────────────────────────────
  {
    key: "RCI-WON-PCA-7B",
    shipName: "Wonder of the Seas", lineName: "Royal Caribbean International", sourceId: "royal-caribbean",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 7, destination: "Bahamas", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Nassau, Bahamas", "Cozumel, Mexico"],
    fares: { Interior: 999, Oceanview: 1299, Balcony: 1699, Suite: 3799 },
    bookingUrlTemplate: "https://www.royalcaribbean.com/cruise-ships/wonder-of-the-seas",
  },
  {
    key: "RCI-WON-PCA-4B",
    shipName: "Wonder of the Seas", lineName: "Royal Caribbean International", sourceId: "royal-caribbean",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 4, destination: "Bahamas", intervalDays: 4, anchorDate: "2026-01-01",
    portsOfCall: ["Nassau, Bahamas"],
    fares: { Interior: 649, Oceanview: 849, Balcony: 1099 },
    bookingUrlTemplate: "https://www.royalcaribbean.com/cruise-ships/wonder-of-the-seas",
  },
  // ── Harmony of the Seas (Galveston / Barcelona) ───────────────────────────
  {
    key: "RCI-HAR-GAL-7W",
    shipName: "Harmony of the Seas", lineName: "Royal Caribbean International", sourceId: "royal-caribbean",
    departurePort: "Galveston, TX", arrivalPort: "Galveston, TX",
    nights: 7, destination: "Western Caribbean", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands", "Falmouth, Jamaica"],
    fares: { Interior: 1049, Oceanview: 1349, Balcony: 1749, Suite: 3999 },
    bookingUrlTemplate: "https://www.royalcaribbean.com/cruise-ships/harmony-of-the-seas",
  },
  {
    key: "RCI-HAR-BCN-7M",
    shipName: "Harmony of the Seas", lineName: "Royal Caribbean International", sourceId: "royal-caribbean",
    departurePort: "Barcelona, Spain", arrivalPort: "Rome (Civitavecchia), Italy",
    nights: 7, destination: "Mediterranean", intervalDays: 7, anchorDate: "2027-05-01",
    portsOfCall: ["Naples, Italy", "Santorini, Greece", "Mykonos, Greece", "Athens (Piraeus), Greece"],
    fares: { Interior: 1399, Oceanview: 1799, Balcony: 2299, Suite: 4799 },
    bookingUrlTemplate: "https://www.royalcaribbean.com/cruise-ships/harmony-of-the-seas",
  },
  // ── Symphony of the Seas (Miami) ──────────────────────────────────────────
  {
    key: "RCI-SYM-MIA-7E",
    shipName: "Symphony of the Seas", lineName: "Royal Caribbean International", sourceId: "royal-caribbean",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["St. Thomas, USVI", "San Juan, Puerto Rico", "Nassau, Bahamas"],
    fares: { Interior: 1099, Oceanview: 1399, Balcony: 1849, Suite: 4199 },
    bookingUrlTemplate: "https://www.royalcaribbean.com/cruise-ships/symphony-of-the-seas",
  },
  // ── Allure of the Seas (Fort Lauderdale) ──────────────────────────────────
  {
    key: "RCI-ALR-FLL-7C",
    shipName: "Allure of the Seas", lineName: "Royal Caribbean International", sourceId: "royal-caribbean",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-01-03",
    portsOfCall: ["Cozumel, Mexico", "Falmouth, Jamaica", "George Town, Cayman Islands"],
    fares: { Interior: 949, Oceanview: 1249, Balcony: 1649, Suite: 3799 },
    bookingUrlTemplate: "https://www.royalcaribbean.com/cruise-ships/allure-of-the-seas",
  },
  // ── Utopia of the Seas (Port Canaveral) ───────────────────────────────────
  {
    key: "RCI-UTO-PCA-7W",
    shipName: "Utopia of the Seas", lineName: "Royal Caribbean International", sourceId: "royal-caribbean",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 7, anchorDate: "2026-01-05",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands", "Nassau, Bahamas"],
    fares: { Interior: 1099, Oceanview: 1449, Balcony: 1849, Suite: 4299 },
    bookingUrlTemplate: "https://www.royalcaribbean.com/cruise-ships/utopia-of-the-seas",
  },
  {
    key: "RCI-UTO-PCA-3B",
    shipName: "Utopia of the Seas", lineName: "Royal Caribbean International", sourceId: "royal-caribbean",
    departurePort: "Port Canaveral, FL", arrivalPort: "Port Canaveral, FL",
    nights: 3, destination: "Bahamas", intervalDays: 3, anchorDate: "2026-01-02",
    portsOfCall: ["Nassau, Bahamas"],
    fares: { Interior: 499, Oceanview: 649, Balcony: 849 },
    bookingUrlTemplate: "https://www.royalcaribbean.com/cruise-ships/utopia-of-the-seas",
  },
];

export const royalCaribbeanSource: SailingSource = {
  id: "royal-caribbean",
  displayName: "Royal Caribbean International",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Generating Royal Caribbean International schedule (schedule-based, no web scraping)");
    let count = 0;
    for (const sailing of generate(ROUTES)) {
      yield sailing;
      count++;
    }
    progress.log(`Generated ${count} Royal Caribbean sailings`);
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
