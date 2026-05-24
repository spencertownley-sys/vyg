import type { Metadata } from "next";
import Link from "next/link";
import { getAllCruiseLines, getDestinations, getAllPorts, searchSailings } from "@/db/queries";
import { SearchBar } from "@/components/search-bar";
import { SailingCard } from "@/components/sailing-card";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "VYGR Cruises — cruise discovery",
  description: "Find cruises from every major cruise line. Search by destination, port, ship, or date.",
};

function SearchBarWrapper() {
  return <SearchBar />;
}

export default function HomePage() {
  const lines = getAllCruiseLines();
  const destinations = getDestinations().slice(0, 10);
  const recentSailings = searchSailings({}, 6, 0);

  const browseLinks = [
    { href: "/cruises-from", label: "Cruises From" },
    { href: "/cruises-to", label: "Cruises To" },
    { href: "/ships", label: "Ships" },
    { href: "/ports", label: "Ports" },
    { href: "/charters", label: "Charters" },
    { href: "/lines", label: "Cruise Lines" },
  ];

  return (
    <div>
      {/* Hero search */}
      <section
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "64px 0 48px",
        }}
      >
        <div className="container-max">
          <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8, lineHeight: 1.2 }}>
            Find your next cruise.
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 32 }}>
            Search all cruise lines — independent, unaffiliated listings
          </p>
          <Suspense>
            <SearchBarWrapper />
          </Suspense>
        </div>
      </section>

      {/* Browse sections */}
      <section style={{ borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
        <div className="container-max">
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Browse
          </h2>
          <nav
            aria-label="Browse sections"
            style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
          >
            {browseLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 14,
                  padding: "10px 16px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--ink)",
                  textDecoration: "none",
                  minHeight: 44,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Destinations */}
      <section style={{ borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
        <div className="container-max">
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Popular Destinations
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {destinations.map((dest) => (
              <Link
                key={dest}
                href={`/cruises-to/${encodeURIComponent(dest.toLowerCase().replace(/\s+/g, "-"))}`}
                style={{
                  fontSize: 14,
                  padding: "8px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  color: "var(--ink)",
                  textDecoration: "none",
                }}
              >
                {dest}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming sailings */}
      <section style={{ padding: "40px 0" }}>
        <div className="container-max">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Upcoming sailings</h2>
            <Link href="/search" style={{ fontSize: 14, color: "var(--muted)" }}>View all →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {recentSailings.map(({ sailing, ship, line, departurePort }) => (
              <SailingCard
                key={sailing.id}
                id={sailing.id}
                shipName={ship.name}
                lineName={line.name}
                departurePort={departurePort.name}
                arrivalPort={departurePort.name}
                departDate={sailing.departDate}
                nights={sailing.nights}
                destination={sailing.destination}
                sampleFares={JSON.parse(sailing.sampleFares) as Record<string, number>}
                charterFlag={sailing.charterFlag}
                charterName={sailing.charterName}
                bookingUrl={sailing.bookingUrl}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
