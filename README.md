# vyg

Independent cruise discovery. Search sailings across multiple cruise lines by destination, port, ship, duration, and more.

> **Legal notice:** VYG crawls publicly available cruise schedule data from cruise line websites. Before enabling real crawls, review each target site's robots.txt, terms of service, and consult legal counsel. The crawler is disabled by default — see [Enabling real crawls](#enabling-real-crawls).

---

## Local setup

**Requirements:** Node.js 20+, npm 9+

```bash
cd vyg
cp .env.example .env
npm install
npm run seed         # creates data/vyg.db with realistic sample data
npm run create-admin # interactive prompt: enter email + password
```

Then open two terminals:

```bash
# Terminal 1 — web server
npm run dev

# Terminal 2 — background worker (must be running for Refresh to work)
npm run worker
```

Visit http://localhost:3000 for the public site.
Visit http://localhost:3000/admin to log in as the admin user you created.

---

## CLI commands

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server (port 3000) |
| `npm run worker` | Background job processor |
| `npm run seed` | Wipe DB and regenerate seed data |
| `npm run create-admin` | Create or replace the admin user |
| `npm run ingest -- --source=carnival` | Run a Carnival crawl from CLI |
| `npm run ingest:status` | Print last 10 ingestion runs |
| `npm run build` | Production build |
| `npm start` | Production server |

---

## How the refresh flow works

1. You click **Refresh** on a source in `/admin`
2. The Next.js API route (`POST /api/admin/ingest/[lineId]`) writes a row to `ingestion_runs` with `status='pending'` and returns a `{ jobId }`
3. The **worker** (`npm run worker`) polls the DB every 2 seconds, picks up pending jobs, and calls `runIngestion(jobId, lineId)`
4. The admin UI polls `/api/admin/jobs/[jobId]` every 2 seconds and updates the status display
5. On completion, `status` is set to `completed`, `failed`, or `aborted`

**Why a separate worker?** Crawls can take minutes to hours. Next.js API routes have timeout limits. The worker is a plain Node process with no timeout.

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | No | `./data/vyg.db` | Path to SQLite database |
| `ADMIN_SESSION_SECRET` | Production | — | Lucia session secret (generate with `openssl rand -hex 32`) |
| `CRAWLER_ENABLED` | No | `false` | Must be `true` to allow real fetches |
| `CRAWLER_LEGAL_REVIEW_COMPLETE` | No | `false` | Must be `true` to allow real fetches |
| `CRAWLER_CONTACT_EMAIL` | No | `abuse@vyg.example` | Included in crawler User-Agent |
| `NEXT_PUBLIC_BASE_URL` | No | `http://localhost:3000` | Used for metadata.metadataBase |

---

## Enabling real crawls

The Carnival crawler is **disabled by default**. Both env gates must be set:

```bash
# .env
CRAWLER_ENABLED=true
CRAWLER_LEGAL_REVIEW_COMPLETE=true
CRAWLER_CONTACT_EMAIL=your-real-email@example.com
```

Before setting these:
1. Read https://www.carnival.com/robots.txt — verify crawling is permitted
2. Review Carnival's Terms of Use regarding automated access
3. Obtain sign-off from your legal team
4. Set `CRAWLER_CONTACT_EMAIL` to a real monitored address

Without both gates, the crawler logs `"Crawler disabled — set CRAWLER_ENABLED and CRAWLER_LEGAL_REVIEW_COMPLETE to enable real fetches"` and exits cleanly. This is the correct default behavior.

---

## Adding a new cruise line crawler

1. **Add the origin to the allowlist** (`ingestion/crawler/allowlist.ts`):
   ```ts
   export const ALLOWED_ORIGINS: ReadonlySet<string> = new Set([
     "www.carnival.com",
     "www.princess.com",  // ← add this
   ]);
   ```

2. **Create the source file** (`ingestion/sources/princess.ts`). Implement `SailingSource`:
   ```ts
   export const princessSource: SailingSource = {
     id: "princess",
     displayName: "Princess Cruises",
     async *fetch(progress) { /* yield RawSailing objects */ },
     normalize(raw) { /* return CanonicalSailing | null */ },
   };
   ```
   Use `PoliteFetcher` for all HTTP — it enforces robots.txt, rate-limiting, and logging automatically. Never fetch directly.

3. **Register the source** in `worker/ingest.ts`:
   ```ts
   import { princessSource } from "../ingestion/sources/princess";
   const SOURCES: Record<string, SailingSource> = {
     carnival: carnivalSource,
     princess: princessSource,  // ← add this
   };
   ```

4. **Add a DB row** for the line in `scripts/seed.ts` and re-run `npm run seed`. Or insert directly:
   ```sql
   INSERT INTO cruise_lines VALUES ('princess', 'Princess Cruises', 'https://www.princess.com', 'https://www.princess.com/cruise/detail/{id}', NULL, NULL, 'princess', 1);
   ```

5. **Enable the crawler** via env gates (see above).

### Does the new line need Playwright?

- **Static + JSON-LD (like Carnival):** Use `PoliteFetcher` + cheerio. No Playwright.
- **Client-rendered SPA (Princess, Norwegian, MSC):** Install Playwright (`npm install playwright`), use `page.goto()` + `page.waitForSelector()`. Still wrap with `PoliteFetcher`'s rate-limiting logic.

The skeleton files in `ingestion/sources/` include notes on which approach each line needs.

---

## Railway deployment

The `Procfile` declares both processes:

```
web: npm start
worker: npm run worker
```

In Railway:
1. Create a new project from this repo
2. Railway auto-detects the Procfile and starts both `web` and `worker` processes
3. Set the env vars in Railway's Variables panel (see table above)
4. The SQLite DB lives at `./data/vyg.db` — Railway provides a persistent volume; mount it at `/app/data`

**Important:** `web` and `worker` must share the same filesystem for SQLite to work. On Railway, both processes run on the same VM when using the Procfile approach, so the shared DB file works out of the box.

---

## Manual curation overlay

Create `data/overrides.yaml` (gitignored) to override specific records after ingestion:

```yaml
sailings:
  - id: "CCL-MIA-2026-10-31-CARN"
    sample_fares:
      Suite: 8499
    notes: "Manual override — feed price was stale"

ships:
  - id: "carnival-vista"
    photo_url: "/images/ships/carnival-vista.jpg"
```

The worker applies overrides after each successful ingestion run. Overrides are logged to stdout.

---

## Project structure

```
app/
  (public)/          Public route group — all public pages with SiteHeader/SiteFooter
  admin/             Admin pages — auth-gated, own layout
  api/admin/         REST API for the admin panel
components/
  wordmark.tsx       Single source of truth for the "vyg" brand name
  admin/             Admin-specific components (sources-table, active-jobs-panel, etc.)
db/
  schema.ts          Drizzle schema — all 8 tables
  client.ts          SQLite connection + initializeSchema()
  queries.ts         All DB query functions
  auth.ts            Lucia auth setup
ingestion/
  crawler/
    polite-fetcher.ts  All crawlers must use this — enforces robots.txt, rate-limit, allowlist
    allowlist.ts       Hardcoded origin allowlist — add new origins here explicitly
    config.ts          Rate limits, User-Agent, paths
  sources/
    types.ts           SailingSource interface
    carnival.ts        Fully implemented crawler
    *.ts               Skeletons for future lines
  normalize.ts       RawSailing → CanonicalSailing
  schemas.ts         Zod validation schema
worker/
  index.ts           Polling loop, graceful shutdown
  ingest.ts          Job runner — transactions, quarantine, overrides
scripts/
  seed.ts            Wipe and rebuild DB
  create-admin.ts    Create admin user
  ingest-cli.ts      CLI runner for crawls
data/                Runtime data — gitignored except .gitkeep
```
