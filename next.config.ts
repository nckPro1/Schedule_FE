import type { NextConfig } from "next";

/** Backend FastAPI — proxy /api/* để tránh Failed to fetch (CORS / extension / sai port) */
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
