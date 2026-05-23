import Link from "next/link";

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontWeight: 500,
        fontSize: 18,
        letterSpacing: "0.02em",
        color: "var(--ink)",
        textDecoration: "none",
        lineHeight: 1,
      }}
      aria-label="vyg — home"
    >
      vyg
    </Link>
  );
}
