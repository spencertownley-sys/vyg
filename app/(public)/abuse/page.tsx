import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abuse / Legal",
  description: "Report abuse or legal concerns about VYGR Cruises.",
};

export default function AbusePage() {
  return (
    <div className="container-max" style={{ padding: "64px 16px", maxWidth: 680 }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 32 }}>Abuse / Legal</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 16, lineHeight: 1.6 }}>
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Data removal requests</h2>
          <p style={{ color: "var(--muted)" }}>
            If you represent a cruise line and would like information removed from VYGR Cruises, contact us at the address below. We take removal requests seriously and will respond promptly.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Crawler policy</h2>
          <p style={{ color: "var(--muted)" }}>
            VYGR Cruises indexes publicly available cruise schedule information from cruise line websites. Our crawler respects robots.txt, rate-limits itself to 1 request per 2 seconds per domain, and identifies itself with a User-Agent string that includes a contact address.
          </p>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            We do not access paywalled content, login-protected pages, or any data that is not publicly accessible without authentication.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Contact</h2>
          <p style={{ color: "var(--muted)" }}>
            For abuse reports, data removal requests, or legal inquiries:
          </p>
          <p style={{ marginTop: 8 }}>
            <a
              href="mailto:abuse@VYGR Cruises.example"
              style={{ color: "var(--ink)", textDecoration: "underline" }}
            >
              abuse@VYGR Cruises.example
            </a>
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Disclaimer</h2>
          <p style={{ color: "var(--muted)" }}>
            All pricing shown on VYGR Cruises is sample data for reference purposes only. Actual prices vary by date, cabin type, and occupancy. Always confirm pricing directly with the cruise line. VYGR Cruises makes no warranty regarding the accuracy or completeness of any information displayed.
          </p>
        </section>
      </div>
    </div>
  );
}
