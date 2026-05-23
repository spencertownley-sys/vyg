import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { sqlite } from "./client";

const adapter = new BetterSqlite3Adapter(sqlite, {
  user: "admin_users",
  session: "admin_sessions",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(attributes) {
    return {
      email: (attributes as { email: string }).email,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
    };
  }
}
