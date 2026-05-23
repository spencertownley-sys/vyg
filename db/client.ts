import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DATABASE_URL ?? path.join(process.cwd(), "data", "vyg.db");

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { sqlite };

export function initializeSchema(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS cruise_lines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      website_url TEXT NOT NULL,
      booking_url_template TEXT NOT NULL,
      logo_url TEXT,
      primary_color TEXT,
      crawler_id TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ships (
      id TEXT PRIMARY KEY,
      line_id TEXT NOT NULL REFERENCES cruise_lines(id),
      name TEXT NOT NULL,
      ship_class TEXT,
      year_built INTEGER,
      capacity INTEGER,
      photo_url TEXT,
      deck_plan_url TEXT
    );

    CREATE TABLE IF NOT EXISTS ports (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      state_or_region TEXT,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      lat REAL,
      lng REAL,
      timezone TEXT
    );

    CREATE TABLE IF NOT EXISTS ingestion_runs (
      id TEXT PRIMARY KEY,
      line_id TEXT NOT NULL REFERENCES cruise_lines(id),
      status TEXT NOT NULL DEFAULT 'pending',
      started_at TEXT,
      completed_at TEXT,
      records_fetched INTEGER NOT NULL DEFAULT 0,
      records_upserted INTEGER NOT NULL DEFAULT 0,
      records_quarantined INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      triggered_by TEXT NOT NULL DEFAULT 'manual',
      progress_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS sailings (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL REFERENCES ships(id),
      departure_port_id TEXT NOT NULL REFERENCES ports(id),
      arrival_port_id TEXT NOT NULL REFERENCES ports(id),
      depart_date TEXT NOT NULL,
      arrive_date TEXT NOT NULL,
      nights INTEGER NOT NULL,
      destination TEXT NOT NULL,
      charter_flag INTEGER NOT NULL DEFAULT 0,
      charter_name TEXT,
      booking_url TEXT NOT NULL,
      sample_fares TEXT NOT NULL DEFAULT '{}',
      source_run_id TEXT REFERENCES ingestion_runs(id),
      source_url TEXT,
      last_updated TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS itinerary_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sailing_id TEXT NOT NULL REFERENCES sailings(id),
      day_number INTEGER NOT NULL,
      port_id TEXT REFERENCES ports(id),
      arrive_time TEXT,
      depart_time TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES admin_users(id),
      expires_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sailings_depart_date ON sailings(depart_date);
    CREATE INDEX IF NOT EXISTS idx_sailings_ship_id ON sailings(ship_id);
    CREATE INDEX IF NOT EXISTS idx_sailings_departure_port ON sailings(departure_port_id);
    CREATE INDEX IF NOT EXISTS idx_sailings_destination ON sailings(destination);

    CREATE VIRTUAL TABLE IF NOT EXISTS sailings_fts USING fts5(
      sailing_id UNINDEXED,
      ship_name,
      line_name,
      departure_port,
      arrival_port,
      destination,
      content='',
      contentless_delete=1
    );
  `);
}
