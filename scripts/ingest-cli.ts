/**
 * CLI ingestion runner — same code path as the admin Refresh button.
 * Usage:
 *   npm run ingest -- --source=carnival
 *   npm run ingest:status
 */

import { initializeSchema } from "../db/client";
import { db } from "../db/client";
import { ingestionRuns, cruiseLines } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { runIngestion, enqueueJob } from "../worker/ingest";

initializeSchema();

const args = process.argv.slice(2);

if (args[0] === "--status" || args.includes("--status")) {
  // Print last 10 runs
  const runs = db
    .select({ run: ingestionRuns, line: cruiseLines })
    .from(ingestionRuns)
    .innerJoin(cruiseLines, eq(ingestionRuns.lineId, cruiseLines.id))
    .orderBy(desc(ingestionRuns.startedAt))
    .limit(10)
    .all();

  if (runs.length === 0) {
    console.log("No ingestion runs found.");
    process.exit(0);
  }

  console.log("\nLast 10 ingestion runs:\n");
  for (const { run, line } of runs) {
    const status = run.status.toUpperCase().padEnd(10);
    const lineName = line.name.padEnd(30);
    const started = run.startedAt?.slice(0, 16) ?? "not started   ";
    const upserted = String(run.recordsUpserted).padStart(6);
    const err = run.errorMessage ? ` — ${run.errorMessage.slice(0, 60)}` : "";
    console.log(`  ${status} ${lineName} ${started}  ${upserted} upserted${err}`);
  }
  console.log();
  process.exit(0);
}

const sourceArg = args.find((a) => a.startsWith("--source="));
if (!sourceArg) {
  console.error("Usage: npm run ingest -- --source=<lineId>");
  console.error("       npm run ingest:status");
  console.error("\nAvailable sources: carnival, princess, norwegian, msc, holland-america");
  process.exit(1);
}

const lineId = sourceArg.replace("--source=", "");
const lineRow = db.select().from(cruiseLines).where(eq(cruiseLines.id, lineId)).get();
if (!lineRow) {
  console.error(`Unknown line: ${lineId}`);
  process.exit(1);
}

const jobId = enqueueJob(lineId, "manual");
console.log(`Queued job ${jobId} for ${lineRow.name}. Running now...`);

runIngestion(jobId, lineId)
  .then(() => {
    const run = db.select().from(ingestionRuns).where(eq(ingestionRuns.id, jobId)).get();
    console.log(`\nJob complete. Status: ${run?.status}`);
    console.log(`  Records fetched:     ${run?.recordsFetched}`);
    console.log(`  Records upserted:    ${run?.recordsUpserted}`);
    console.log(`  Records quarantined: ${run?.recordsQuarantined}`);
    if (run?.errorMessage) console.log(`  Error: ${run.errorMessage}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
