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
    logoUrl: null,
    color: "#003087",
    short: "Carnival",
  },
  "holland-america": {
    logoUrl: null,
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
    logoUrl: null,
    color: "#1B3C8F",
    short: "Princess",
  },
};
