import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { db, sqlite } from "../db/client";
import { ingestionRuns, sailings, ships, ports, cruiseLines, itineraryStops } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { carnivalSource } from "../ingestion/sources/carnival";
import { princessSource } from "../ingestion/sources/princess";
import { norwegianSource } from "../ingestion/sources/norwegian";
import { mscSource } from "../ingestion/sources/msc";
import { hollandAmericaSource } from "../ingestion/sources/holland-america";
import { royalCaribbeanSource } from "../ingestion/sources/royal-caribbean";
import { vikingSource } from "../ingestion/sources/viking";
import { virginVoyagesSource } from "../ingestion/sources/virgin-voyages";
import { disneySource } from "../ingestion/sources/disney";
import { celebritySource } from "../ingestion/sources/celebrity";
import { normalizeRawSailing } from "../ingestion/normalize";
import { canonicalSailingSchema } from "../ingestion/schemas";
import type { SailingSource, ProgressReporter } from "../ingestion/sources/types";

const QUARANTINE_PATH = process.env.QUARANTINE_PATH ?? "./data/quarantine.json";
const OVERRIDES_PATH = process.env.OVERRIDES_PATH ?? "./data/overrides.yaml";

const SOURCES: Record<string, SailingSource> = {
  carnival: carnivalSource,
  princess: princessSource,
  norwegian: norwegianSource,
  msc: mscSource,
  "holland-america": hollandAmericaSource,
  "royal-caribbean": royalCaribbeanSource,
  viking: vikingSource,
  "virgin-voyages": virginVoyagesSource,
  disney: disneySource,
  celebrity: celebritySource,
};

interface Overrides {
  sailings?: Array<{
    id: string;
    sample_fares?: Record<string, number>;
    notes?: string;
  }>;
  ships?: Array<{
    id: string;
    photo_url?: string;
  }>;
}

function loadOverrides(): Overrides {
  try {
    const raw = fs.readFileSync(OVERRIDES_PATH, "utf-8");
    return (yaml.load(raw) as Overrides) ?? {};
  } catch {
    return {};
  }
}

function appendQuarantine(record: unknown): void {
  let existing: unknown[] = [];
  try {
    const raw = fs.readFileSync(QUARANTINE_PATH, "utf-8");
    existing = JSON.parse(raw) as unknown[];
  } catch {
    // file may not exist yet
  }
  existing.push(record);
  fs.mkdirSync(path.dirname(QUARANTINE_PATH), { recursive: true });
  fs.writeFileSync(QUARANTINE_PATH, JSON.stringify(existing, null, 2), "utf-8");
}

function applyOverrides(overrides: Overrides): void {
  if (!overrides.sailings) return;
  for (const o of overrides.sailings) {
    const existing = db.select().from(sailings).where(eq(sailings.id, o.id)).get();
    if (!existing) continue;
    if (o.sample_fares) {
      db.update(sailings)
        .set({ sampleFares: JSON.stringify(o.sample_fares) })
        .where(eq(sailings.id, o.id))
        .run();
      console.log(`[overrides] Applied fare override to sailing ${o.id}: ${o.notes ?? ""}`);
    }
  }
  if (overrides.ships) {
    for (const o of overrides.ships) {
      if (o.photo_url) {
        db.update(ships)
          .set({ photoUrl: o.photo_url })
          .where(eq(ships.id, o.id))
          .run();
        console.log(`[overrides] Applied photo override to ship ${o.id}`);
      }
    }
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getOrCreateShip(shipName: string, lineId: string): string {
  const shipId = slugify(shipName);
  const existing = db.select().from(ships).where(eq(ships.id, shipId)).get();
  if (!existing) {
    db.insert(ships).values({
      id: shipId,
      lineId,
      name: shipName,
    }).run();
  }
  return shipId;
}

function getOrCreatePort(portName: string): string {
  const portId = slugify(portName);
  const existing = db.select().from(ports).where(eq(ports.id, portId)).get();
  if (!existing) {
    db.insert(ports).values({
      id: portId,
      name: portName,
      city: portName,
      country: "Unknown",
      region: "Unknown",
    }).run();
  }
  return portId;
}

export async function runIngestion(jobId: string, lineId: string): Promise<void> {
  const source = SOURCES[lineId];
  if (!source) {
    db.update(ingestionRuns)
      .set({ status: "failed", errorMessage: `No source registered for lineId: ${lineId}` })
      .where(eq(ingestionRuns.id, jobId))
      .run();
    return;
  }

  const lineRow = db.select().from(cruiseLines).where(eq(cruiseLines.id, lineId)).get();
  if (!lineRow) {
    db.update(ingestionRuns)
      .set({ status: "failed", errorMessage: `Cruise line not found: ${lineId}` })
      .where(eq(ingestionRuns.id, jobId))
      .run();
    return;
  }

  const progressLog: string[] = [];
  let recordsFetched = 0;
  let recordsUpserted = 0;
  let recordsQuarantined = 0;

  function updateProgress(msg?: string) {
    db.update(ingestionRuns)
      .set({
        recordsFetched,
        recordsUpserted,
        recordsQuarantined,
        progressJson: JSON.stringify(progressLog.slice(-100)),
      })
      .where(eq(ingestionRuns.id, jobId))
      .run();
  }

  const reporter: ProgressReporter = {
    log(message: string) {
      const line = `[${new Date().toISOString()}] ${message}`;
      console.log(`[${lineId}] ${message}`);
      progressLog.push(line);
      updateProgress();
    },
    update({ fetched, total }: { fetched: number; total?: number }) {
      recordsFetched = fetched;
      const msg = total ? `Fetched ${fetched}/${total}` : `Fetched ${fetched}`;
      progressLog.push(msg);
      updateProgress();
    },
  };

  db.update(ingestionRuns)
    .set({ status: "running", startedAt: new Date().toISOString() })
    .where(eq(ingestionRuns.id, jobId))
    .run();

  reporter.log(`Starting ingestion for ${lineRow.name}`);

  // Get previous successful run count for abort threshold
  const prevRun = db
    .select()
    .from(ingestionRuns)
    .where(and(eq(ingestionRuns.lineId, lineId), eq(ingestionRuns.status, "completed")))
    .orderBy(ingestionRuns.completedAt)
    .get();
  const prevCount = prevRun?.recordsUpserted ?? 0;

  const insertedIds: string[] = [];

  // Begin transaction for all upserts
  const txn = sqlite.transaction(() => {
    // We'll collect records during fetch and do all inserts here
    return insertedIds;
  });

  // Collect all records first, then do atomic transaction
  const canonicalRecords: Array<{
    sailId: string;
    shipId: string;
    depPortId: string;
    arrPortId: string;
    portsOfCallIds: string[];
    canonical: ReturnType<typeof canonicalSailingSchema.parse>;
  }> = [];

  try {
    for await (const raw of source.fetch(reporter)) {
      const canonical = source.normalize(raw) ?? normalizeRawSailing(raw);
      if (!canonical) continue;

      const validated = canonicalSailingSchema.safeParse(canonical);
      if (!validated.success) {
        appendQuarantine({
          timestamp: new Date().toISOString(),
          jobId,
          lineId,
          raw,
          canonical,
          reason: validated.error.message,
        });
        recordsQuarantined++;
        continue;
      }

      const shipId = getOrCreateShip(validated.data.ship_name, lineId);
      const depPortId = getOrCreatePort(validated.data.departure_port);
      const arrPortId = getOrCreatePort(validated.data.arrival_port);
      const portsOfCallIds = validated.data.ports_of_call.map((p) => getOrCreatePort(p));

      canonicalRecords.push({
        sailId: validated.data.sail_id,
        shipId,
        depPortId,
        arrPortId,
        portsOfCallIds,
        canonical: validated.data,
      });

      if (canonicalRecords.length % 10 === 0) {
        reporter.update({ fetched: recordsFetched, total: undefined });
      }
    }
  } catch (err) {
    db.update(ingestionRuns)
      .set({
        status: "failed",
        completedAt: new Date().toISOString(),
        errorMessage: String(err),
        recordsFetched,
        recordsUpserted,
        recordsQuarantined,
        progressJson: JSON.stringify(progressLog.slice(-100)),
      })
      .where(eq(ingestionRuns.id, jobId))
      .run();
    reporter.log(`Ingestion failed: ${String(err)}`);
    return;
  }

  // Abort check: if we got < 80% of previous successful count, don't commit
  if (prevCount > 0 && canonicalRecords.length < prevCount * 0.8) {
    db.update(ingestionRuns)
      .set({
        status: "aborted",
        completedAt: new Date().toISOString(),
        errorMessage: `Abort: fetched ${canonicalRecords.length} records but previous run had ${prevCount} (< 80% threshold)`,
        recordsFetched,
        recordsUpserted: 0,
        recordsQuarantined,
        progressJson: JSON.stringify(progressLog),
      })
      .where(eq(ingestionRuns.id, jobId))
      .run();
    reporter.log(`Aborted — fetched ${canonicalRecords.length}, previous was ${prevCount}`);
    return;
  }

  // Commit transaction
  const insertAll = sqlite.transaction(() => {
    for (const record of canonicalRecords) {
      const { sailId, shipId, depPortId, arrPortId, portsOfCallIds, canonical } = record;
      const bookingUrl = canonical.booking_url ??
        lineRow.bookingUrlTemplate.replace("{id}", sailId);

      // Upsert sailing
      sqlite.prepare(`
        INSERT INTO sailings (
          id, ship_id, departure_port_id, arrival_port_id,
          depart_date, arrive_date, nights, destination,
          charter_flag, charter_name, booking_url, sample_fares,
          source_run_id, source_url, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          ship_id=excluded.ship_id,
          departure_port_id=excluded.departure_port_id,
          arrival_port_id=excluded.arrival_port_id,
          depart_date=excluded.depart_date,
          arrive_date=excluded.arrive_date,
          nights=excluded.nights,
          destination=excluded.destination,
          charter_flag=excluded.charter_flag,
          charter_name=excluded.charter_name,
          booking_url=excluded.booking_url,
          sample_fares=excluded.sample_fares,
          source_run_id=excluded.source_run_id,
          source_url=excluded.source_url,
          last_updated=datetime('now')
      `).run(
        sailId, shipId, depPortId, arrPortId,
        canonical.departure_dt, canonical.arrival_dt,
        canonical.sail_duration, canonical.destination,
        canonical.charter_flag ? 1 : 0,
        canonical.charter_name ?? null,
        bookingUrl,
        JSON.stringify(canonical.fares ?? {}),
        jobId,
        canonical.source_url ?? null,
      );

      // Insert itinerary stops
      sqlite.prepare(`DELETE FROM itinerary_stops WHERE sailing_id = ?`).run(sailId);
      portsOfCallIds.forEach((portId, i) => {
        sqlite.prepare(`
          INSERT INTO itinerary_stops (sailing_id, day_number, port_id)
          VALUES (?, ?, ?)
        `).run(sailId, i + 1, portId);
      });

      // Update FTS
      const ship = db.select().from(ships).where(eq(ships.id, shipId)).get();
      const depPort = db.select().from(ports).where(eq(ports.id, depPortId)).get();
      const arrPort = db.select().from(ports).where(eq(ports.id, arrPortId)).get();
      sqlite.prepare(`
        INSERT INTO sailings_fts (sailing_id, ship_name, line_name, departure_port, arrival_port, destination)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        sailId,
        ship?.name ?? canonical.ship_name,
        lineRow.name,
        depPort?.name ?? canonical.departure_port,
        arrPort?.name ?? canonical.arrival_port,
        canonical.destination,
      );

      insertedIds.push(sailId);
    }
    return insertedIds.length;
  });

  try {
    recordsUpserted = insertAll();
    reporter.log(`Committed ${recordsUpserted} sailings`);
  } catch (err) {
    db.update(ingestionRuns)
      .set({
        status: "failed",
        completedAt: new Date().toISOString(),
        errorMessage: `Transaction failed: ${String(err)}`,
        recordsFetched,
        recordsUpserted: 0,
        recordsQuarantined,
        progressJson: JSON.stringify(progressLog),
      })
      .where(eq(ingestionRuns.id, jobId))
      .run();
    return;
  }

  // Apply manual overrides
  const overrides = loadOverrides();
  applyOverrides(overrides);

  db.update(ingestionRuns)
    .set({
      status: "completed",
      completedAt: new Date().toISOString(),
      recordsFetched,
      recordsUpserted,
      recordsQuarantined,
      progressJson: JSON.stringify(progressLog),
    })
    .where(eq(ingestionRuns.id, jobId))
    .run();

  reporter.log(`Ingestion complete: ${recordsUpserted} upserted, ${recordsQuarantined} quarantined`);
}

export { enqueueJob } from "../db/jobs";
