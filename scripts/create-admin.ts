import readline from "readline/promises";
import * as argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { db, initializeSchema } from "../db/client";
import { adminUsers } from "../db/schema";
import { eq } from "drizzle-orm";

async function main(): Promise<void> {
  initializeSchema();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const email = (await rl.question("Admin email: ")).trim();
  if (!email || !email.includes("@")) {
    console.error("Invalid email.");
    process.exit(1);
  }

  const password = (await rl.question("Password (min 12 chars): ")).trim();
  if (password.length < 12) {
    console.error("Password too short.");
    process.exit(1);
  }

  rl.close();

  const existing = db.select().from(adminUsers).where(eq(adminUsers.email, email)).get();
  if (existing) {
    console.error(`Admin with email ${email} already exists.`);
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password);
  const id = uuidv4();

  db.insert(adminUsers).values({ id, email, passwordHash }).run();
  console.log(`Admin user created: ${email} (id: ${id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
