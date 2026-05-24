import Link from "next/link";
import { LineLogo } from "@/components/line-logo";

interface SailingCardProps {
  id: string;
  lineId: string;
  shipName: string;
  lineName: string;
  departurePort: string;
  arrivalPort: string;
  departDate: string;
  nights: number;
  destination: string;
  sampleFares: Record<string, number>;
  charterFlag: boolean;
  charterName?: string | null;
  bookingUrl: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function lowestFare(fares: Record<string, number>): number | null {
  const values = Object.values(fares);
  return values.length > 0 ? Math.min(...values) : null;
}

export function SailingCard({
  id, lineId, shipName, lineName, departurePort, arrivalPort,
  departDate, nights, destination, sampleFares, charterFlag, charterName, bookingUrl,
}: SailingCardProps) {
  const fare = lowestFare(sampleFares);
  const isOpenJaw = departurePort !== arrivalPort;

  return (
    <article
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Line branding strip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <LineLogo lineId={lineId} lineName={lineName} />
        {charterFlag && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              border: "1px solid var(--border)",
              borderRadius: 4,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Charter
          </span>
        )}
      </div>

      {/* Destination + fare */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <Link
          href={`/sailings/${id}`}
          style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", textDecoration: "none", lineHeight: 1.3 }}
        >
          {destination}
        </Link>
        {fare && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>from</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>${fare.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* Details grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Ship</div>
          <div style={{ fontSize: 13 }}>
            <Link href={`/ships/${shipName.toLowerCase().replace(/\s+/g, "-")}`} style={{ color: "var(--ink)" }}>
              {shipName}
            </Link>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Departure</div>
          <div style={{ fontSize: 13 }}>{formatDate(departDate)}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{nights} nights</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>From</div>
          <div style={{ fontSize: 13 }}>{departurePort}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{isOpenJaw ? "To" : "Returns to"}</div>
          <div style={{ fontSize: 13 }}>{arrivalPort}</div>
        </div>
      </div>

      {charterName && (
        <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>{charterName}</div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Link
          href={`/sailings/${id}`}
          style={{
            fontSize: 13,
            padding: "9px 14px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--ink)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          View itinerary
        </Link>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            padding: "9px 14px",
            backgroundColor: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: 6,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Book ↗
        </a>
      </div>
    </article>
  );
}
