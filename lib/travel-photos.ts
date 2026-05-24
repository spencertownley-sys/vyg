/**
 * Curated Unsplash photo fallbacks for cruise destinations and departure ports.
 * ALL IDs below have been verified HTTP 200 as of May 2026.
 *
 * Wikipedia thumbnails are fetched first (see lib/wiki-photos.ts); these
 * Unsplash URLs are only shown when Wikipedia has no usable image.
 *
 * To update a photo: replace the ID after "photo-" with a valid Unsplash ID.
 * Verify with: curl -sI "https://images.unsplash.com/photo-<ID>?w=600&h=600&fit=crop"
 */

function unsplash(id: string): string {
  return `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&auto=format&q=80`;
}

// Generic fallbacks reused where a specific shot isn't available
const TROPICAL_BEACH  = unsplash("1507525428034-b723cf961d3e"); // palm-fringed beach
const MIAMI_SKYLINE   = unsplash("1514214246283-d427a95c5d2f"); // Biscayne Bay / skyline
const AMSTERDAM_CANAL = unsplash("1534351590666-13e3e96b5017"); // Northern European harbor
const NEW_YORK        = unsplash("1534430480872-3498386e7856"); // NYC / harbor
const VANCOUVER       = unsplash("1559521783-1d1599583165");    // Pacific NW mountains
const SYDNEY          = unsplash("1523482580672-f109ba8cb9be"); // Sydney Opera House
const FJORD           = unsplash("1513622470522-26c3c8a854bc"); // Norwegian fjords

// ── Destination photos ────────────────────────────────────────────────────────
// Keys must match sailing.destination values exactly.
const DESTINATION_PHOTOS: Record<string, string> = {
  "Alaska":
    unsplash("1469854523086-cc02fe5d8800"), // glacier bay / wilderness
  "Australia & New Zealand":
    SYDNEY,
  "Bahamas":
    unsplash("1548574505-5e239809f9b2"),    // turquoise Exuma waters
  "Bermuda":
    TROPICAL_BEACH,                          // Wikipedia (Horseshoe Bay) is primary
  "Caribbean":
    TROPICAL_BEACH,
  "Eastern Caribbean":
    unsplash("1544551763-46a013bb70d5"),    // crystal Caribbean water
  "Mediterranean":
    unsplash("1570077188670-e3a8d69ac5ff"), // Santorini blue domes
  "Northern Europe":
    FJORD,
  "Southern Caribbean":
    TROPICAL_BEACH,                          // Wikipedia (Barbados) is primary
  "Western Caribbean":
    unsplash("1526392060635-9d6019884377"), // Cozumel / turquoise Mexico coast
  "World":
    unsplash("1501854140801-50d01698950b"), // aerial earth view
};

// ── Departure port photos ─────────────────────────────────────────────────────
// Keys are port IDs from the ports table.
const PORT_PHOTOS: Record<string, string> = {
  // ── USA — Florida ─────────────────────────────────────────────────────────
  "miami-fl":           MIAMI_SKYLINE,
  "fort-lauderdale-fl": MIAMI_SKYLINE,        // Wikipedia is primary; Miami as fallback
  "port-canaveral-fl":
    unsplash("1454789548928-9efd52dc4031"),    // Florida coast / space coast
  "tampa-fl":           MIAMI_SKYLINE,        // Wikipedia (Tampa, Florida) is primary
  "jacksonville-fl":    MIAMI_SKYLINE,        // Wikipedia (Jacksonville) is primary
  // ── USA — Gulf / South ────────────────────────────────────────────────────
  "galveston-tx":
    unsplash("1558618666-fcd25c85cd64"),      // Gulf Coast beach / pier
  "new-orleans-la":
    unsplash("1557804506-669a67965ba0"),      // French Quarter / Bourbon Street
  // ── USA — East Coast ──────────────────────────────────────────────────────
  "baltimore-md":       NEW_YORK,             // Wikipedia (Inner Harbor) is primary
  "new-york-ny":        NEW_YORK,
  "cape-liberty-nj":    NEW_YORK,
  "charleston-sc":      MIAMI_SKYLINE,        // Wikipedia (Charleston) is primary
  // ── USA — Pacific Northwest ───────────────────────────────────────────────
  "seattle-wa":
    unsplash("1502175353174-a7a70e73b362"),   // Seattle skyline / Puget Sound
  // ── Canada ────────────────────────────────────────────────────────────────
  "vancouver-bc":       VANCOUVER,
  "victoria-bc":        VANCOUVER,            // Wikipedia (Victoria, BC) is primary
  // ── Europe — Western Mediterranean ───────────────────────────────────────
  "barcelona-spain":
    unsplash("1583422409516-2895a77efded"),   // Sagrada Família
  "rome-civitavecchia":
    unsplash("1552832230-c0197dd311b5"),      // Rome / Colosseum
  "naples-italy":
    unsplash("1599059813005-11265ba4b4ce"),   // Naples / coast
  "athens-piraeus":
    unsplash("1555993539-1732b0258235"),      // Athens / Parthenon
  // ── Europe — Northern ─────────────────────────────────────────────────────
  "southampton-uk":
    unsplash("1513635269975-59663e0ac1ad"),   // English coast / harbor
  "amsterdam-netherlands": AMSTERDAM_CANAL,
  "hamburg-germany":    AMSTERDAM_CANAL,     // Wikipedia (Hamburg) is primary
  "copenhagen-denmark":
    unsplash("1534351590666-13e3e96b5017"),  // canal city (Amsterdam-style)
  "bergen-norway":
    unsplash("1508193638397-1c4234db14d8"), // Bryggen wharf
  "stavanger-norway":   FJORD,
  "reykjavik-iceland":
    unsplash("1529963183134-61a90db47eaf"), // Hallgrímskirkja / Iceland
  // ── Australia / NZ ────────────────────────────────────────────────────────
  "sydney-australia":
    unsplash("1528072164453-f4e8ef0d475a"), // Sydney Opera House & Bridge
  "auckland-nz":        SYDNEY,             // Wikipedia (Auckland) is primary
};

export function destinationPhotoUrl(destination: string): string {
  return DESTINATION_PHOTOS[destination] ?? TROPICAL_BEACH;
}

export function portPhotoUrl(portId: string, _portName?: string): string {
  return PORT_PHOTOS[portId] ?? TROPICAL_BEACH;
}
