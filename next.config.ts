import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["pdf-parse", "pdf2json"],
  experimental: {
    turbo: {
      resolveAlias: {
        "@backend": path.resolve(__dirname, "Backend"),
        "@database": path.resolve(__dirname, "DataBase"),
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@backend": path.resolve(__dirname, "Backend"),
      "@database": path.resolve(__dirname, "DataBase"),
    };
    return config;
  },
};

export default nextConfig;
