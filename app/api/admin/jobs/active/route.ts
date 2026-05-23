import { cookies } from "next/headers";
import { lucia } from "@/db/auth";
import { getActiveIngestionRuns } from "@/db/queries";

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

export async function GET(): Promise<Response> {
  if (!(await requireAuth())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeJobs = getActiveIngestionRuns();
  return Response.json(activeJobs);
}
