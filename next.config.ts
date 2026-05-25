import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Canonicalize www → apex. Permanent so browsers and search engines
      // update their records; :path* preserves the full path and query string.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.vygrcruises.com" }],
        destination: "https://vygrcruises.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
