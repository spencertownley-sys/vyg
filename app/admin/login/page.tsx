import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "@/db/auth";
import { db } from "@/db/client";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as argon2 from "argon2";
import { Wordmark } from "@/components/wordmark";

export const metadata: Metadata = {
  title: "Admin Login — vyg",
  description: "Log in to the vyg admin panel.",
};

async function loginAction(formData: FormData): Promise<void> {
  "use server";

  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    redirect("/admin/login?error=required");
  }

  const user = db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .get();

  if (!user) {
    redirect("/admin/login?error=invalid");
  }

  let valid = false;
  try {
    valid = await argon2.verify(user.passwordHash, password);
  } catch {
    redirect("/admin/login?error=invalid");
  }

  if (!valid) {
    redirect("/admin/login?error=invalid");
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  redirect("/admin");
}

const ERROR_MESSAGES: Record<string, string> = {
  required: "Email and password are required.",
  invalid: "Invalid email or password.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const errorMsg = sp.error ? (ERROR_MESSAGES[sp.error] ?? "An error occurred.") : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg)",
        padding: "32px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <Wordmark />
        </div>

        <form
          action={loginAction}
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h1
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Admin sign in
          </h1>

          {errorMsg && (
            <div
              style={{
                fontSize: 13,
                color: "var(--danger)",
                backgroundColor: "color-mix(in srgb, var(--danger) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--danger) 30%, transparent)",
                borderRadius: 6,
                padding: "10px 12px",
              }}
            >
              {errorMsg}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              style={{
                width: "100%",
                height: 44,
                padding: "0 12px",
                fontSize: 14,
                border: "1px solid var(--border)",
                borderRadius: 6,
                backgroundColor: "var(--surface)",
                color: "var(--ink)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              style={{
                width: "100%",
                height: 44,
                padding: "0 12px",
                fontSize: 14,
                border: "1px solid var(--border)",
                borderRadius: 6,
                backgroundColor: "var(--surface)",
                color: "var(--ink)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              height: 44,
              backgroundColor: "var(--accent)",
              color: "var(--accent-fg)",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
