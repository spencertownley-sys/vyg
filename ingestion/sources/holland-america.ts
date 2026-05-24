/**
 * Holland America Line source — schedule-based sailing generator.
 */

import { generate, buildSailId } from "./schedule-gen";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

const ROUTES = [
  // ── Rotterdam (Seattle → Alaska) ─────────────────────────────────────────
  {
    key: "HAL-ROT-SEA-7AK",
    shipName: "Rotterdam", lineName: "Holland America Line", sourceId: "holland-america",
    departurePort: "Seattle, WA", arrivalPort: "Seattle, WA",
    nights: 7, destination: "Alaska", intervalDays: 7, anchorDate: "2026-05-02",
    portsOfCall: ["Juneau, AK", "Skagway, AK", "Glacier Bay, AK", "Ketchikan, AK"],
    fares: { Interior: 1099, Oceanview: 1399, Balcony: 1899, "Mini-Suite": 2699, Suite: 4999 },
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/find-a-cruise/results.html?destinationCode=AK",
  },
  // ── Koningsdam (Vancouver → Alaska) ──────────────────────────────────────
  {
    key: "HAL-KON-VAN-7AK",
    shipName: "Koningsdam", lineName: "Holland America Line", sourceId: "holland-america",
    departurePort: "Vancouver, BC", arrivalPort: "Seattle, WA",
    nights: 7, destination: "Alaska", intervalDays: 7, anchorDate: "2026-05-03",
    portsOfCall: ["Juneau, AK", "Skagway, AK", "Ketchikan, AK", "Victoria, BC"],
    fares: { Interior: 1049, Oceanview: 1349, Balcony: 1849, "Mini-Suite": 2599, Suite: 4799 },
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/find-a-cruise/results.html?destinationCode=AK",
  },
  {
    key: "HAL-KON-SEA-7AK",
    shipName: "Koningsdam", lineName: "Holland America Line", sourceId: "holland-america",
    departurePort: "Seattle, WA", arrivalPort: "Vancouver, BC",
    nights: 7, destination: "Alaska", intervalDays: 14, anchorDate: "2026-05-10",
    portsOfCall: ["Juneau, AK", "Skagway, AK", "Ketchikan, AK"],
    fares: { Interior: 1049, Oceanview: 1349, Balcony: 1849, "Mini-Suite": 2599 },
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/find-a-cruise/results.html?destinationCode=AK",
  },
  // ── Nieuw Statendam (Mediterranean) ──────────────────────────────────────
  {
    key: "HAL-NST-BCN-12MED",
    shipName: "Nieuw Statendam", lineName: "Holland America Line", sourceId: "holland-america",
    departurePort: "Barcelona, Spain", arrivalPort: "Rome (Civitavecchia), Italy",
    nights: 12, destination: "Mediterranean", intervalDays: 12, anchorDate: "2026-04-05",
    portsOfCall: ["Marseille, France", "Monte Carlo, Monaco", "Florence (Livorno), Italy", "Naples, Italy", "Valletta, Malta", "Dubrovnik, Croatia"],
    fares: { Interior: 1599, Oceanview: 1999, Balcony: 2799, Suite: 5999 },
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/find-a-cruise/results.html?destinationCode=ME",
  },
  {
    key: "HAL-NST-PIR-12MED",
    shipName: "Nieuw Statendam", lineName: "Holland America Line", sourceId: "holland-america",
    departurePort: "Athens (Piraeus), Greece", arrivalPort: "Barcelona, Spain",
    nights: 12, destination: "Mediterranean", intervalDays: 12, anchorDate: "2026-04-17",
    portsOfCall: ["Santorini, Greece", "Mykonos, Greece", "Dubrovnik, Croatia", "Naples, Italy"],
    fares: { Interior: 1699, Oceanview: 2099, Balcony: 2999, Suite: 6299 },
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/find-a-cruise/results.html?destinationCode=ME",
  },
  // ── Volendam (Caribbean) ──────────────────────────────────────────────────
  {
    key: "HAL-VOL-FLL-7C",
    shipName: "Volendam", lineName: "Holland America Line", sourceId: "holland-america",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 7, destination: "Caribbean", intervalDays: 7, anchorDate: "2026-01-04",
    portsOfCall: ["Nassau, Bahamas", "St. Thomas, USVI", "St. Maarten"],
    fares: { Interior: 999, Oceanview: 1299, Balcony: 1799, Suite: 4099 },
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/find-a-cruise/results.html?destinationCode=CA",
  },
  // ── Westerdam (Caribbean) ─────────────────────────────────────────────────
  {
    key: "HAL-WES-FLL-7C",
    shipName: "Westerdam", lineName: "Holland America Line", sourceId: "holland-america",
    departurePort: "Fort Lauderdale, FL", arrivalPort: "Fort Lauderdale, FL",
    nights: 7, destination: "Eastern Caribbean", intervalDays: 7, anchorDate: "2026-01-03",
    portsOfCall: ["San Juan, Puerto Rico", "St. Thomas, USVI", "Barbados", "St. Maarten"],
    fares: { Interior: 1049, Oceanview: 1349, Balcony: 1849, Suite: 4299 },
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/find-a-cruise/results.html?destinationCode=CA",
  },
  // ── Zaandam (Caribbean) ───────────────────────────────────────────────────
  {
    key: "HAL-ZAA-TPA-7C",
    shipName: "Zaandam", lineName: "Holland America Line", sourceId: "holland-america",
    departurePort: "Tampa, FL", arrivalPort: "Tampa, FL",
    nights: 7, destination: "Western Caribbean", intervalDays: 7, anchorDate: "2026-01-05",
    portsOfCall: ["Cozumel, Mexico", "George Town, Cayman Islands", "Roatan, Honduras"],
    fares: { Interior: 899, Oceanview: 1149, Balcony: 1599, Suite: 3599 },
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/find-a-cruise/results.html?destinationCode=CA",
  },
  // ── Eurodam (Northern Europe) ─────────────────────────────────────────────
  {
    key: "HAL-EUR-AMS-7NE",
    shipName: "Eurodam", lineName: "Holland America Line", sourceId: "holland-america",
    departurePort: "Amsterdam, Netherlands", arrivalPort: "Amsterdam, Netherlands",
    nights: 7, destination: "Northern Europe", intervalDays: 7, anchorDate: "2026-05-09",
    portsOfCall: ["Copenhagen, Denmark", "Berlin (Warnemunde), Germany", "Tallinn, Estonia", "Stockholm, Sweden"],
    fares: { Interior: 1199, Oceanview: 1499, Balcony: 2099, Suite: 4799 },
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/find-a-cruise/results.html?destinationCode=NE",
  },
  // ── Zuiderdam (Alaska) ────────────────────────────────────────────────────
  {
    key: "HAL-ZUI-SEA-7AK",
    shipName: "Zuiderdam", lineName: "Holland America Line", sourceId: "holland-america",
    departurePort: "Seattle, WA", arrivalPort: "Seattle, WA",
    nights: 7, destination: "Alaska", intervalDays: 7, anchorDate: "2026-05-08",
    portsOfCall: ["Juneau, AK", "Haines, AK", "Ketchikan, AK", "Victoria, BC"],
    fares: { Interior: 1099, Oceanview: 1399, Balcony: 1899, Suite: 4499 },
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/find-a-cruise/results.html?destinationCode=AK",
  },
];

export const hollandAmericaSource: SailingSource = {
  id: "holland-america",
  displayName: "Holland America Line",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Generating Holland America Line schedule (schedule-based, no web scraping)");
    let count = 0;
    for (const sailing of generate(ROUTES)) {
      yield sailing;
      count++;
    }
    progress.log(`Generated ${count} Holland America sailings`);
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
