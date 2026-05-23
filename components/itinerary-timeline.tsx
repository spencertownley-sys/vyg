interface Stop {
  dayNumber: number;
  portName: string | null;
  arriveTime: string | null;
  departTime: string | null;
}

interface ItineraryTimelineProps {
  stops: Stop[];
  departurePort: string;
  departDate: string;
  nights: number;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export function ItineraryTimeline({ stops, departurePort, departDate, nights }: ItineraryTimelineProps) {
  const days = Array.from({ length: nights + 1 }, (_, i) => ({
    day: i,
    date: addDays(departDate, i),
    stop: stops.find((s) => s.dayNumber === i + 1),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {days.map(({ day, date, stop }, i) => (
        <div
          key={day}
          style={{
            display: "flex",
            gap: 16,
            paddingBottom: i < days.length - 1 ? 0 : 0,
          }}
        >
          {/* Timeline spine */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: day === 0 ? "var(--ink)" : "var(--border)",
                border: "2px solid var(--border)",
                flexShrink: 0,
                marginTop: 6,
              }}
            />
            {i < days.length - 1 && (
              <div style={{ width: 1, flex: 1, backgroundColor: "var(--border)", minHeight: 40 }} />
            )}
          </div>

          {/* Content */}
          <div style={{ paddingBottom: 24, flex: 1 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Day {day + 1} · {date}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>
              {day === 0
                ? departurePort
                : stop?.portName ?? "At Sea"}
            </div>
            {stop && (stop.arriveTime || stop.departTime) && (
              <div style={{ fontSize: 12, color: "var(--subtle)", marginTop: 2 }}>
                {stop.arriveTime && `Arrive ${stop.arriveTime}`}
                {stop.arriveTime && stop.departTime && " · "}
                {stop.departTime && `Depart ${stop.departTime}`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
