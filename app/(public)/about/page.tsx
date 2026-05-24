import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About VYGR Cruises — independent cruise discovery.",
};

export default function AboutPage() {
  return (
    <div className="container-max" style={{ padding: "64px 16px", maxWidth: 680 }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 32 }}>About VYGR Cruises</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 16, lineHeight: 1.6, color: "var(--ink)" }}>
        <p>
          VYGR Cruises is an independent cruise discovery tool. It aggregates publicly available sailing information from cruise line websites so you can compare cruises across multiple lines in one place.
        </p>
        <p>
          VYGR Cruises is not affiliated with, endorsed by, or otherwise connected to any cruise line. All booking links take you directly to the cruise line's own website.
        </p>
        <p>
          Sailing data is collected periodically from public cruise line websites. Prices and availability are sample estimates — confirm current pricing directly with the cruise line before booking.
        </p>
        <p>
          No accounts. No tracking. No monetization. This is a reference tool.
        </p>
      </div>
    </div>
  );
}
