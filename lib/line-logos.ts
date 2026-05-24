/**
 * Cruise line logo URLs, keyed by line ID.
 * Uses Clearbit Logo API — returns square PNG logos by domain, no auth required.
 */
export const LINE_LOGOS: Record<string, string> = {
  "carnival":       "https://logo.clearbit.com/carnival.com",
  "holland-america":"https://logo.clearbit.com/hollandamerica.com",
  "msc":            "https://logo.clearbit.com/msccruises.com",
  "norwegian":      "https://logo.clearbit.com/ncl.com",
  "princess":       "https://logo.clearbit.com/princess.com",
};
