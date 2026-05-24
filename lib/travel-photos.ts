/**
 * Consistent photo URLs for destinations and ports.
 * Uses Lorem Picsum (picsum.photos) which is reliable and supports string seeds.
 * Each unique destination/port always gets the same photo.
 */

// For known cruise destinations, use curated seeds that return travel-friendly photos.
const DESTINATION_SEEDS: Record<string, string> = {
  "Caribbean":          "caribbean-turquoise",
  "Mediterranean":      "mediterranean-santorini",
  "Alaska":             "alaska-glacier-mountains",
  "Northern Europe":    "northern-europe-fjords",
  "Bermuda":            "bermuda-pink-sand",
  "Mexican Riviera":    "mexican-riviera-coast",
  "Hawaii":             "hawaii-tropical-beach",
  "Southern Caribbean": "southern-caribbean-island",
  "Panama Canal":       "panama-canal-ship",
  "California Coast":   "california-coast-cliffs",
  "Baltic":             "baltic-old-city",
  "South Pacific":      "south-pacific-atoll",
  "Canada & New England": "canada-new-england-coast",
  "Transatlantic":      "transatlantic-ocean",
};

export function destinationPhotoUrl(destination: string): string {
  const seed = DESTINATION_SEEDS[destination] ?? destination.toLowerCase().replace(/\s+/g, "-");
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/600`;
}

export function portPhotoUrl(portId: string, _portName?: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(portId)}/600/600`;
}
