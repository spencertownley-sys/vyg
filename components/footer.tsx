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
          padding: "12px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <nav aria-label="Footer navigation" style={{ display: "flex", gap: 16 }}>
          <Link
            href="/about"
            style={{ fontSize: 12, color: "var(--subtle)", textDecoration: "none" }}
          >
            About
          </Link>
          <Link
            href="/abuse"
            style={{ fontSize: 12, color: "var(--subtle)", textDecoration: "none" }}
          >
            Abuse / Legal
          </Link>
        </nav>
        <span style={{ fontSize: 12, color: "var(--subtle)", textAlign: "center" }}>
          VYGR Cruises. Independent cruise discovery. Not affiliated with any cruise line.
        </span>
      </div>
    </footer>
  );
}
