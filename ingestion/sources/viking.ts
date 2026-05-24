/**
 * Viking Ocean Cruises source — schedule-based sailing generator.
 *
 * Generates sailings from published recurring itineraries for active
 * Viking ocean ships. No web scraping; data is derived from Viking's
 * own published schedule information.
 */

import { generate, buildSailId } from "./schedule-gen";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

const ROUTES = [
  // ── Viking Venus — Mediterranean ──────────────────────────────────────────
  {
    key: "VIK-VEN-BCN-10M",
    shipName: "Viking Venus", lineName: "Viking Ocean Cruises", sourceId: "viking",
    departurePort: "Barcelona, Spain", arrivalPort: "Athens (Piraeus), Greece",
    nights: 10, destination: "Mediterranean", intervalDays: 12, anchorDate: "2027-04-05",
    portsOfCall: ["Rome (Civitavecchia), Italy", "Naples, Italy", "Valletta, Malta", "Dubrovnik, Croatia"],
    fares: { Interior: 2999, Oceanview: 3799, Balcony: 4499, Suite: 7999 },
    bookingUrlTemplate: "https://www.vikingcruises.com/oceans/cruises/details.html",
  },
  {
    key: "VIK-VEN-ATH-10M",
    shipName: "Viking Venus", lineName: "Viking Ocean Cruises", sourceId: "viking",
    departurePort: "Athens (Piraeus), Greece", arrivalPort: "Barcelona, Spain",
    nights: 10, destination: "Mediterranean", intervalDays: 12, anchorDate: "2027-04-15",
    portsOfCall: ["Dubrovnik, Croatia", "Valletta, Malta", "Naples, Italy", "Rome (Civitavecchia), Italy"],
    fares: { Interior: 2999, Oceanview: 3799, Balcony: 4499, Suite: 7999 },
    bookingUrlTemplate: "https://www.vikingcruises.com/oceans/cruises/details.html",
  },
  // ── Viking Mars — Northern Europe ─────────────────────────────────────────
  {
    key: "VIK-MAR-BGO-12N",
    shipName: "Viking Mars", lineName: "Viking Ocean Cruises", sourceId: "viking",
    departurePort: "Bergen, Norway", arrivalPort: "Southampton, UK",
    nights: 12, destination: "Northern Europe", intervalDays: 14, anchorDate: "2026-09-12",
    portsOfCall: ["Stavanger, Norway", "Flåm, Norway", "Reykjavík, Iceland"],
    fares: { Interior: 3499, Oceanview: 4299, Balcony: 5199, Suite: 8999 },
    bookingUrlTemplate: "https://www.vikingcruises.com/oceans/cruises/details.html",
  },
  {
    key: "VIK-MAR-SOU-12N",
    shipName: "Viking Mars", lineName: "Viking Ocean Cruises", sourceId: "viking",
    departurePort: "Southampton, UK", arrivalPort: "Bergen, Norway",
    nights: 12, destination: "Northern Europe", intervalDays: 14, anchorDate: "2026-09-24",
    portsOfCall: ["Reykjavík, Iceland", "Flåm, Norway", "Stavanger, Norway"],
    fares: { Interior: 3499, Oceanview: 4299, Balcony: 5199, Suite: 8999 },
    bookingUrlTemplate: "https://www.vikingcruises.com/oceans/cruises/details.html",
  },
  // ── Viking Star — Mediterranean (winter) ──────────────────────────────────
  {
    key: "VIK-STA-BCN-14M",
    shipName: "Viking Star", lineName: "Viking Ocean Cruises", sourceId: "viking",
    departurePort: "Barcelona, Spain", arrivalPort: "Barcelona, Spain",
    nights: 14, destination: "Mediterranean", intervalDays: 15, anchorDate: "2026-11-07",
    portsOfCall: ["Valletta, Malta", "Athens (Piraeus), Greece", "Santorini, Greece", "Dubrovnik, Croatia", "Rome (Civitavecchia), Italy"],
    fares: { Interior: 3999, Oceanview: 4999, Balcony: 5999, Suite: 9999 },
    bookingUrlTemplate: "https://www.vikingcruises.com/oceans/cruises/details.html",
  },
  // ── Viking Sky — British Isles ─────────────────────────────────────────────
  {
    key: "VIK-SKY-SOU-11BI",
    shipName: "Viking Sky", lineName: "Viking Ocean Cruises", sourceId: "viking",
    departurePort: "Southampton, UK", arrivalPort: "Southampton, UK",
    nights: 11, destination: "Northern Europe", intervalDays: 14, anchorDate: "2027-05-08",
    portsOfCall: ["Amsterdam, Netherlands", "Hamburg, Germany", "Copenhagen, Denmark"],
    fares: { Interior: 3199, Oceanview: 3999, Balcony: 4799, Suite: 8499 },
    bookingUrlTemplate: "https://www.vikingcruises.com/oceans/cruises/details.html",
  },
];

export const vikingSource: SailingSource = {
  id: "viking",
  displayName: "Viking Ocean Cruises",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Generating Viking Ocean Cruises schedule (schedule-based, no web scraping)");
    let count = 0;
    for (const sailing of generate(ROUTES)) {
      yield sailing;
      count++;
    }
    progress.log(`Generated ${count} Viking sailings`);
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
