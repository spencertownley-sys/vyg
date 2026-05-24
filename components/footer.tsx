import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        marginTop: "auto",
      }}
    >
      <div
        className="container-max"
        style={{
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--subtle)" }}>
          VYGR Cruises
        </span>
        <span style={{ fontSize: 12, color: "var(--subtle)" }}>
          Independent Cruise Discovery. Not affiliated with any cruise line.
        </span>
        <nav aria-label="Footer navigation" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          <Link href="/about" style={{ fontSize: 12, color: "var(--subtle)", textDecoration: "none" }}>
            About
          </Link>
          <span style={{ fontSize: 12, color: "var(--subtle)" }}>|</span>
          <Link href="/abuse" style={{ fontSize: 12, color: "var(--subtle)", textDecoration: "none" }}>
            Legal
          </Link>
        </nav>
      </div>
    </footer>
  );
}
