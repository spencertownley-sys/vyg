import { fetch as undiciFetch } from "undici";
import robotsParser from "robots-parser";
import pThrottle from "p-throttle";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  CRAWLER_USER_AGENT,
  DEFAULT_RATE_LIMIT_MS,
  MIN_RATE_LIMIT_MS,
  RETRY_DELAY_MS,
  CACHE_TTL_MS,
  CACHE_DIR,
  CRAWLER_LOG,
} from "./config";
import { isOriginAllowed } from "./allowlist";

export class CrawlerDisallowedError extends Error {
  constructor(url: string) {
    super(`Crawl disallowed by robots.txt: ${url}`);
    this.name = "CrawlerDisallowedError";
  }
}

export class CrawlerNotAllowedError extends Error {
  constructor(origin: string) {
    super(
      `Origin not in allowlist: ${origin}. Add it to ingestion/crawler/allowlist.ts after reviewing robots.txt and ToS.`
    );
    this.name = "CrawlerNotAllowedError";
  }
}

interface CacheEntry {
  body: string;
  headers: Record<string, string>;
  status: number;
  fetchedAt: number;
}

interface FetchResult {
  body: string;
  status: number;
  cached: boolean;
  bytes: number;
}

export class PoliteFetcher {
  private robotsCache = new Map<string, ReturnType<typeof robotsParser>>();
  private throttlers = new Map<string, (fn: () => Promise<FetchResult>) => Promise<FetchResult>>();
  private sourceId: string;
  private rateLimitMs: number;

  constructor(sourceId: string, rateLimitMs = DEFAULT_RATE_LIMIT_MS) {
    this.sourceId = sourceId;
    this.rateLimitMs = Math.max(rateLimitMs, MIN_RATE_LIMIT_MS);
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.mkdirSync(path.dirname(CRAWLER_LOG), { recursive: true });
  }

  private getOrigin(url: string): string {
    return new URL(url).hostname;
  }

  private getCacheKey(url: string): string {
    return crypto.createHash("sha256").update(url).digest("hex");
  }

  private getCachePath(url: string): string {
    return path.join(CACHE_DIR, `${this.getCacheKey(url)}.json`);
  }

  private readCache(url: string): CacheEntry | null {
    const cachePath = this.getCachePath(url);
    try {
      const raw = fs.readFileSync(cachePath, "utf-8");
      const entry = JSON.parse(raw) as CacheEntry;
      if (Date.now() - entry.fetchedAt < CACHE_TTL_MS) {
        return entry;
      }
    } catch {
      // cache miss or corrupt entry
    }
    return null;
  }

  private writeCache(url: string, entry: CacheEntry): void {
    try {
      fs.writeFileSync(this.getCachePath(url), JSON.stringify(entry), "utf-8");
    } catch {
      // non-fatal
    }
  }

  private appendLog(record: object): void {
    try {
      fs.appendFileSync(CRAWLER_LOG, JSON.stringify(record) + "\n", "utf-8");
    } catch {
      // non-fatal
    }
  }

  private getThrottler(origin: string): (fn: () => Promise<FetchResult>) => Promise<FetchResult> {
    if (!this.throttlers.has(origin)) {
      const throttle = pThrottle({
        limit: 1,
        interval: this.rateLimitMs,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      this.throttlers.set(origin, throttle((fn: () => Promise<FetchResult>) => fn()) as (fn: () => Promise<FetchResult>) => Promise<FetchResult>);
    }
    return this.throttlers.get(origin)!;
  }

  private async fetchRobots(origin: string): Promise<ReturnType<typeof robotsParser>> {
    if (this.robotsCache.has(origin)) {
      return this.robotsCache.get(origin)!;
    }
    const robotsUrl = `https://${origin}/robots.txt`;
    let robotsText = "";
    try {
      const res = await undiciFetch(robotsUrl, {
        headers: { "User-Agent": CRAWLER_USER_AGENT },
      });
      if (res.ok) {
        robotsText = await res.text();
      }
    } catch {
      // if robots.txt is unreachable, treat as no restrictions
    }
    const robots = robotsParser(robotsUrl, robotsText);
    this.robotsCache.set(origin, robots);
    return robots;
  }

  async fetch(url: string): Promise<FetchResult> {
    const origin = this.getOrigin(url);

    if (!isOriginAllowed(origin)) {
      throw new CrawlerNotAllowedError(origin);
    }

    const cached = this.readCache(url);
    if (cached) {
      this.appendLog({
        timestamp: new Date().toISOString(),
        source_id: this.sourceId,
        url,
        method: "GET",
        status: cached.status,
        bytes: cached.body.length,
        duration_ms: 0,
        cached: true,
      });
      return { body: cached.body, status: cached.status, cached: true, bytes: cached.body.length };
    }

    const robots = await this.fetchRobots(origin);
    if (!robots.isAllowed(url, CRAWLER_USER_AGENT)) {
      throw new CrawlerDisallowedError(url);
    }

    const throttle = this.getThrottler(origin);
    return throttle(async () => {
      return this.doFetch(url);
    });
  }

  private async doFetch(url: string, attempt = 1): Promise<FetchResult> {
    const start = Date.now();
    let status = 0;
    let body = "";

    try {
      const res = await undiciFetch(url, {
        headers: {
          "User-Agent": CRAWLER_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });

      status = res.status;
      body = await res.text();

      const duration = Date.now() - start;
      this.appendLog({
        timestamp: new Date().toISOString(),
        source_id: this.sourceId,
        url,
        method: "GET",
        status,
        bytes: body.length,
        duration_ms: duration,
        cached: false,
      });

      if (status >= 500 && attempt === 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        return this.doFetch(url, 2);
      }

      if (status < 400) {
        this.writeCache(url, {
          body,
          headers: {},
          status,
          fetchedAt: Date.now(),
        });
      }

      return { body, status, cached: false, bytes: body.length };
    } catch (err) {
      const duration = Date.now() - start;
      this.appendLog({
        timestamp: new Date().toISOString(),
        source_id: this.sourceId,
        url,
        method: "GET",
        status: 0,
        bytes: 0,
        duration_ms: duration,
        cached: false,
        error: String(err),
      });
      throw err;
    }
  }
}
