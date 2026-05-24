/**
 * Seed script: wipes and rebuilds the database with realistic sample data.
 * Run with: npm run seed
 *
 * Covers 5 cruise lines, 15 ships, 40+ ports, 200+ sailings.
 * All lines are treated equally — no line is seeded with more or better data.
 */

import { db, sqlite, initializeSchema } from "../db/client";
import {
  cruiseLines, ships, ports, sailings, itineraryStops,
  ingestionRuns, adminUsers, adminSessions,
} from "../db/schema";
import { v4 as uuidv4 } from "uuid";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fareSet(baseInterior: number): Record<string, number> {
  return {
    Interior: baseInterior,
    Oceanview: Math.round(baseInterior * 1.35),
    Balcony: Math.round(baseInterior * 1.85),
    "Mini-Suite": Math.round(baseInterior * 2.5),
    Suite: Math.round(baseInterior * 4.2),
  };
}

// ── Cruise Lines ──────────────────────────────────────────────────────────────
const LINE_DATA = [
  {
    id: "carnival",
    name: "Carnival Cruise Line",
    websiteUrl: "https://www.carnival.com",
    bookingUrlTemplate: "https://www.carnival.com/cruise/{id}",
    crawlerId: "carnival",
    enabled: true,
  },
  {
    id: "holland-america",
    name: "Holland America Line",
    websiteUrl: "https://www.hollandamerica.com",
    bookingUrlTemplate: "https://www.hollandamerica.com/en_US/cruise/{id}",
    crawlerId: "holland-america",
    enabled: true,
  },
  {
    id: "msc",
    name: "MSC Cruises",
    websiteUrl: "https://www.msccruisesusa.com",
    bookingUrlTemplate: "https://www.msccruisesusa.com/cruises/{id}",
    crawlerId: "msc",
    enabled: true,
  },
  {
    id: "norwegian",
    name: "Norwegian Cruise Line",
    websiteUrl: "https://www.ncl.com",
    bookingUrlTemplate: "https://www.ncl.com/cruises/{id}",
    crawlerId: "norwegian",
    enabled: true,
  },
  {
    id: "princess",
    name: "Princess Cruises",
    websiteUrl: "https://www.princess.com",
    bookingUrlTemplate: "https://www.princess.com/cruise/detail/{id}",
    crawlerId: "princess",
    enabled: true,
  },
];

// ── Ships ─────────────────────────────────────────────────────────────────────
const SHIP_DATA = [
  // Carnival
  { id: "carnival-mardi-gras", lineId: "carnival", name: "Mardi Gras", shipClass: "Excel", yearBuilt: 2021, capacity: 5282 },
  { id: "carnival-celebration", lineId: "carnival", name: "Carnival Celebration", shipClass: "Excel", yearBuilt: 2022, capacity: 5374 },
  { id: "carnival-jubilee", lineId: "carnival", name: "Carnival Jubilee", shipClass: "Excel", yearBuilt: 2023, capacity: 5374 },
  { id: "carnival-vista", lineId: "carnival", name: "Carnival Vista", shipClass: "Vista", yearBuilt: 2016, capacity: 3934 },
  // Holland America
  { id: "rotterdam", lineId: "holland-america", name: "Rotterdam", shipClass: "Pinnacle", yearBuilt: 2021, capacity: 2668 },
  { id: "koningsdam", lineId: "holland-america", name: "Koningsdam", shipClass: "Pinnacle", yearBuilt: 2016, capacity: 2650 },
  { id: "nieuw-statendam", lineId: "holland-america", name: "Nieuw Statendam", shipClass: "Pinnacle", yearBuilt: 2018, capacity: 2666 },
  // MSC
  { id: "msc-world-europa", lineId: "msc", name: "MSC World Europa", shipClass: "World", yearBuilt: 2022, capacity: 6762 },
  { id: "msc-seascape", lineId: "msc", name: "MSC Seascape", shipClass: "Seaside EVO", yearBuilt: 2022, capacity: 5877 },
  { id: "msc-meraviglia", lineId: "msc", name: "MSC Meraviglia", shipClass: "Meraviglia", yearBuilt: 2017, capacity: 5714 },
  // Norwegian
  { id: "norwegian-prima", lineId: "norwegian", name: "Norwegian Prima", shipClass: "Prima", yearBuilt: 2022, capacity: 3215 },
  { id: "norwegian-encore", lineId: "norwegian", name: "Norwegian Encore", shipClass: "Breakaway Plus", yearBuilt: 2019, capacity: 4004 },
  { id: "norwegian-bliss", lineId: "norwegian", name: "Norwegian Bliss", shipClass: "Breakaway Plus", yearBuilt: 2018, capacity: 4004 },
  // Princess
  { id: "sun-princess", lineId: "princess", name: "Sun Princess", shipClass: "Sphere", yearBuilt: 2024, capacity: 4300 },
  { id: "sky-princess", lineId: "princess", name: "Sky Princess", shipClass: "Royal", yearBuilt: 2019, capacity: 3660 },
  { id: "royal-princess", lineId: "princess", name: "Royal Princess", shipClass: "Royal", yearBuilt: 2013, capacity: 3560 },
];

// ── Ports ─────────────────────────────────────────────────────────────────────
const PORT_DATA = [
  // Caribbean
  { id: "miami-fl", name: "Miami, FL", city: "Miami", stateOrRegion: "FL", country: "USA", region: "Caribbean", lat: 25.7617, lng: -80.1918 },
  { id: "fort-lauderdale-fl", name: "Fort Lauderdale, FL", city: "Fort Lauderdale", stateOrRegion: "FL", country: "USA", region: "Caribbean", lat: 26.1224, lng: -80.1373 },
  { id: "port-canaveral-fl", name: "Port Canaveral, FL", city: "Port Canaveral", stateOrRegion: "FL", country: "USA", region: "Caribbean", lat: 28.4089, lng: -80.6076 },
  { id: "galveston-tx", name: "Galveston, TX", city: "Galveston", stateOrRegion: "TX", country: "USA", region: "Caribbean", lat: 29.3013, lng: -94.7977 },
  { id: "tampa-fl", name: "Tampa, FL", city: "Tampa", stateOrRegion: "FL", country: "USA", region: "Caribbean", lat: 27.9506, lng: -82.4572 },
  { id: "new-orleans-la", name: "New Orleans, LA", city: "New Orleans", stateOrRegion: "LA", country: "USA", region: "Caribbean", lat: 29.9511, lng: -90.0715 },
  { id: "nassau-bahamas", name: "Nassau, Bahamas", city: "Nassau", country: "Bahamas", region: "Caribbean", lat: 25.0443, lng: -77.3504 },
  { id: "cozumel-mexico", name: "Cozumel, Mexico", city: "Cozumel", country: "Mexico", region: "Caribbean", lat: 20.5083, lng: -86.9458 },
  { id: "george-town-cayman", name: "George Town, Cayman Islands", city: "George Town", country: "Cayman Islands", region: "Caribbean", lat: 19.2869, lng: -81.3674 },
  { id: "falmouth-jamaica", name: "Falmouth, Jamaica", city: "Falmouth", country: "Jamaica", region: "Caribbean", lat: 18.4933, lng: -77.6498 },
  { id: "ocho-rios-jamaica", name: "Ocho Rios, Jamaica", city: "Ocho Rios", country: "Jamaica", region: "Caribbean", lat: 18.4043, lng: -77.1070 },
  { id: "san-juan-pr", name: "San Juan, Puerto Rico", city: "San Juan", stateOrRegion: "PR", country: "USA", region: "Caribbean", lat: 18.4655, lng: -66.1057 },
  { id: "st-thomas-usvi", name: "St. Thomas, USVI", city: "Charlotte Amalie", country: "US Virgin Islands", region: "Caribbean", lat: 18.3358, lng: -64.8963 },
  { id: "st-maarten", name: "St. Maarten", city: "Philipsburg", country: "Sint Maarten", region: "Caribbean", lat: 18.0267, lng: -63.0511 },
  { id: "barbados", name: "Bridgetown, Barbados", city: "Bridgetown", country: "Barbados", region: "Caribbean", lat: 13.1132, lng: -59.6191 },
  // Alaska
  { id: "seattle-wa", name: "Seattle, WA", city: "Seattle", stateOrRegion: "WA", country: "USA", region: "Alaska", lat: 47.6062, lng: -122.3321 },
  { id: "vancouver-bc", name: "Vancouver, BC", city: "Vancouver", stateOrRegion: "BC", country: "Canada", region: "Alaska", lat: 49.2827, lng: -123.1207 },
  { id: "juneau-ak", name: "Juneau, AK", city: "Juneau", stateOrRegion: "AK", country: "USA", region: "Alaska", lat: 58.3005, lng: -134.4197 },
  { id: "skagway-ak", name: "Skagway, AK", city: "Skagway", stateOrRegion: "AK", country: "USA", region: "Alaska", lat: 59.4596, lng: -135.3144 },
  { id: "ketchikan-ak", name: "Ketchikan, AK", city: "Ketchikan", stateOrRegion: "AK", country: "USA", region: "Alaska", lat: 55.3422, lng: -131.6461 },
  { id: "victoria-bc", name: "Victoria, BC", city: "Victoria", stateOrRegion: "BC", country: "Canada", region: "Alaska", lat: 48.4284, lng: -123.3656 },
  // Mediterranean
  { id: "barcelona-spain", name: "Barcelona, Spain", city: "Barcelona", country: "Spain", region: "Mediterranean", lat: 41.3851, lng: 2.1734 },
  { id: "rome-civitavecchia", name: "Rome (Civitavecchia), Italy", city: "Civitavecchia", country: "Italy", region: "Mediterranean", lat: 42.0942, lng: 11.7965 },
  { id: "venice-trieste", name: "Venice / Trieste, Italy", city: "Trieste", country: "Italy", region: "Mediterranean", lat: 45.6499, lng: 13.7768 },
  { id: "athens-piraeus", name: "Athens (Piraeus), Greece", city: "Piraeus", country: "Greece", region: "Mediterranean", lat: 37.9415, lng: 23.6469 },
  { id: "santorini-greece", name: "Santorini, Greece", city: "Santorini", country: "Greece", region: "Mediterranean", lat: 36.3932, lng: 25.4615 },
  { id: "mykonos-greece", name: "Mykonos, Greece", city: "Mykonos", country: "Greece", region: "Mediterranean", lat: 37.4467, lng: 25.3288 },
  { id: "dubrovnik-croatia", name: "Dubrovnik, Croatia", city: "Dubrovnik", country: "Croatia", region: "Mediterranean", lat: 42.6507, lng: 18.0944 },
  { id: "naples-italy", name: "Naples, Italy", city: "Naples", country: "Italy", region: "Mediterranean", lat: 40.8518, lng: 14.2681 },
  { id: "valletta-malta", name: "Valletta, Malta", city: "Valletta", country: "Malta", region: "Mediterranean", lat: 35.8997, lng: 14.5146 },
  // Northern Europe
  { id: "southampton-uk", name: "Southampton, UK", city: "Southampton", country: "UK", region: "Northern Europe", lat: 50.9097, lng: -1.4044 },
  { id: "amsterdam-netherlands", name: "Amsterdam, Netherlands", city: "Amsterdam", country: "Netherlands", region: "Northern Europe", lat: 52.3676, lng: 4.9041 },
  { id: "hamburg-germany", name: "Hamburg, Germany", city: "Hamburg", country: "Germany", region: "Northern Europe", lat: 53.5753, lng: 10.0153 },
  { id: "copenhagen-denmark", name: "Copenhagen, Denmark", city: "Copenhagen", country: "Denmark", region: "Northern Europe", lat: 55.6761, lng: 12.5683 },
  // Asia-Pacific
  { id: "sydney-australia", name: "Sydney, Australia", city: "Sydney", country: "Australia", region: "Australia/NZ", lat: -33.8688, lng: 151.2093 },
  { id: "auckland-nz", name: "Auckland, New Zealand", city: "Auckland", country: "New Zealand", region: "Australia/NZ", lat: -36.8485, lng: 174.7633 },
  { id: "singapore", name: "Singapore", city: "Singapore", country: "Singapore", region: "Asia", lat: 1.3521, lng: 103.8198 },
  { id: "hong-kong", name: "Hong Kong", city: "Hong Kong", country: "China", region: "Asia", lat: 22.3193, lng: 114.1694 },
  { id: "tokyo-yokohama", name: "Tokyo (Yokohama), Japan", city: "Yokohama", country: "Japan", region: "Asia", lat: 35.4437, lng: 139.6380 },
  { id: "dubai-uae", name: "Dubai, UAE", city: "Dubai", country: "UAE", region: "Middle East", lat: 25.2048, lng: 55.2708 },
];

// ── Sailing generation helpers ────────────────────────────────────────────────
interface SailingDef {
  shipId: string;
  lineId: string;
  bookingTemplate: string;
  depPortId: string;
  arrPortId: string;
  startDate: string;
  nights: number;
  destination: string;
  portsOfCall: string[];
  fareBase: number;
  charter?: { name: string };
}

function makeSailingId(lineId: string, depPortId: string, startDate: string, shipId: string, nights: number): string {
  // Use the LAST segment of the ship slug — distinctive across ships sharing the same line prefix.
  // e.g. "carnival-mardi-gras" → "GRAS", "msc-seascape" → "SEAS", "rotterdam" → "ROTT"
  const shipSuffix = shipId.split("-").slice(-1)[0].slice(0, 5).toUpperCase();
  const parts = [lineId.slice(0, 3).toUpperCase(), depPortId.slice(0, 3).toUpperCase(), startDate, shipSuffix, String(nights) + "N"];
  return parts.join("-");
}

const allSailings: SailingDef[] = [];

// Helper to add a series of sailings on a route
function addSeries(
  options: Omit<SailingDef, "startDate"> & { firstDate: string; count: number; gapDays: number }
): void {
  let current = options.firstDate;
  for (let i = 0; i < options.count; i++) {
    allSailings.push({
      shipId: options.shipId,
      lineId: options.lineId,
      bookingTemplate: options.bookingTemplate,
      depPortId: options.depPortId,
      arrPortId: options.arrPortId,
      startDate: current,
      nights: options.nights,
      destination: options.destination,
      portsOfCall: options.portsOfCall,
      fareBase: options.fareBase,
      charter: options.charter,
    });
    current = addDays(current, options.gapDays);
  }
}

// ── Carnival Caribbean (year-round, peak Oct–Apr) ─────────────────────────────
addSeries({
  shipId: "carnival-mardi-gras", lineId: "carnival",
  bookingTemplate: "https://www.carnival.com/cruise/{id}",
  depPortId: "port-canaveral-fl", arrPortId: "port-canaveral-fl",
  firstDate: "2026-10-03", count: 20, gapDays: 7, nights: 7,
  destination: "Caribbean", portsOfCall: ["nassau-bahamas", "cozumel-mexico", "george-town-cayman"],
  fareBase: 899,
});

addSeries({
  shipId: "carnival-celebration", lineId: "carnival",
  bookingTemplate: "https://www.carnival.com/cruise/{id}",
  depPortId: "miami-fl", arrPortId: "miami-fl",
  firstDate: "2026-10-10", count: 18, gapDays: 7, nights: 7,
  destination: "Caribbean", portsOfCall: ["nassau-bahamas", "falmouth-jamaica", "george-town-cayman"],
  fareBase: 949,
});

addSeries({
  shipId: "carnival-jubilee", lineId: "carnival",
  bookingTemplate: "https://www.carnival.com/cruise/{id}",
  depPortId: "galveston-tx", arrPortId: "galveston-tx",
  firstDate: "2026-10-17", count: 16, gapDays: 7, nights: 7,
  destination: "Western Caribbean", portsOfCall: ["cozumel-mexico", "george-town-cayman", "falmouth-jamaica"],
  fareBase: 799,
});

addSeries({
  shipId: "carnival-vista", lineId: "carnival",
  bookingTemplate: "https://www.carnival.com/cruise/{id}",
  depPortId: "miami-fl", arrPortId: "miami-fl",
  firstDate: "2026-11-01", count: 14, gapDays: 7, nights: 7,
  destination: "Eastern Caribbean", portsOfCall: ["san-juan-pr", "st-thomas-usvi", "st-maarten"],
  fareBase: 849,
});

// Short Caribbean sailings
addSeries({
  shipId: "carnival-mardi-gras", lineId: "carnival",
  bookingTemplate: "https://www.carnival.com/cruise/{id}",
  depPortId: "port-canaveral-fl", arrPortId: "port-canaveral-fl",
  firstDate: "2026-10-01", count: 5, gapDays: 4, nights: 4,
  destination: "Bahamas", portsOfCall: ["nassau-bahamas"],
  fareBase: 599,
});

// ── Holland America Alaska (May–Sep 2027) ─────────────────────────────────────
addSeries({
  shipId: "rotterdam", lineId: "holland-america",
  bookingTemplate: "https://www.hollandamerica.com/en_US/cruise/{id}",
  depPortId: "seattle-wa", arrPortId: "seattle-wa",
  firstDate: "2027-05-08", count: 20, gapDays: 7, nights: 7,
  destination: "Alaska", portsOfCall: ["juneau-ak", "skagway-ak", "ketchikan-ak", "victoria-bc"],
  fareBase: 1199,
});

addSeries({
  shipId: "koningsdam", lineId: "holland-america",
  bookingTemplate: "https://www.hollandamerica.com/en_US/cruise/{id}",
  depPortId: "vancouver-bc", arrPortId: "seattle-wa",
  firstDate: "2027-05-09", count: 18, gapDays: 7, nights: 7,
  destination: "Alaska", portsOfCall: ["juneau-ak", "skagway-ak", "ketchikan-ak"],
  fareBase: 1099,
});

// Holland America Mediterranean (Apr–Oct)
addSeries({
  shipId: "nieuw-statendam", lineId: "holland-america",
  bookingTemplate: "https://www.hollandamerica.com/en_US/cruise/{id}",
  depPortId: "barcelona-spain", arrPortId: "rome-civitavecchia",
  firstDate: "2027-04-17", count: 12, gapDays: 12, nights: 12,
  destination: "Mediterranean", portsOfCall: ["naples-italy", "santorini-greece", "mykonos-greece", "athens-piraeus", "dubrovnik-croatia"],
  fareBase: 1699,
});

// ── MSC Mediterranean (Apr–Oct) and Caribbean ────────────────────────────────
addSeries({
  shipId: "msc-world-europa", lineId: "msc",
  bookingTemplate: "https://www.msccruisesusa.com/cruises/{id}",
  depPortId: "barcelona-spain", arrPortId: "athens-piraeus",
  firstDate: "2027-04-10", count: 14, gapDays: 7, nights: 7,
  destination: "Mediterranean", portsOfCall: ["naples-italy", "valletta-malta", "santorini-greece", "mykonos-greece"],
  fareBase: 1299,
});

addSeries({
  shipId: "msc-seascape", lineId: "msc",
  bookingTemplate: "https://www.msccruisesusa.com/cruises/{id}",
  depPortId: "miami-fl", arrPortId: "miami-fl",
  firstDate: "2026-10-31", count: 15, gapDays: 7, nights: 7,
  destination: "Caribbean", portsOfCall: ["nassau-bahamas", "ocho-rios-jamaica", "george-town-cayman"],
  fareBase: 899,
});

addSeries({
  shipId: "msc-meraviglia", lineId: "msc",
  bookingTemplate: "https://www.msccruisesusa.com/cruises/{id}",
  depPortId: "port-canaveral-fl", arrPortId: "port-canaveral-fl",
  firstDate: "2026-11-07", count: 13, gapDays: 7, nights: 7,
  destination: "Eastern Caribbean", portsOfCall: ["st-thomas-usvi", "st-maarten", "san-juan-pr"],
  fareBase: 849,
});

// ── Norwegian Bermuda, Caribbean, Alaska ─────────────────────────────────────
addSeries({
  shipId: "norwegian-prima", lineId: "norwegian",
  bookingTemplate: "https://www.ncl.com/cruises/{id}",
  depPortId: "new-orleans-la", arrPortId: "new-orleans-la",
  firstDate: "2026-10-04", count: 16, gapDays: 7, nights: 7,
  destination: "Western Caribbean", portsOfCall: ["cozumel-mexico", "george-town-cayman", "falmouth-jamaica"],
  fareBase: 949,
});

addSeries({
  shipId: "norwegian-encore", lineId: "norwegian",
  bookingTemplate: "https://www.ncl.com/cruises/{id}",
  depPortId: "seattle-wa", arrPortId: "seattle-wa",
  firstDate: "2027-05-02", count: 20, gapDays: 7, nights: 7,
  destination: "Alaska", portsOfCall: ["juneau-ak", "skagway-ak", "ketchikan-ak", "victoria-bc"],
  fareBase: 1249,
});

addSeries({
  shipId: "norwegian-bliss", lineId: "norwegian",
  bookingTemplate: "https://www.ncl.com/cruises/{id}",
  depPortId: "miami-fl", arrPortId: "san-juan-pr",
  firstDate: "2026-11-14", count: 10, gapDays: 7, nights: 7,
  destination: "Eastern Caribbean", portsOfCall: ["nassau-bahamas", "st-thomas-usvi", "barbados"],
  fareBase: 1099,
});

// ── Princess Alaska and Mediterranean ────────────────────────────────────────
addSeries({
  shipId: "sun-princess", lineId: "princess",
  bookingTemplate: "https://www.princess.com/cruise/detail/{id}",
  depPortId: "fort-lauderdale-fl", arrPortId: "fort-lauderdale-fl",
  firstDate: "2026-10-24", count: 14, gapDays: 7, nights: 7,
  destination: "Caribbean", portsOfCall: ["nassau-bahamas", "george-town-cayman", "cozumel-mexico"],
  fareBase: 999,
});

addSeries({
  shipId: "sky-princess", lineId: "princess",
  bookingTemplate: "https://www.princess.com/cruise/detail/{id}",
  depPortId: "vancouver-bc", arrPortId: "seattle-wa",
  firstDate: "2027-05-15", count: 18, gapDays: 7, nights: 7,
  destination: "Alaska", portsOfCall: ["juneau-ak", "ketchikan-ak", "skagway-ak"],
  fareBase: 1149,
});

addSeries({
  shipId: "royal-princess", lineId: "princess",
  bookingTemplate: "https://www.princess.com/cruise/detail/{id}",
  depPortId: "southampton-uk", arrPortId: "southampton-uk",
  firstDate: "2027-04-27", count: 10, gapDays: 14, nights: 14,
  destination: "Mediterranean", portsOfCall: ["barcelona-spain", "rome-civitavecchia", "naples-italy", "athens-piraeus", "dubrovnik-croatia"],
  fareBase: 1499,
});

// Long voyages
addSeries({
  shipId: "rotterdam", lineId: "holland-america",
  bookingTemplate: "https://www.hollandamerica.com/en_US/cruise/{id}",
  depPortId: "fort-lauderdale-fl", arrPortId: "sydney-australia",
  firstDate: "2027-01-14", count: 1, gapDays: 90, nights: 42,
  destination: "World", portsOfCall: ["nassau-bahamas", "george-town-cayman", "barbados", "dubai-uae", "singapore", "hong-kong", "tokyo-yokohama"],
  fareBase: 3999,
});

// Australia/NZ
addSeries({
  shipId: "sun-princess", lineId: "princess",
  bookingTemplate: "https://www.princess.com/cruise/detail/{id}",
  depPortId: "sydney-australia", arrPortId: "auckland-nz",
  firstDate: "2026-11-21", count: 4, gapDays: 14, nights: 14,
  destination: "Australia & New Zealand", portsOfCall: ["auckland-nz"],
  fareBase: 1299,
});

// Charter sailings
const charters = [
  { shipId: "carnival-mardi-gras", charterName: "BrewLife Festival at Sea 2027" },
  { shipId: "norwegian-encore", charterName: "Rhythm of the Waves Music Cruise 2027" },
  { shipId: "msc-seascape", charterName: "Star Wars Day at Sea 2026" },
  { shipId: "royal-princess", charterName: "Mediterranean LGBTQ+ Pride Cruise 2027" },
];

charters.forEach((c, i) => {
  const startDate = addDays("2027-01-10", i * 14);
  allSailings.push({
    shipId: c.shipId,
    lineId: SHIP_DATA.find((s) => s.id === c.shipId)!.lineId,
    bookingTemplate: LINE_DATA.find((l) => l.id === SHIP_DATA.find((s) => s.id === c.shipId)!.lineId)!.bookingUrlTemplate,
    depPortId: "miami-fl",
    arrPortId: "miami-fl",
    startDate,
    nights: 7,
    destination: "Caribbean",
    portsOfCall: ["nassau-bahamas", "george-town-cayman"],
    fareBase: 1499,
    charter: { name: c.charterName },
  });
});

// ── Write to DB ───────────────────────────────────────────────────────────────
console.log("Initializing schema...");
initializeSchema();

console.log("Wiping existing data...");
sqlite.exec("PRAGMA foreign_keys = OFF;");
sqlite.exec("DELETE FROM itinerary_stops;");
sqlite.exec("DELETE FROM sailings;");
sqlite.exec("DELETE FROM ingestion_runs;");
sqlite.exec("DELETE FROM ships;");
sqlite.exec("DELETE FROM ports;");
sqlite.exec("DELETE FROM cruise_lines;");
sqlite.exec("DELETE FROM admin_sessions;");
sqlite.exec("DELETE FROM admin_users;");
sqlite.exec("DELETE FROM sailings_fts;");
sqlite.exec("PRAGMA foreign_keys = ON;");

console.log("Inserting cruise lines...");
for (const line of LINE_DATA) {
  db.insert(cruiseLines).values(line).run();
}

console.log("Inserting ships...");
for (const ship of SHIP_DATA) {
  db.insert(ships).values(ship).run();
}

console.log("Inserting ports...");
for (const port of PORT_DATA) {
  db.insert(ports).values({
    ...port,
    stateOrRegion: port.stateOrRegion ?? null,
    timezone: null,
  }).run();
}

console.log(`Inserting ${allSailings.length} sailings...`);
let inserted = 0;

const lineMap = new Map(LINE_DATA.map((l) => [l.id, l]));
const shipMap = new Map(SHIP_DATA.map((s) => [s.id, s]));

for (const s of allSailings) {
  const sailId = makeSailingId(s.lineId, s.depPortId, s.startDate, s.shipId, s.nights);
  const arriveDate = addDays(s.startDate, s.nights);
  const line = lineMap.get(s.lineId)!;
  const bookingUrl = line.bookingUrlTemplate.replace("{id}", sailId);
  const fares = fareSet(s.fareBase);

  db.insert(sailings).values({
    id: sailId,
    shipId: s.shipId,
    departurePortId: s.depPortId,
    arrivalPortId: s.arrPortId,
    departDate: s.startDate,
    arriveDate,
    nights: s.nights,
    destination: s.destination,
    charterFlag: !!s.charter,
    charterName: s.charter?.name ?? null,
    bookingUrl,
    sampleFares: JSON.stringify(fares),
    sourceRunId: null,
    sourceUrl: null,
  }).run();

  // Itinerary stops
  s.portsOfCall.forEach((portId, i) => {
    db.insert(itineraryStops).values({
      sailingId: sailId,
      dayNumber: i + 2,
      portId,
      arriveTime: "08:00",
      departTime: "17:00",
    }).run();
  });

  // FTS
  const ship = shipMap.get(s.shipId)!;
  const lineName = LINE_DATA.find((l) => l.id === s.lineId)!.name;
  const depPortName = PORT_DATA.find((p) => p.id === s.depPortId)!.name;
  const arrPortName = PORT_DATA.find((p) => p.id === s.arrPortId)!.name;

  sqlite.prepare(`
    INSERT INTO sailings_fts (sailing_id, ship_name, line_name, departure_port, arrival_port, destination)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(sailId, ship.name, lineName, depPortName, arrPortName, s.destination);

  inserted++;
  if (inserted % 50 === 0) process.stdout.write(`  ${inserted}/${allSailings.length}\r`);
}

console.log(`\nInserted ${inserted} sailings.`);
console.log("Seed complete. Run `npm run create-admin` to create the admin user.");
