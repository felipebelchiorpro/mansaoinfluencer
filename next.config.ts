import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Habilita servidor Node.js com rotas de API dinâmicas (/api/vote, /api/cron)
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
