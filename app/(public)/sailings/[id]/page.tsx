import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSailingById } from "@/db/queries";
import { ItineraryTimeline } from "@/components/itinerary-timeline";
import { FareGrid } from "@/components/fare-grid";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sailing = getSailingById(id);
  if (!sailing) return {};
  return {
    title: `${sailing.destination} on ${sailing.ship.name}`,
    description: `${sailing.nights}-night ${sailing.destination} cruise on ${sailing.ship.name} departing ${sailing.departDate} from ${sailing.departurePort.name}.`,
  };
}

export default async function SailingDetailPage({ params }: Props) {
  const { id } = await params;
  const sailing = getSailingById(id);
  if (!sailing) notFound();

  const fares = JSON.parse(sailing.sampleFares) as Record<string, number>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: `${sailing.nights}-Night ${sailing.destination} Cruise`,
    description: `${sailing.nights}-night cruise to ${sailing.destination} on ${sailing.ship.name}`,
    touristType: "Cruise",
    startDate: sailing.departDate,
    endDate: sailing.arriveDate,
    itinerary: sailing.stops.map((stop) => ({
      "@type": "TouristAttraction",
      name: stop.port?.name ?? "At Sea",
    })),
    offers: Object.entries(fares).map(([cabin, price]) => ({
      "@type": "Offer",
      name: cabin,
      price,
      priceCurrency: "USD",
      url: sailing.bookingUrl,
    })),
    provider: {
      "@type": "Organization",
      name: sailing.ship.line.name,
      url: sailing.ship.line.websiteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-max" style={{ padding: "40px 16px" }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, display: "flex", gap: 8 }}>
          <Link href="/search" style={{ color: "var(--muted)", textDecoration: "none" }}>Search</Link>
          <span>›</span>
          <Link href={`/lines/${sailing.ship.lineId}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{sailing.ship.line.name}</Link>
          <span>›</span>
          <Link href={`/ships/${sailing.shipId}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{sailing.ship.name}</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)" }}>{sailing.destination}</span>
        </nav>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "start" }}>
          {/* Main content */}
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8, lineHeight: 1.2 }}>
              {sailing.nights}-Night {sailing.destination} Cruise
            </h1>
            {sailing.charterFlag && sailing.charterName && (
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
                Full-ship charter: {sailing.charterName}
              </p>
            )}
            <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 40 }}>
              <Link href={`/ships/${sailing.shipId}`} style={{ color: "var(--ink)", textDecoration: "none" }}>{sailing.ship.name}</Link>
              {" · "}
              <Link href={`/lines/${sailing.ship.lineId}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{sailing.ship.line.name}</Link>
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40, maxWidth: 480 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Departs</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>
                  {new Date(sailing.departDate + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </div>
                <div style={{ fontSize: 14, color: "var(--muted)" }}>
                  <Link href={`/cruises-from/${sailing.departurePortId}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {sailing.departurePort.name}
                  </Link>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Returns</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>
                  {new Date(sailing.arriveDate + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </div>
                <div style={{ fontSize: 14, color: "var(--muted)" }}>{sailing.arrivalPort.name}</div>
              </div>
            </div>

            <section style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Itinerary</h2>
              <ItineraryTimeline
                stops={sailing.stops.map((s) => ({
                  dayNumber: s.dayNumber,
                  portName: s.port?.name ?? null,
                  arriveTime: s.arriveTime,
                  departTime: s.departTime,
                }))}
                departurePort={sailing.departurePort.name}
                departDate={sailing.departDate}
                nights={sailing.nights}
              />
            </section>

            <section>
              <FareGrid fares={fares} nights={sailing.nights} />
            </section>
          </div>

          {/* Sidebar CTA */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, backgroundColor: "var(--surface)" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>from</div>
                {Object.keys(fares).length > 0 && (
                  <div style={{ fontSize: 32, fontWeight: 600 }}>
                    ${Math.min(...Object.values(fares)).toLocaleString()}
                  </div>
                )}
                <div style={{ fontSize: 14, color: "var(--muted)" }}>{sailing.nights} nights · per person</div>
              </div>
              <a
                href={sailing.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px 24px",
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-fg)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  minHeight: 44,
                }}
              >
                Book on cruise line ↗
              </a>
              <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 12, textAlign: "center" }}>
                You will leave VYGR Cruises and book directly with the cruise line.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
