/**
 * Lightweight job-queue helpers used by both Next.js API routes and the worker.
 * Kept separate from worker/ingest.ts so Next.js routes don't import the
 * full crawler stack (fs, yaml, cheerio, etc.).
 */
import { v4 as uuidv4 } from "uuid";
import { db } from "./client";
import { ingestionRuns } from "./schema";

export function enqueueJob(
  lineId: string,
  triggeredBy: "manual" | "scheduled" = "manual",
): string {
  const jobId = uuidv4();
  db.insert(ingestionRuns)
    .values({
      id: jobId,
      lineId,
      status: "pending",
      triggeredBy,
      progressJson: "[]",
    })
    .run();
  return jobId;
}
