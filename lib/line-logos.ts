/**
 * Cruise line branding: logo image URL (if available) + brand color + short name.
 * The logo URL is tried first; if it fails to load the LineLogo component
 * falls back to a colored text badge using the brand color.
 */
export interface LineMeta {
  logoUrl: string | null;
  color: string;   // brand primary color
  short: string;   // short display name for text badge
}

export const LINE_META: Record<string, LineMeta> = {
  "carnival": {
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/ca/Carnival_Cruise_Line_Logo.svg",
    color: "#003087",
    short: "Carnival",
  },
  "holland-america": {
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/4/4f/Holland_America_Line_logo.svg",
    color: "#00205B",
    short: "Holland America",
  },
  "msc": {
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/MSC_Cruises_Logo.png",
    color: "#003082",
    short: "MSC Cruises",
  },
  "norwegian": {
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Norwegian_Cruise_Line_2026_Logo.jpg",
    color: "#CE0E2D",
    short: "Norwegian",
  },
  "princess": {
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/1/14/Princess_Cruises_logo.svg",
    color: "#1B3C8F",
    short: "Princess",
  },
  "royal-caribbean": {
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Royal_Caribbean_logo_%282024%29.svg",
    color: "#0057B8",
    short: "Royal Caribbean",
  },
  "viking": {
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/7/7f/Viking_Cruises_transparent_logo.svg",
    color: "#004A8F",
    short: "Viking",
  },
  "virgin-voyages": {
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/db/Virgin_Voyages_logo.svg",
    color: "#D62B2B",
    short: "Virgin Voyages",
  },
  "disney": {
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/6/6f/Disney_Cruise_Line_logo.svg",
    color: "#003087",
    short: "Disney Cruise",
  },
  "celebrity": {
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Celebrity-Cruises-Logo.svg",
    color: "#2B3A52",
    short: "Celebrity",
  },
};
