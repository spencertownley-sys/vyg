const CABIN_ORDER = ["Interior", "Oceanview", "Balcony", "Mini-Suite", "Suite"] as const;

interface FareGridProps {
  fares: Record<string, number>;
  nights: number;
}

export function FareGrid({ fares, nights }: FareGridProps) {
  const cabins = CABIN_ORDER.filter((c) => fares[c]);
  if (cabins.length === 0) return null;

  return (
    <div>
      <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
        Sample Fares
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(cabins.length, 3)}, 1fr)`,
          gap: 1,
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "var(--border)",
        }}
      >
        {cabins.map((cabin) => {
          const total = fares[cabin];
          const perNight = Math.round(total / nights);
          return (
            <div
              key={cabin}
              style={{
                backgroundColor: "var(--surface)",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{cabin}</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>${total.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "var(--subtle)" }}>${perNight}/night</div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 8 }}>
        Sample fares shown are estimates. Prices vary by cabin, date, and occupancy. Book directly with the cruise line.
      </p>
    </div>
  );
}
