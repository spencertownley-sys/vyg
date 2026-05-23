/**
 * Hardcoded allowlist of origins the crawler may contact.
 * Adding a new origin requires an explicit code change here — that friction is intentional.
 * Review robots.txt and terms of service for each new origin before adding it.
 *
 * To add a new cruise line crawler:
 * 1. Add its origin here
 * 2. Implement ingestion/sources/<id>.ts
 * 3. Register the source in worker/ingest.ts
 * 4. Add a seed row to scripts/seed.ts
 */
export const ALLOWED_ORIGINS: ReadonlySet<string> = new Set([
  "www.carnival.com",
  // "www.princess.com",        // add when Princess crawler is implemented
  // "www.ncl.com",              // add when Norwegian crawler is implemented
  // "www.msccruises.com",       // add when MSC crawler is implemented; needs Playwright
  // "www.hollandamerica.com",   // add when Holland America crawler is implemented
]);

export function isOriginAllowed(origin: string): boolean {
  return ALLOWED_ORIGINS.has(origin);
}
