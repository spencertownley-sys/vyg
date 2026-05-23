export const CRAWLER_USER_AGENT = `VYG-Crawler/1.0 (+${process.env.CRAWLER_CONTACT_EMAIL ?? "abuse@vyg.example"})`;

export const CRAWLER_CONTACT_EMAIL = process.env.CRAWLER_CONTACT_EMAIL ?? "abuse@vyg.example";

export const DEFAULT_CONTACT_EMAIL = "abuse@vyg.example";

/** Minimum delay between requests per origin in milliseconds. Never go below 1000. */
export const MIN_RATE_LIMIT_MS = 1000;

/** Default delay between requests per origin in milliseconds. */
export const DEFAULT_RATE_LIMIT_MS = 2000;

/** Retry delay on 5xx in milliseconds. */
export const RETRY_DELAY_MS = 5000;

/** Disk cache TTL in milliseconds (24 hours). */
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export const CACHE_DIR = process.env.CACHE_DIR ?? "./data/crawler-cache";
export const CRAWLER_LOG = process.env.CRAWLER_LOG ?? "./data/crawler.log";
