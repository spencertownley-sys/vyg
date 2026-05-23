/**
 * Holland America Line source crawler — SKELETON (not implemented in v1).
 *
 * See follow-up prompt for full implementation.
 *
 * Expected complexity:
 * - Holland America's site (hollandamerica.com) is server-rendered on cruise listing
 *   pages but uses client-side React for the booking flow.
 * - JSON-LD is present on detail pages — a static fetch + cheerio approach similar
 *   to Carnival may work without Playwright.
 * - Verify sitemap structure at https://www.hollandamerica.com/sitemap.xml before
 *   implementing.
 *
 * When implementing:
 * 1. Add "www.hollandamerica.com" to ingestion/crawler/allowlist.ts
 * 2. Attempt static fetch + JSON-LD extraction (no Playwright needed if it works)
 * 3. Fall back to Playwright if the sitemap is sparse or detail pages require JS
 */

import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

export const hollandAmericaSource: SailingSource = {
  id: "holland-america",
  displayName: "Holland America Line",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Holland America Line crawler not implemented in v1, see follow-up prompt");
    return;
  },

  normalize(_raw: RawSailing): CanonicalSailing | null {
    return null;
  },
};
