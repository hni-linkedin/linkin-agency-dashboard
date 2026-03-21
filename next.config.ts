import type { NextConfig } from "next";

/** Used only for dev-time rewrites (see below). */
const backendOrigin =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

const normalizedBackendOrigin = backendOrigin.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    // Development only: proxy `/api/*` to the backend so the browser stays on the Next origin
    // and avoids CORS when the UI and API are on different localhost ports.
    // Production builds call `NEXT_PUBLIC_API_URL` directly from the client (see `src/lib/axios.ts`).
    if (process.env.NODE_ENV === "production") {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${normalizedBackendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
