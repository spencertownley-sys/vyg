import { cookies } from "next/headers";
import { lucia } from "@/db/auth";
import { db, initializeSchema } from "@/db/client";
import { cruiseLines } from "@/db/schema";
import { eq } from "drizzle-orm";
import { enqueueJob } from "@/db/jobs";

initializeSchema();

async function requireAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return false;
  try {
    const { session } = await lucia.validateSession(sessionId);
    return !!session;
  } catch {
    return false;
  }
}

export async function POST(): Promise<Response> {
  if (!(await requireAuth())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enabledLines = db
    .select()
    .from(cruiseLines)
    .where(eq(cruiseLines.enabled, true))
    .all();

  if (enabledLines.length === 0) {
    return Response.json({ error: "No enabled cruise lines found." }, { status: 422 });
  }

  const jobs = enabledLines.map((line) => ({
    lineId: line.id,
    jobId: enqueueJob(line.id, "manual"),
  }));

  return Response.json({ jobs }, { status: 202 });
}
