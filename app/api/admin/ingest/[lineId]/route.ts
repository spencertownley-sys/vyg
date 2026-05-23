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

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ lineId: string }> }
): Promise<Response> {
  if (!(await requireAuth())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lineId } = await params;

  const line = db.select().from(cruiseLines).where(eq(cruiseLines.id, lineId)).get();
  if (!line) {
    return Response.json({ error: `Cruise line not found: ${lineId}` }, { status: 404 });
  }

  if (!line.enabled) {
    return Response.json(
      { error: `Cruise line ${lineId} is not enabled. Enable it in the database first.` },
      { status: 422 }
    );
  }

  const jobId = enqueueJob(lineId, "manual");
  return Response.json({ jobId }, { status: 202 });
}
