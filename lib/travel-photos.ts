/**
 * Curated Unsplash photo URLs for known cruise destinations and departure ports.
 * Direct CDN access (images.unsplash.com) works without an API key.
 *
 * To update a photo: replace the ID after "photo-" with any valid Unsplash photo ID.
 */

function unsplash(id: string): string {
  return `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&auto=format&q=80`;
}

// ── Destination photos ────────────────────────────────────────────────────────
// Keys must match sailing.destination values exactly.
const DESTINATION_PHOTOS: Record<string, string> = {
  "Alaska":
    unsplash("1469854523086-cc02fe5d8800"), // glacier bay / wilderness
  "Australia & New Zealand":
    unsplash("1523482580672-f109ba8cb9be"), // Sydney Opera House
  "Bahamas":
    unsplash("1548574505-5e239809f9b2"),    // turquoise water, Exuma
  "Caribbean":
    unsplash("1507525428034-b723cf961d3e"), // tropical beach, palm trees
  "Eastern Caribbean":
    unsplash("1544551763-46a013bb70d5"),    // crystal Caribbean water
  "Mediterranean":
    unsplash("1570077188670-e3a8d69ac5ff"), // Santorini blue domes
  "Western Caribbean":
    unsplash("1512813195386-6cf811ad3542"), // tropical coast / Mexico
  "Northern Europe":
    unsplash("1513622470522-26c3c8a854bc"), // Norwegian fjords / nature
  "World":
    unsplash("1534655378-51ee269f1d17"),    // globe / map travel
};

// ── Departure port photos ─────────────────────────────────────────────────────
// Keys are port IDs from the ports table.
const PORT_PHOTOS: Record<string, string> = {
  "miami-fl":
    unsplash("1514214246283-d427a95c5d2f"), // Miami skyline / Art Deco
  "fort-lauderdale-fl":
    unsplash("1533587851505-d119e13900b5"), // waterway / yacht harbor
  "port-canaveral-fl":
    unsplash("1532251737086-f7c04ecbe4e3"), // Florida coast / space coast
  "galveston-tx":
    unsplash("1558618666-fcd25c85cd64"),    // Gulf Coast / beach
  "new-orleans-la":
    unsplash("1557804506-669a67965ba0"),    // New Orleans French Quarter
  "seattle-wa":
    unsplash("1502175353174-a7a70e73b362"), // Seattle skyline / Puget Sound
  "southampton-uk":
    unsplash("1535392432937-a27c36ec07b5"), // UK harbor / port
  "sydney-australia":
    unsplash("1528072164453-f4e8ef0d475a"), // Sydney Harbour Bridge
  "vancouver-bc":
    unsplash("1559521783-1d1599583165"),    // Vancouver skyline / mountains
  "barcelona-spain":
    unsplash("1583422409516-2895a77efded"), // Barcelona / Sagrada Família
  "bergen-norway":
    unsplash("1508193638397-1c4234db14d8"), // Bergen Bryggen wharf
  "stavanger-norway":
    unsplash("1513622470522-26c3c8a854bc"), // Norway fjords
  "reykjavik-iceland":
    unsplash("1529963183134-61a90db47eaf"), // Reykjavík / Iceland
};

export function destinationPhotoUrl(destination: string): string {
  return DESTINATION_PHOTOS[destination] ?? unsplash("1507525428034-b723cf961d3e");
}

export function portPhotoUrl(portId: string, _portName?: string): string {
  return PORT_PHOTOS[portId] ?? unsplash("1507525428034-b723cf961d3e");
}
