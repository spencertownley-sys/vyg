/**
 * Princess Cruises source — schedule-based sailing generator.
 */

import { generate, buildSailId } from "./schedule-gen";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

const ROUTES = [
  // ── Sun Princess (Fort Lauderdale) ───────────────────────────────────────
  {
    key: "PCL-SUP-FLL-7C",
    shipName: "Sun Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Princess Cays, Bahamas", "St. Thomas, USVI", "St. Maarten"],
    fares: { Interior: 999, Oceanview: 1299, Balcony: 1799, "Mini-Suite": 2599, Suite: 5499 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
  // ── Sky Princess (Southampton → Mediterranean/Northern Europe) ────────────
  {
    key: "PCL-SKP-SOT-7MED",
    shipName: "Sky Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "Southampton, UK", arrivalPort: "Southampton, UK",
    nights: 14, destination: "Mediterranean", intervalDays: 14, anchorDate: "2026-04-12",
    portsOfCall: ["Vigo, Spain", "Lisbon, Portugal", "Gibraltar", "Barcelona, Spain", "Marseille, France", "Rome (Civitavecchia), Italy", "Naples, Italy"],
    fares: { Interior: 1499, Oceanview: 1899, Balcony: 2599, "Mini-Suite": 3699, Suite: 7499 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
  {
    key: "PCL-SKP-SOT-7NE",
    shipName: "Sky Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "Southampton, UK", arrivalPort: "Southampton, UK",
    nights: 7, destination: "Northern Europe", intervalDays: 7, anchorDate: "2026-07-05",
    portsOfCall: ["Copenhagen, Denmark", "Oslo, Norway", "Bergen, Norway", "Stavanger, Norway"],
    fares: { Interior: 1199, Oceanview: 1499, Balcony: 2099, "Mini-Suite": 2999, Suite: 5999 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
  // ── Royal Princess (Los Angeles → Mexican Riviera/Hawaii) ────────────────
  {
    key: "PCL-ROP-LAX-7MR",
    shipName: "Royal Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "Los Angeles, CA", arrivalPort: "Los Angeles, CA",
    nights: 7, destination: "Mexican Riviera", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Puerto Vallarta, Mexico", "Mazatlan, Mexico", "Cabo San Lucas, Mexico"],
    fares: { Interior: 849, Oceanview: 1099, Balcony: 1549, "Mini-Suite": 2199, Suite: 4699 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
  {
    key: "PCL-ROP-LAX-15HI",
    shipName: "Royal Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "Los Angeles, CA", arrivalPort: "Los Angeles, CA",
    nights: 15, destination: "Hawaii", intervalDays: 15, anchorDate: "2026-03-14",
    portsOfCall: ["Ensenada, Mexico", "Hilo, HI", "Honolulu, HI", "Kauai, HI", "Maui, HI"],
    fares: { Interior: 1999, Oceanview: 2499, Balcony: 3499, "Mini-Suite": 4999, Suite: 9999 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
  // ── Emerald Princess (Fort Lauderdale) ────────────────────────────────────
  {
    key: "PCL-EMP-FLL-7E",
    shipName: "Emerald Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 7, anchorDate: "2026-01-03",
    portsOfCall: ["Princess Cays, Bahamas", "St. Thomas, USVI", "St. Maarten"],
    fares: { Interior: 949, Oceanview: 1199, Balcony: 1699, "Mini-Suite": 2399, Suite: 5099 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
  // ── Island Princess (Fort Lauderdale → Southern Caribbean/Panama Canal) ───
  {
    key: "PCL-ILP-FLL-10SC",
    shipName: "Island Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 10, destination: "Southern Caribbean", intervalDays: 10, anchorDate: "2026-01-05",
    portsOfCall: ["Barbados", "St. Lucia", "St. Maarten", "San Juan, Puerto Rico", "Princess Cays, Bahamas"],
    fares: { Interior: 1299, Oceanview: 1649, Balcony: 2299, "Mini-Suite": 3299, Suite: 6999 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
  {
    key: "PCL-ILP-FLL-14PC",
    shipName: "Island Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Los Angeles, CA",
    nights: 14, destination: "Panama Canal", intervalDays: 28, anchorDate: "2026-01-17",
    portsOfCall: ["Cartagena, Colombia", "Colon, Panama", "Panama Canal", "Puerto Caldera, Costa Rica", "Puerto Quetzal, Guatemala", "Cabo San Lucas, Mexico"],
    fares: { Interior: 1899, Oceanview: 2399, Balcony: 3299, "Mini-Suite": 4799, Suite: 9499 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
  // ── Majestic Princess (Alaska/Pacific) ────────────────────────────────────
  {
    key: "PCL-MAP-SEA-7AK",
    shipName: "Majestic Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "Seattle, WA", arrivalPort: "Seattle, WA",
    nights: 7, destination: "Alaska", intervalDays: 7, anchorDate: "2026-05-02",
    portsOfCall: ["Juneau, AK", "Skagway, AK", "Glacier Bay, AK", "Ketchikan, AK", "Victoria, BC"],
    fares: { Interior: 1099, Oceanview: 1399, Balcony: 1949, "Mini-Suite": 2749, Suite: 5799 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
  // ── Discovery Princess (Los Angeles → Alaska) ─────────────────────────────
  {
    key: "PCL-DIP-LAX-7AK",
    shipName: "Discovery Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "Los Angeles, CA", arrivalPort: "Vancouver, BC",
    nights: 7, destination: "Alaska", intervalDays: 14, anchorDate: "2026-05-09",
    portsOfCall: ["Juneau, AK", "Skagway, AK", "Ketchikan, AK"],
    fares: { Interior: 1049, Oceanview: 1349, Balcony: 1899, "Mini-Suite": 2699, Suite: 5699 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
  // ── Grand Princess (San Francisco) ───────────────────────────────────────
  {
    key: "PCL-GRP-SFO-7AK",
    shipName: "Grand Princess", lineName: "Princess Cruises", sourceId: "princess",
    departurePort: "San Francisco, CA", arrivalPort: "San Francisco, CA",
    nights: 7, destination: "California Coast / Mexico", intervalDays: 7, anchorDate: "2026-04-05",
    portsOfCall: ["Santa Barbara, CA", "Ensenada, Mexico", "Catalina Island, CA"],
    fares: { Interior: 749, Oceanview: 949, Balcony: 1349, "Mini-Suite": 1899, Suite: 3999 },
    bookingUrlTemplate: "https://www.princess.com/find-cruises/results",
  },
];

export const princessSource: SailingSource = {
  id: "princess",
  displayName: "Princess Cruises",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Generating Princess Cruises schedule (schedule-based, no web scraping)");
    let count = 0;
    for (const sailing of generate(ROUTES)) {
      yield sailing;
      count++;
    }
    progress.log(`Generated ${count} Princess sailings`);
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
