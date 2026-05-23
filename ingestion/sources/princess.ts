/**
 * Princess Cruises source crawler — SKELETON (not implemented in v1).
 *
 * See follow-up prompt for full implementation.
 *
 * Expected complexity:
 * - Princess.com serves cruise listings via a client-side React app.
 * - Will require Playwright for JS rendering (add to allowlist.ts when implemented).
 * - JSON-LD is present on sailing detail pages and extractable once rendered.
 *
 * When implementing:
 * 1. Add "www.princess.com" to ingestion/crawler/allowlist.ts
 * 2. Install Playwright: npm install playwright
 * 3. Implement fetch() using a headless browser via Playwright
 * 4. Reuse polite-fetcher rate-limit logic where possible
 */

import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

export const princessSource: SailingSource = {
  id: "princess",
  displayName: "Princess Cruises",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("Princess Cruises crawler not implemented in v1, see follow-up prompt");
    return;
  },

  normalize(_raw: RawSailing): CanonicalSailing | null {
    return null;
  },
};
