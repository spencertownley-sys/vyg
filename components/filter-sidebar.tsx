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
}

export function FilterSidebar({ destinations, ports, ships }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("offset");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, searchParams, pathname]
  );

  const get = (key: string) => searchParams.get(key) ?? "";

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
      aria-label="Filters"
    >
      <div>
        <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Sail Month
        </h2>
        <select
          value={get("month")}
          onChange={(e) => updateFilter("month", e.target.value)}
          style={selectStyle}
          aria-label="Filter by month"
        >
          <option value="">Any month</option>
          {generateMonthOptions().map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div>
        <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Destination
        </h2>
        <select
          value={get("destination")}
          onChange={(e) => updateFilter("destination", e.target.value)}
          style={selectStyle}
          aria-label="Filter by destination"
        >
          <option value="">Any destination</option>
          {destinations.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      <div>
        <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Departure Port
        </h2>
        <select
          value={get("departurePort")}
          onChange={(e) => updateFilter("departurePort", e.target.value)}
          style={selectStyle}
          aria-label="Filter by departure port"
        >
          <option value="">Any port</option>
          {ports.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div>
        <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Duration
        </h2>
        <select
          value={get("durationBucket")}
          onChange={(e) => updateFilter("durationBucket", e.target.value)}
          style={selectStyle}
          aria-label="Filter by duration"
        >
          <option value="">Any length</option>
          <option value="short">1–5 nights</option>
          <option value="medium">6–9 nights</option>
          <option value="long">10–14 nights</option>
          <option value="extended">15+ nights</option>
        </select>
      </div>

      <div>
        <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Ship
        </h2>
        <select
          value={get("ship")}
          onChange={(e) => updateFilter("ship", e.target.value)}
          style={selectStyle}
          aria-label="Filter by ship"
        >
          <option value="">Any ship</option>
          {ships.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Type
        </h2>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", minHeight: 44 }}>
          <input
            type="checkbox"
            checked={get("charter") === "true"}
            onChange={(e) => updateFilter("charter", e.target.checked ? "true" : "")}
            aria-label="Show charters only"
          />
          Charters only
        </label>
      </div>

      {hasActiveFilters(searchParams) && (
        <button
          onClick={() => router.push(pathname)}
          style={{
            fontSize: 13,
            color: "var(--muted)",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "8px 12px",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  fontSize: 14,
  border: "1px solid var(--border)",
  borderRadius: 6,
  backgroundColor: "var(--surface)",
  color: "var(--ink)",
  appearance: "auto",
};

function hasActiveFilters(params: URLSearchParams): boolean {
  return ["month", "destination", "departurePort", "durationBucket", "ship", "charter"].some(
    (k) => params.has(k)
  );
}

function generateMonthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const start = new Date(2026, 9, 1); // Oct 2026
  const end = new Date(2028, 11, 1);
  let current = start;
  while (current <= end) {
    const value = current.toISOString().slice(0, 7);
    const label = current.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    months.push({ value, label });
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }
  return months;
}
