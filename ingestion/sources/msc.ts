/**
 * MSC Cruises source crawler — SKELETON (not implemented in v1).
 *
 * See follow-up prompt for full implementation.
 *
 * Expected complexity:
 * - MSC's booking site is heavily JavaScript-rendered (Angular SPA).
 * - Requires Playwright; static scraping will not work.
 * - No JSON-LD observed; data extraction will likely require parsing
 *   API responses intercepted via Playwright network events.
 * - Multi-region site structure (US site: www.msccruisesusa.com) — verify
 *   which origin to target for English-language US listings.
 *
 * When implementing:
 * 1. Determine correct origin and add to ingestion/crawler/allowlist.ts
 * 2. Install Playwright: npm install playwright
 * 3. Use page.route() to intercept XHR/fetch calls
 */

import type { SailingSource, RawSailing, CanonicalSailing, ProgressReporter } from "./types";

export const mscSource: SailingSource = {
  id: "msc",
  displayName: "MSC Cruises",

  async *fetch(progress: ProgressReporter): AsyncIterable<RawSailing> {
    progress.log("MSC Cruises crawler not implemented in v1, see follow-up prompt");
    return;
  },

  normalize(_raw: RawSailing): CanonicalSailing | null {
    return null;
  },
};
