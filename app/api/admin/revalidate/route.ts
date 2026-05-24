import { cookies } from "next/headers";
import { lucia } from "@/db/auth";
import { revalidatePath } from "next/cache";

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

/**
 * POST /api/admin/revalidate
 * Purges the Next.js route cache for the destination and port photo pages,
 * forcing fresh Wikipedia thumbnail fetches on the next request.
 */
export async function POST(): Promise<Response> {
  if (!(await requireAuth())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/cruises-from", "page");
  revalidatePath("/cruises-to", "page");

  return Response.json({
    ok: true,
    revalidated: ["/cruises-from", "/cruises-to"],
    message: "Photo pages will re-fetch Wikipedia thumbnails on next visit.",
  });
}
