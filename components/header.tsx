import Link from "next/link";
import { Wordmark } from "./wordmark";

const NAV_LINKS = [
  { href: "/search", label: "Search" },
  { href: "/cruises-from", label: "From" },
  { href: "/cruises-to", label: "To" },
  { href: "/ships", label: "Ships" },
  { href: "/ports", label: "Ports" },
];

export function SiteHeader() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div className="container-max" style={{ height: 56, display: "flex", alignItems: "center", gap: 32 }}>
        <Wordmark />
        <nav aria-label="Main navigation" style={{ display: "flex", gap: 24 }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 14,
                color: "var(--muted)",
                textDecoration: "none",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
