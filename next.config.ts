import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.vortexsync.pro",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8090",
      },
    ],
  },
};

export default nextConfig;
