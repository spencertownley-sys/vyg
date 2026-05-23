/**
 * Carnival Cruise Line source crawler.
 *
 * Strategy:
 * 1. Fetch https://www.carnival.com/sitemap.xml → find cruise sub-sitemaps
 * 2. For each sailing URL, GET the page, extract JSON-LD blocks
 * 3. Parse Schema.org TouristTrip / Cruise types for structured data
 * 4. Normalize to CanonicalSailing
 *
 * ENV GATES (both required for real fetches):
 *   CRAWLER_ENABLED=true
 *   CRAWLER_LEGAL_REVIEW_COMPLETE=true
 *
 * Without both gates set, this source logs a message and yields nothing.
 * Remove the gates only after legal sign-off on the scraping approach.
 */

import * as xml2js from "xml2js";
import * as cheerio from "cheerio";
import { PoliteFetcher } from "../crawler/polite-fetcher";
import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter, CabinClass } from "./types";

const SITEMAP_URL = "https://www.carnival.com/sitemap.xml";
const SAILING_URL_PATTERN = /\/cruise-to\//;

function isEnabled(): boolean {
  return (
    process.env.CRAWLER_ENABLED === "true" &&
    process.env.CRAWLER_LEGAL_REVIEW_COMPLETE === "true"
  );
}

async function fetchSitemap(fetcher: PoliteFetcher): Promise<string[]> {
  const result = await fetcher.fetch(SITEMAP_URL);
  const parsed = await xml2js.parseStringPromise(result.body) as {
    sitemapindex?: { sitemap?: Array<{ loc?: string[] }> };
    urlset?: { url?: Array<{ loc?: string[] }> };
  };

  const urls: string[] = [];

  // Handle sitemap index (list of sub-sitemaps)
  if (parsed.sitemapindex?.sitemap) {
    for (const sm of parsed.sitemapindex.sitemap) {
      const loc = sm.loc?.[0];
      if (!loc) continue;
      // Fetch the sub-sitemap if it looks cruise-related
      if (loc.includes("cruise") || loc.includes("sailing")) {
        const subResult = await fetcher.fetch(loc);
        const subParsed = await xml2js.parseStringPromise(subResult.body) as {
          urlset?: { url?: Array<{ loc?: string[] }> };
        };
        for (const u of subParsed.urlset?.url ?? []) {
          const uLoc = u.loc?.[0];
          if (uLoc && SAILING_URL_PATTERN.test(uLoc)) {
            urls.push(uLoc);
          }
        }
      }
    }
  }

  // Handle flat urlset
  if (parsed.urlset?.url) {
    for (const u of parsed.urlset.url) {
      const loc = u.loc?.[0];
      if (loc && SAILING_URL_PATTERN.test(loc)) {
        urls.push(loc);
      }
    }
  }

  return [...new Set(urls)];
}

interface JsonLdBlock {
  "@type"?: string | string[];
  name?: string;
  startDate?: string;
  endDate?: string;
  location?: unknown;
  offers?: unknown;
  itinerary?: unknown;
  [key: string]: unknown;
}

async function fetchSailingPage(url: string, fetcher: PoliteFetcher): Promise<JsonLdBlock[]> {
  const result = await fetcher.fetch(url);
  const $ = cheerio.load(result.body);
  const blocks: JsonLdBlock[] = [];

  $('script[type="application/ld+json"]').each((_i, el) => {
    try {
      const text = $(el).text().trim();
      if (!text) return;
      const parsed = JSON.parse(text) as JsonLdBlock | JsonLdBlock[];
      if (Array.isArray(parsed)) {
        blocks.push(...parsed);
      } else {
        blocks.push(parsed);
      }
    } catch {
      // malformed JSON-LD — skip
    }
  });

  return blocks;
}

const CRUISE_TYPES = new Set(["TouristTrip", "Trip", "Cruise", "VacationPackage"]);

function isCruiseBlock(block: JsonLdBlock): boolean {
  const type = block["@type"];
  if (!type) return false;
  if (Array.isArray(type)) return type.some((t) => CRUISE_TYPES.has(t));
  return CRUISE_TYPES.has(type);
}

function extractPortName(location: unknown): string {
  if (!location) return "";
  if (typeof location === "string") return location;
  if (typeof location === "object" && location !== null) {
    const loc = location as Record<string, unknown>;
    return (loc.name as string) ?? (loc.address as string) ?? "";
  }
  return "";
}

function parseJsonLd(blocks: JsonLdBlock[], sourceUrl: string): RawSailing | null {
  const cruise = blocks.find(isCruiseBlock);
  if (!cruise) return null;

  const name = typeof cruise.name === "string" ? cruise.name : "";
  const startDate = typeof cruise.startDate === "string" ? cruise.startDate : "";
  const endDate = typeof cruise.endDate === "string" ? cruise.endDate : "";

  if (!startDate || !endDate) return null;

  const nights = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) return null;

  // Attempt to extract itinerary ports from itinerary field
  const portsOfCall: string[] = [];
  let departurePort = "";
  let arrivalPort = "";

  const itinerary = cruise.itinerary;
  if (Array.isArray(itinerary)) {
    itinerary.forEach((stop: unknown, i: number) => {
      const portName = extractPortName(stop);
      if (portName) {
        portsOfCall.push(portName);
        if (i === 0) departurePort = portName;
        if (i === itinerary.length - 1) arrivalPort = portName;
      }
    });
  }

  if (!departurePort) {
    const loc = extractPortName(cruise.location);
    departurePort = loc || "Port TBD";
    arrivalPort = loc || "Port TBD";
  }
  if (!arrivalPort) arrivalPort = departurePort;

  // Extract ship name from name field (e.g. "7-Night Caribbean Cruise on Carnival Vista")
  const shipMatch = name.match(/on\s+(.+?)(?:\s+from|\s*$)/i);
  const shipName = shipMatch ? shipMatch[1].trim() : "Carnival Ship";

  // Extract destination from name
  const destMatch = name.match(/cruise\s+(?:to\s+)?(?:the\s+)?(.+?)(?:\s+on|\s*$)/i);
  const destination = destMatch ? destMatch[1].trim() : "Caribbean";

  // Extract fares from offers if available
  const fares: Partial<Record<CabinClass, number>> = {};
  const offers = cruise.offers;
  if (Array.isArray(offers)) {
    for (const offer of offers as Array<{ name?: string; price?: number | string; lowPrice?: number | string }>) {
      const cabinName = offer.name ?? "";
      const price = Number(offer.price ?? offer.lowPrice ?? 0);
      if (price > 0) {
        if (/interior/i.test(cabinName)) fares["Interior"] = price;
        else if (/oceanview|ocean view/i.test(cabinName)) fares["Oceanview"] = price;
        else if (/balcony/i.test(cabinName)) fares["Balcony"] = price;
        else if (/mini.suite/i.test(cabinName)) fares["Mini-Suite"] = price;
        else if (/suite/i.test(cabinName)) fares["Suite"] = price;
      }
    }
  }

  return {
    sourceId: "carnival",
    sourceUrl,
    shipName,
    lineName: "Carnival Cruise Line",
    departurePort,
    arrivalPort,
    departDate: startDate.split("T")[0],
    arriveDate: endDate.split("T")[0],
    nights,
    destination,
    portsOfCall,
    fares,
  };
}

export const carnivalSource: SailingSource = {
  id: "carnival",
  displayName: "Carnival Cruise Line",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    if (!isEnabled()) {
      progress.log(
        "Crawler disabled — set CRAWLER_ENABLED=true and CRAWLER_LEGAL_REVIEW_COMPLETE=true to enable real fetches"
      );
      return;
    }

    const fetcher = new PoliteFetcher("carnival");
    progress.log("Fetching Carnival sitemap...");

    const urls = await fetchSitemap(fetcher);
    progress.log(`Found ${urls.length} sailing URLs in sitemap`);
    progress.update({ fetched: 0, total: urls.length });

    let fetched = 0;
    for (const url of urls) {
      try {
        const blocks = await fetchSailingPage(url, fetcher);
        const raw = parseJsonLd(blocks, url);
        if (raw) {
          yield raw;
        }
      } catch (err) {
        progress.log(`Error fetching ${url}: ${String(err)}`);
      }
      fetched++;
      progress.update({ fetched, total: urls.length });
    }
  },

  normalize(raw: RawSailing): CanonicalSailing | null {
    if (!raw.shipName || !raw.departDate || !raw.arriveDate || !raw.departurePort) {
      return null;
    }

    return {
      sail_id: `CCL-${raw.departDate}-${raw.shipName.replace(/\s+/g, "-").toUpperCase().slice(0, 10)}`,
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
      charter_flag: raw.charterFlag ?? false,
      charter_name: raw.charterName,
      source_url: raw.sourceUrl,
    };
  },
};
