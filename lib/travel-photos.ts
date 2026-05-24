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
    unsplash("1469854523086-cc02fe5d8800"), // glacier / fjord wilderness
  "Australia & New Zealand":
    unsplash("1523482580672-f109ba8cb9be"), // Sydney Opera House
  "Bahamas":
    unsplash("1548574505-5e239809f9b2"),    // turquoise Exuma waters
  "Bermuda":
    unsplash("1559128010-7c1ad6e1d6a3"),    // pink sand beach
  "Caribbean":
    unsplash("1507525428034-b723cf961d3e"), // tropical beach, palm trees
  "Eastern Caribbean":
    unsplash("1548484565-2e68571a2b83"),    // St Thomas / clear Caribbean
  "Mediterranean":
    unsplash("1570077188670-e3a8d69ac5ff"), // Santorini blue domes
  "Northern Europe":
    unsplash("1513622470522-26c3c8a854bc"), // Norwegian fjords
  "Southern Caribbean":
    unsplash("1589179053705-5f0d89f66944"), // Barbados / tropical waters
  "Western Caribbean":
    unsplash("1526392060635-9d6019884377"), // Cozumel / turquoise Mexico coast
  "World":
    unsplash("1501854140801-50d01698950b"), // aerial earth / globe
};

// ── Departure port photos ─────────────────────────────────────────────────────
// Keys are port IDs from the ports table.
const PORT_PHOTOS: Record<string, string> = {
  // USA — Florida
  "miami-fl":
    unsplash("1514214246283-d427a95c5d2f"), // Miami skyline / Biscayne Bay
  "fort-lauderdale-fl":
    unsplash("1533587851505-d119e13900b5"), // Fort Lauderdale waterway
  "port-canaveral-fl":
    unsplash("1454789548928-9efd52dc4031"), // space coast / Kennedy Space Center
  "tampa-fl":
    unsplash("1605723517503-3cadb5818a0a"), // Tampa Bay skyline
  "jacksonville-fl":
    unsplash("1581771880620-e2e36d756fc6"), // Jacksonville river / bridge
  // USA — Gulf Coast
  "galveston-tx":
    unsplash("1558618666-fcd25c85cd64"),    // Gulf Coast beach / pier
  "new-orleans-la":
    unsplash("1557804506-669a67965ba0"),    // French Quarter / Bourbon Street
  // USA — East Coast
  "baltimore-md":
    unsplash("1597240238565-0d1aebc08a54"), // Baltimore Inner Harbor
  "new-york-ny":
    unsplash("1534430480872-3498386e7856"), // New York City skyline / harbor
  "charleston-sc":
    unsplash("1553745538-27a85eb908d5"),    // Charleston historic district
  "cape-liberty-nj":
    unsplash("1534430480872-3498386e7856"), // NYC skyline (shares with NY)
  // USA — Pacific Northwest / Alaska
  "seattle-wa":
    unsplash("1502175353174-a7a70e73b362"), // Seattle skyline / Puget Sound
  // Canada
  "vancouver-bc":
    unsplash("1559521783-1d1599583165"),    // Vancouver mountains / harbor
  "victoria-bc":
    unsplash("1619459461020-87e37ce3f06d"), // Victoria harbor / parliament
  // Europe — Western Mediterranean
  "barcelona-spain":
    unsplash("1583422409516-2895a77efded"), // Sagrada Família
  "rome-civitavecchia":
    unsplash("1552832230-c0197dd311b5"),    // Rome / Colosseum
  "naples-italy":
    unsplash("1599059813005-11265ba4b4ce"), // Naples / Mount Vesuvius
  "athens-piraeus":
    unsplash("1555993539-1732b0258235"),    // Athens / Parthenon
  // Europe — Northern
  "southampton-uk":
    unsplash("1513635269975-59663e0ac1ad"), // English coast / harbor
  "amsterdam-netherlands":
    unsplash("1534351590666-13e3e96b5017"), // Amsterdam canals
  "hamburg-germany":
    unsplash("1548112684-2648b6e52c5e"),    // Hamburg Speicherstadt
  "copenhagen-denmark":
    unsplash("1513622470522-26c3c8a854bc"), // colorful Nyhavn canal
  "bergen-norway":
    unsplash("1508193638397-1c4234db14d8"), // Bryggen wharf, Bergen
  "stavanger-norway":
    unsplash("1513622470522-26c3c8a854bc"), // Norwegian fjords
  "reykjavik-iceland":
    unsplash("1529963183134-61a90db47eaf"), // Hallgrímskirkja / Iceland
  // Australia / NZ
  "sydney-australia":
    unsplash("1528072164453-f4e8ef0d475a"), // Sydney Opera House & Bridge
  "auckland-nz":
    unsplash("1507249813323-b1a7c47b7df3"), // Auckland skyline / harbor
};

export function destinationPhotoUrl(destination: string): string {
  return DESTINATION_PHOTOS[destination] ?? unsplash("1507525428034-b723cf961d3e");
}

export function portPhotoUrl(portId: string, _portName?: string): string {
  return PORT_PHOTOS[portId] ?? unsplash("1507525428034-b723cf961d3e");
}
