import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const cruiseLines = sqliteTable("cruise_lines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  websiteUrl: text("website_url").notNull(),
  bookingUrlTemplate: text("booking_url_template").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  crawlerId: text("crawler_id").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
});

export const ships = sqliteTable("ships", {
  id: text("id").primaryKey(),
  lineId: text("line_id")
    .notNull()
    .references(() => cruiseLines.id),
  name: text("name").notNull(),
  shipClass: text("ship_class"),
  yearBuilt: integer("year_built"),
  capacity: integer("capacity"),
  photoUrl: text("photo_url"),
  deckPlanUrl: text("deck_plan_url"),
});

export const ports = sqliteTable("ports", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  stateOrRegion: text("state_or_region"),
  country: text("country").notNull(),
  region: text("region").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  timezone: text("timezone"),
});

export const ingestionRuns = sqliteTable("ingestion_runs", {
  id: text("id").primaryKey(),
  lineId: text("line_id")
    .notNull()
    .references(() => cruiseLines.id),
  status: text("status", {
    enum: ["pending", "running", "completed", "failed", "aborted"],
  })
    .notNull()
    .default("pending"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  recordsFetched: integer("records_fetched").notNull().default(0),
  recordsUpserted: integer("records_upserted").notNull().default(0),
  recordsQuarantined: integer("records_quarantined").notNull().default(0),
  errorMessage: text("error_message"),
  triggeredBy: text("triggered_by", { enum: ["manual", "scheduled"] })
    .notNull()
    .default("manual"),
  progressJson: text("progress_json").notNull().default("[]"),
});

export const sailings = sqliteTable("sailings", {
  id: text("id").primaryKey(),
  shipId: text("ship_id")
    .notNull()
    .references(() => ships.id),
  departurePortId: text("departure_port_id")
    .notNull()
    .references(() => ports.id),
  arrivalPortId: text("arrival_port_id")
    .notNull()
    .references(() => ports.id),
  departDate: text("depart_date").notNull(),
  arriveDate: text("arrive_date").notNull(),
  nights: integer("nights").notNull(),
  destination: text("destination").notNull(),
  charterFlag: integer("charter_flag", { mode: "boolean" })
    .notNull()
    .default(false),
  charterName: text("charter_name"),
  bookingUrl: text("booking_url").notNull(),
  sampleFares: text("sample_fares").notNull().default("{}"),
  sourceRunId: text("source_run_id").references(() => ingestionRuns.id),
  sourceUrl: text("source_url"),
  lastUpdated: text("last_updated")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const itineraryStops = sqliteTable("itinerary_stops", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sailingId: text("sailing_id")
    .notNull()
    .references(() => sailings.id),
  dayNumber: integer("day_number").notNull(),
  portId: text("port_id").references(() => ports.id),
  arriveTime: text("arrive_time"),
  departTime: text("depart_time"),
});

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const adminSessions = sqliteTable("admin_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => adminUsers.id),
  expiresAt: integer("expires_at").notNull(),
});
