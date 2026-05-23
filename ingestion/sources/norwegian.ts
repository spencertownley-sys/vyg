/**
 * Norwegian Cruise Line source crawler — SKELETON (not implemented in v1).
 *
 * See follow-up prompt for full implementation.
 *
 * Expected complexity:
 * - NCL.com uses a React SPA with dynamic routing.
 * - Will require Playwright for JS rendering.
 * - Cruise data appears to be loaded via internal API calls (XHR intercept approach
 *   may be viable as an alternative to JSON-LD parsing).
 *
 * When implementing:
 * 1. Add "www.ncl.com" to ingestion/crawler/allowlist.ts
 * 2. Install Playwright: npm install playwright
 * 3. Consider intercepting XHR/fetch calls for structured cruise data
 */

import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

export const norwegianSource: SailingSource = {
  id: "norwegian",
  displayName: "Norwegian Cruise Line",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Norwegian Cruise Line crawler not implemented in v1, see follow-up prompt");
    return;
  },

  normalize(_raw: RawSailing): CanonicalSailing | null {
    return null;
  },
};
