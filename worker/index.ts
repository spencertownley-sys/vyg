/**
 * VYG background worker — polls the SQLite job table every 2 seconds.
 * Start with: npm run worker
 *
 * This is a standalone Node process separate from Next.js.
 * It connects to the same SQLite DB as the web app.
 *
 * For Railway deployment, declare this in Procfile:
 *   worker: npm run worker
 */

import { db, sqlite, initializeSchema } from "../db/client";
import { ingestionRuns } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { runIngestion } from "./ingest";
import { CRAWLER_CONTACT_EMAIL, DEFAULT_CONTACT_EMAIL } from "../ingestion/crawler/config";
import fs from "fs";
import path from "path";

const WORKER_LOG = process.env.WORKER_LOG ?? "./data/worker.log";
const POLL_INTERVAL_MS = 2000;

fs.mkdirSync(path.dirname(WORKER_LOG), { recursive: true });

function log(message: string): void {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  try {
    fs.appendFileSync(WORKER_LOG, line + "\n", "utf-8");
  } catch {
    // non-fatal
  }
}

function startup(): void {
  log("VYG worker starting...");
  initializeSchema();

  if (CRAWLER_CONTACT_EMAIL === DEFAULT_CONTACT_EMAIL) {
    log(
      "WARNING: CRAWLER_CONTACT_EMAIL is still set to the default 'abuse@vyg.example'. " +
        "Set CRAWLER_CONTACT_EMAIL env var to your real contact address before running real crawls."
    );
  }

  log(`Worker ready. Polling every ${POLL_INTERVAL_MS}ms for pending jobs.`);
}

async function processNextJob(): Promise<boolean> {
  const job = db
    .select()
    .from(ingestionRuns)
    .where(eq(ingestionRuns.status, "pending"))
    .orderBy(ingestionRuns.startedAt)
    .limit(1)
    .get();

  if (!job) return false;

  log(`Picked up job ${job.id} for line ${job.lineId}`);

  try {
    await runIngestion(job.id, job.lineId);
    const updated = db.select().from(ingestionRuns).where(eq(ingestionRuns.id, job.id)).get();
    log(`Job ${job.id} finished with status: ${updated?.status ?? "unknown"}`);
  } catch (err) {
    log(`Job ${job.id} threw unhandled error: ${String(err)}`);
    db.update(ingestionRuns)
      .set({
        status: "failed",
        completedAt: new Date().toISOString(),
        errorMessage: `Unhandled: ${String(err)}`,
      })
      .where(eq(ingestionRuns.id, job.id))
      .run();
  }

  return true;
}

let shuttingDown = false;
let currentJobRunning = false;

async function mainLoop(): Promise<void> {
  while (!shuttingDown) {
    currentJobRunning = true;
    await processNextJob();
    currentJobRunning = false;

    if (!shuttingDown) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }
  log("Worker shut down cleanly.");
}

function handleShutdown(signal: string): void {
  log(`Received ${signal}. Finishing current job then exiting...`);
  shuttingDown = true;

  // If no job is running, exit immediately
  if (!currentJobRunning) {
    process.exit(0);
  }
  // Otherwise wait for the current job to finish (mainLoop will exit)
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

startup();
mainLoop().catch((err) => {
  log(`Fatal worker error: ${String(err)}`);
  process.exit(1);
});
