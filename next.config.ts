import type { NextConfig } from "next";

const backendOrigin =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

const normalizedBackendOrigin = backendOrigin.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${normalizedBackendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
