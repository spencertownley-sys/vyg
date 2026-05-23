import { cookies } from "next/headers";
import { lucia } from "@/db/auth";
import { db } from "@/db/client";
import { ingestionRuns } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<Response> {
  if (!(await requireAuth())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const run = db.select().from(ingestionRuns).where(eq(ingestionRuns.id, jobId)).get();

  if (!run) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  return Response.json(run);
}
