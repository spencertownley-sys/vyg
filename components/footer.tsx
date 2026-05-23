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
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--subtle)" }}>
          vyg — independent cruise discovery. Not affiliated with any cruise line.
        </span>
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
      </div>
    </footer>
  );
}
