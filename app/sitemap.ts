import type { MetadataRoute } from "next";
import {
  getAllCruiseLines,
  getAllShips,
  getAllPorts,
  getDestinations,
  getDeparturePortsWithCounts,
} from "@/db/queries";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://vygrcruises.com";

function url(path: string) {
  return `${BASE}${path}`;
}

function destSlug(dest: string) {
  return encodeURIComponent(dest.toLowerCase().replace(/\s+/g, "-"));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"),             lastModified: now, changeFrequency: "daily",   priority: 1 },
    { url: url("/search"),       lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: url("/cruises-from"), lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: url("/cruises-to"),   lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: url("/lines"),        lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: url("/ships"),        lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: url("/ports"),        lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/charters"),     lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: url("/about"),        lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  // ── Cruise lines ──────────────────────────────────────────────────────────
  const lines = getAllCruiseLines().map((line) => ({
    url: url(`/lines/${line.id}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ── Ships ─────────────────────────────────────────────────────────────────
  const ships = getAllShips().map(({ ship }) => ({
    url: url(`/ships/${ship.id}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // ── Departure ports ───────────────────────────────────────────────────────
  const departurePorts = getDeparturePortsWithCounts().map(({ port }) => ({
    url: url(`/cruises-from/${port.id}`),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // ── All ports (detail pages) ──────────────────────────────────────────────
  const allPorts = getAllPorts().map((port) => ({
    url: url(`/ports/${port.id}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // ── Destinations ──────────────────────────────────────────────────────────
  const destinations = getDestinations().map((dest) => ({
    url: url(`/cruises-to/${destSlug(dest)}`),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...lines,
    ...ships,
    ...departurePorts,
    ...allPorts,
    ...destinations,
  ];
}
