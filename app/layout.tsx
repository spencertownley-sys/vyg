import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s — vyg",
    default: "vyg — cruise discovery",
  },
  description: "Find cruises from every major cruise line. Browse by destination, port, ship, or sailing date.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body style={{ margin: 0, backgroundColor: "var(--bg)" }}>
        {children}
      </body>
    </html>
  );
}
