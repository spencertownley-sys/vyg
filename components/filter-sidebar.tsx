"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSidebarProps {
  destinations: FilterOption[];
  ports: FilterOption[];
  ships: FilterOption[];
  lines: FilterOption[];
}

// ── Duration buckets ────────────────────────────────────────────────────────
const DURATION_OPTIONS = [
  { value: "short",    label: "1–5 nights" },
  { value: "medium",   label: "6–9 nights" },
  { value: "long",     label: "10–14 nights" },
  { value: "extended", label: "15+ nights" },
];

// ── Styles ──────────────────────────────────────────────────────────────────
const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  marginBottom: 10,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  height: 36,
  padding: "0 10px",
  fontSize: 13,
  border: "1px solid var(--border)",
  borderRadius: 6,
  backgroundColor: "var(--surface)",
  color: "var(--ink)",
  appearance: "auto",
};

function pill(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 11px",
    borderRadius: 100,
    border: `1px solid ${active ? "var(--ink)" : "var(--border)"}`,
    background: active ? "var(--ink)" : "transparent",
    color: active ? "var(--bg)" : "var(--ink)",
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
    lineHeight: 1.4,
    transition: "background 0.1s, color 0.1s, border-color 0.1s",
  };
}

function CheckIcon() {
  return (
    <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden>
      <path d="M1 3.5L3.5 6L8 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span style={{
      width: 16,
      height: 16,
      borderRadius: 4,
      border: `1.5px solid ${checked ? "var(--ink)" : "var(--border)"}`,
      background: checked ? "var(--ink)" : "transparent",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "background 0.1s, border-color 0.1s",
    }}>
      {checked && <CheckIcon />}
    </span>
  );
}

// ── FilterSidebar ───────────────────────────────────────────────────────────
export function FilterSidebar({ destinations, ports, ships, lines }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const get = (key: string) => searchParams.get(key) ?? "";

  // Generic single-value toggle
  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && params.get(key) !== value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("offset");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, searchParams, pathname]
  );

  // Multi-select: comma-separated `lines` param
  const activeLines = (searchParams.get("lines") ?? "").split(",").filter(Boolean);
  const toggleLine = useCallback(
    (lineId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = (params.get("lines") ?? "").split(",").filter(Boolean);
      const idx = current.indexOf(lineId);
      if (idx >= 0) current.splice(idx, 1); else current.push(lineId);
      if (current.length > 0) params.set("lines", current.join(","));
      else params.delete("lines");
      params.delete("offset");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, searchParams, pathname]
  );

  const anyActive = ["month","destination","departurePort","durationBucket","ship","charter","lines"].some(
    (k) => searchParams.has(k)
  );

  return (
    <aside
      style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 28 }}
      aria-label="Filters"
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Filters</span>
        {anyActive && (
          <button
            onClick={() => router.push(pathname)}
            style={{
              fontSize: 12,
              color: "var(--muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Cruise Line ── */}
      <section>
        <div style={sectionLabel}>Cruise Line</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {lines.map((line) => {
            const active = activeLines.includes(line.value);
            const shortName = line.label
              .replace(" Cruise Line", "")
              .replace(" Cruises", "")
              .replace(" Line", "");
            return (
              <button
                key={line.value}
                onClick={() => toggleLine(line.value)}
                aria-pressed={active}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: active ? "var(--ink)" : "var(--muted)",
                  fontWeight: active ? 500 : 400,
                  textAlign: "left",
                }}
              >
                <Checkbox checked={active} />
                {shortName}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Destination ── */}
      <section>
        <div style={sectionLabel}>Destination</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {destinations.map((dest) => {
            const active = get("destination") === dest.value;
            return (
              <button
                key={dest.value}
                onClick={() => setParam("destination", dest.value)}
                aria-pressed={active}
                style={pill(active)}
              >
                {dest.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Duration ── */}
      <section>
        <div style={sectionLabel}>Duration</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {DURATION_OPTIONS.map((opt) => {
            const active = get("durationBucket") === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setParam("durationBucket", opt.value)}
                aria-pressed={active}
                style={pill(active)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Departure Port ── */}
      <section>
        <div style={sectionLabel}>Departure Port</div>
        <select
          value={get("departurePort")}
          onChange={(e) => setParam("departurePort", e.target.value)}
          style={selectStyle}
          aria-label="Filter by departure port"
        >
          <option value="">Any port</option>
          {ports.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </section>

      {/* ── Sail Month ── */}
      <section>
        <div style={sectionLabel}>Sail Month</div>
        <select
          value={get("month")}
          onChange={(e) => setParam("month", e.target.value)}
          style={selectStyle}
          aria-label="Filter by month"
        >
          <option value="">Any month</option>
          {generateMonthOptions().map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </section>

      {/* ── Ship ── */}
      <section>
        <div style={sectionLabel}>Ship</div>
        <select
          value={get("ship")}
          onChange={(e) => setParam("ship", e.target.value)}
          style={selectStyle}
          aria-label="Filter by ship"
        >
          <option value="">Any ship</option>
          {ships.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </section>

      {/* ── Charters ── */}
      <section>
        <div style={sectionLabel}>Type</div>
        <button
          onClick={() => setParam("charter", get("charter") === "true" ? "" : "true")}
          aria-pressed={get("charter") === "true"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: get("charter") === "true" ? "var(--ink)" : "var(--muted)",
            fontWeight: get("charter") === "true" ? 500 : 400,
          }}
        >
          <Checkbox checked={get("charter") === "true"} />
          Charters only
        </button>
      </section>
    </aside>
  );
}

// Generate months from today through 19 months ahead
function generateMonthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 19, 1);
  let cur = start;
  while (cur < end) {
    const value = cur.toISOString().slice(0, 7);
    const label = cur.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    months.push({ value, label });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return months;
}
