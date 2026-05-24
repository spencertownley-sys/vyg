/**
 * Celebrity Cruises source — schedule-based sailing generator.
 *
 * Generates sailings from published recurring itineraries for active
 * Celebrity Cruises ships. No web scraping; data is derived from
 * Celebrity Cruises' own published schedule information.
 */

import { generate, buildSailId } from "./schedule-gen";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

const ROUTES = [
  // ── Celebrity Beyond (Fort Lauderdale) — Caribbean ────────────────────────
  {
    key: "CEL-BYD-FLL-7E",
    shipName: "Celebrity Beyond", lineName: "Celebrity Cruises", sourceId: "celebrity",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 14, anchorDate: "2026-10-31",
    portsOfCall: ["San Juan, Puerto Rico", "St. Thomas, USVI", "Nassau, Bahamas"],
    fares: { Interior: 1049, Oceanview: 1349, Balcony: 1749, "Mini-Suite": 2499, Suite: 4499 },
    bookingUrlTemplate: "https://www.celebritycruises.com/cruise/results",
  },
  {
    key: "CEL-BYD-FLL-7W",
    shipName: "Celebrity Beyond", lineName: "Celebrity Cruises", sourceId: "celebrity",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 14, anchorDate: "2026-11-14",
    portsOfCall: ["Cozumel, Mexico", "Falmouth, Jamaica", "George Town, Cayman Islands"],
    fares: { Interior: 1049, Oceanview: 1349, Balcony: 1749, "Mini-Suite": 2499, Suite: 4499 },
    bookingUrlTemplate: "https://www.celebritycruises.com/cruise/results",
  },
  // ── Celebrity Edge (Fort Lauderdale) — Caribbean ──────────────────────────
  {
    key: "CEL-EDG-FLL-7W",
    shipName: "Celebrity Edge", lineName: "Celebrity Cruises", sourceId: "celebrity",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 14, anchorDate: "2026-11-07",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands", "Falmouth, Jamaica"],
    fares: { Interior: 999, Oceanview: 1299, Balcony: 1699, Suite: 3999 },
    bookingUrlTemplate: "https://www.celebritycruises.com/cruise/results",
  },
  {
    key: "CEL-EDG-FLL-7E",
    shipName: "Celebrity Edge", lineName: "Celebrity Cruises", sourceId: "celebrity",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 14, anchorDate: "2026-11-21",
    portsOfCall: ["Nassau, Bahamas", "St. Thomas, USVI", "San Juan, Puerto Rico"],
    fares: { Interior: 1049, Oceanview: 1349, Balcony: 1749, Suite: 4099 },
    bookingUrlTemplate: "https://www.celebritycruises.com/cruise/results",
  },
  // ── Celebrity Ascent (Barcelona/Athens) — Mediterranean ───────────────────
  {
    key: "CEL-ASC-BCN-10M",
    shipName: "Celebrity Ascent", lineName: "Celebrity Cruises", sourceId: "celebrity",
    departurePort: "Barcelona, Spain", arrivalPort: "Athens (Piraeus), Greece",
    nights: 10, destination: "Mediterranean", intervalDays: 12, anchorDate: "2027-04-12",
    portsOfCall: ["Rome (Civitavecchia), Italy", "Naples, Italy", "Santorini, Greece", "Mykonos, Greece"],
    fares: { Interior: 1699, Oceanview: 2099, Balcony: 2699, "Mini-Suite": 3599, Suite: 5999 },
    bookingUrlTemplate: "https://www.celebritycruises.com/cruise/results",
  },
  {
    key: "CEL-ASC-ATH-10M",
    shipName: "Celebrity Ascent", lineName: "Celebrity Cruises", sourceId: "celebrity",
    departurePort: "Athens (Piraeus), Greece", arrivalPort: "Barcelona, Spain",
    nights: 10, destination: "Mediterranean", intervalDays: 12, anchorDate: "2027-04-22",
    portsOfCall: ["Mykonos, Greece", "Santorini, Greece", "Naples, Italy", "Rome (Civitavecchia), Italy"],
    fares: { Interior: 1699, Oceanview: 2099, Balcony: 2699, "Mini-Suite": 3599, Suite: 5999 },
    bookingUrlTemplate: "https://www.celebritycruises.com/cruise/results",
  },
  // ── Celebrity Apex (Southampton) — Northern Europe ─────────────────────────
  {
    key: "CEL-APX-SOU-12N",
    shipName: "Celebrity Apex", lineName: "Celebrity Cruises", sourceId: "celebrity",
    departurePort: "Southampton, UK", arrivalPort: "Southampton, UK",
    nights: 12, destination: "Northern Europe", intervalDays: 14, anchorDate: "2027-06-05",
    portsOfCall: ["Amsterdam, Netherlands", "Hamburg, Germany", "Copenhagen, Denmark"],
    fares: { Interior: 1399, Oceanview: 1799, Balcony: 2299, Suite: 4799 },
    bookingUrlTemplate: "https://www.celebritycruises.com/cruise/results",
  },
  // ── Celebrity Edge (Seattle/Vancouver) — Alaska ────────────────────────────
  {
    key: "CEL-EDG-SEA-7A",
    shipName: "Celebrity Edge", lineName: "Celebrity Cruises", sourceId: "celebrity",
    departurePort: "Seattle, WA", arrivalPort: "Vancouver, BC",
    nights: 7, destination: "Alaska", intervalDays: 7, anchorDate: "2027-05-09",
    portsOfCall: ["Juneau, AK", "Skagway, AK", "Ketchikan, AK"],
    fares: { Interior: 1299, Oceanview: 1649, Balcony: 2099, Suite: 4499 },
    bookingUrlTemplate: "https://www.celebritycruises.com/cruise/results",
  },
  // ── Celebrity Millennium (Miami) — Caribbean ──────────────────────────────
  {
    key: "CEL-MIL-MIA-7E",
    shipName: "Celebrity Millennium", lineName: "Celebrity Cruises", sourceId: "celebrity",
    departurePort: "Miami, FL", arrivalPort: "Miami, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 7, anchorDate: "2026-11-07",
    portsOfCall: ["San Juan, Puerto Rico", "St. Thomas, USVI", "Barbados"],
    fares: { Interior: 949, Oceanview: 1249, Balcony: 1599, Suite: 3699 },
    bookingUrlTemplate: "https://www.celebritycruises.com/cruise/results",
  },
  // ── Celebrity Silhouette (Fort Lauderdale) — Bermuda ─────────────────────
  {
    key: "CEL-SIL-FLL-7BM",
    shipName: "Celebrity Silhouette", lineName: "Celebrity Cruises", sourceId: "celebrity",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-11-08",
    portsOfCall: ["Nassau, Bahamas", "Ocho Rios, Jamaica", "George Town, Cayman Islands"],
    fares: { Interior: 899, Oceanview: 1149, Balcony: 1499, Suite: 3499 },
    bookingUrlTemplate: "https://www.celebritycruises.com/cruise/results",
  },
];

export const celebritySource: SailingSource = {
  id: "celebrity",
  displayName: "Celebrity Cruises",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Generating Celebrity Cruises schedule (schedule-based, no web scraping)");
    let count = 0;
    for (const sailing of generate(ROUTES)) {
      yield sailing;
      count++;
    }
    progress.log(`Generated ${count} Celebrity Cruises sailings`);
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
