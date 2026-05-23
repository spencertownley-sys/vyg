import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "@/db/auth";
import { initializeSchema } from "@/db/client";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

// Ensure schema exists when admin loads
initializeSchema();

async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return null;
  try {
    const { session } = await lucia.validateSession(sessionId);
    return session;
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--surface)",
          flexShrink: 0,
        }}
      >
        <div
          className="container-max"
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            gap: 32,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Wordmark href="/admin" />
            <span
              style={{
                fontSize: 11,
                color: "var(--subtle)",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              admin
            </span>
          </div>
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link
              href="/admin"
              style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none", minHeight: 44, display: "flex", alignItems: "center" }}
            >
              Sources
            </Link>
            <Link
              href="/admin/quarantine"
              style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none", minHeight: 44, display: "flex", alignItems: "center" }}
            >
              Quarantine
            </Link>
            <Link
              href="/admin/settings"
              style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none", minHeight: 44, display: "flex", alignItems: "center" }}
            >
              Settings
            </Link>
            <Link
              href="/"
              style={{ fontSize: 13, color: "var(--subtle)", textDecoration: "none", minHeight: 44, display: "flex", alignItems: "center" }}
            >
              ← Public site
            </Link>
          </nav>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
