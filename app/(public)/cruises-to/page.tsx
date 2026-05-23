import type { Metadata } from "next";
import Link from "next/link";
import { getDestinations } from "@/db/queries";

export const metadata: Metadata = {
  title: "Cruises To",
  description: "Browse cruises by destination — Caribbean, Mediterranean, Alaska, and more.",
};

export default function CruisesToPage() {
  const destinations = getDestinations();

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>Cruises To</h1>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 40 }}>
        Browse sailings by destination.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {destinations.map((dest) => (
          <Link
            key={dest}
            href={`/cruises-to/${encodeURIComponent(dest.toLowerCase().replace(/\s+/g, "-"))}`}
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
            {dest}
          </Link>
        ))}
      </div>
    </div>
  );
}
