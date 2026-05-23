import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "@/db/auth";
import { db } from "@/db/client";
import { adminSessions, adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Settings — Admin",
};

async function logoutAction(): Promise<never> {
  "use server";
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
    const blankCookie = lucia.createBlankSessionCookie();
    cookieStore.set(blankCookie.name, blankCookie.value, blankCookie.attributes);
  }
  redirect("/admin/login");
}

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  let userEmail = "—";

  if (sessionId) {
    try {
      const { user } = await lucia.validateSession(sessionId);
      userEmail = user?.email ?? "—";
    } catch {
      // ignore
    }
  }

  const sessionCount = sessionId
    ? db.select().from(adminSessions).all().length
    : 0;

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 32 }}>Settings</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 560 }}>
        {/* Account */}
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "var(--surface)",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Account</h2>
          </div>
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Signed in as</div>
              <div style={{ fontSize: 14 }}>{userEmail}</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Active sessions</div>
              <div style={{ fontSize: 14 }}>{sessionCount}</div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                style={{
                  height: 40,
                  padding: "0 20px",
                  fontSize: 14,
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  backgroundColor: "var(--surface)",
                  color: "var(--ink)",
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </section>

        {/* Env gates */}
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "var(--surface)",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Crawler env gates</h2>
          </div>
          <div style={{ padding: "20px" }}>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
              Real crawls are disabled until both env vars are set on the server.
            </p>
            {[
              { key: "CRAWLER_ENABLED", value: process.env.CRAWLER_ENABLED },
              { key: "CRAWLER_LEGAL_REVIEW_COMPLETE", value: process.env.CRAWLER_LEGAL_REVIEW_COMPLETE },
              { key: "CRAWLER_CONTACT_EMAIL", value: process.env.CRAWLER_CONTACT_EMAIL },
            ].map(({ key, value: val }) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <code style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: "var(--ink)" }}>
                  {key}
                </code>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "var(--font-jetbrains-mono)",
                    color: val === "true" ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {val ?? "not set"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Danger */}
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "var(--surface)",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>CLI commands</h2>
          </div>
          <div style={{ padding: "20px" }}>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>
              Run these on the server to manage data.
            </p>
            {[
              "npm run seed          — wipe and rebuild DB with seed data",
              "npm run create-admin  — create or replace admin user",
              "npm run ingest:status — print last 10 ingestion runs",
              "npm run ingest -- --source=carnival  — run Carnival crawl",
            ].map((cmd) => (
              <div
                key={cmd}
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 12,
                  color: "var(--muted)",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {cmd}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
