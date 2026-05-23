import type { RawSailing, CanonicalSailing } from "./sources/types";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSailId(raw: RawSailing): string {
  const ship = slugify(raw.shipName).slice(0, 12).toUpperCase().replace(/-/g, "");
  return `${raw.sourceId.toUpperCase()}-${raw.departDate}-${ship}`;
}

export function normalizeRawSailing(raw: RawSailing): CanonicalSailing | null {
  if (!raw.shipName?.trim()) return null;
  if (!raw.departDate?.match(/^\d{4}-\d{2}-\d{2}$/)) return null;
  if (!raw.arriveDate?.match(/^\d{4}-\d{2}-\d{2}$/)) return null;
  if (!raw.departurePort?.trim()) return null;
  if (!raw.lineName?.trim()) return null;
  if (raw.nights <= 0) return null;

  return {
    sail_id: buildSailId(raw),
    ship_name: raw.shipName.trim(),
    line_name: raw.lineName.trim(),
    departure_port: raw.departurePort.trim(),
    arrival_port: (raw.arrivalPort ?? raw.departurePort).trim(),
    departure_dt: raw.departDate,
    arrival_dt: raw.arriveDate,
    sail_duration: raw.nights,
    destination: raw.destination.trim(),
    ports_of_call: raw.portsOfCall.filter(Boolean),
    fares: raw.fares ?? {},
    charter_flag: raw.charterFlag ?? false,
    charter_name: raw.charterName,
    source_url: raw.sourceUrl,
  };
}
