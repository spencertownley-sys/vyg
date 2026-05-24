import Link from "next/link";

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      style={{ textDecoration: "none", color: "var(--ink)", lineHeight: 1 }}
      aria-label="VYGR Cruises — home"
    >
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "stretch" }}>
        <span
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "0.12em",
            lineHeight: 1,
          }}
        >
          VYGR
        </span>
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 8.5,
            letterSpacing: "0.04em",
            lineHeight: 1.4,
            textTransform: "uppercase",
          }}
        >
          {"CRUISES".split("").map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </span>
      </div>
    </Link>
  );
}
