import type { NextConfig } from "next";
import { regionHubSlugs } from "./src/lib/regions";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return regionHubSlugs.map((slug) => ({
      source: `/daerah/${slug}`,
      destination: `/daerah/provinsi/${slug}`,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icon",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/apple-icon",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "**.sindonews.net" },
      { protocol: "https", hostname: "**.sindonews.com" },
      { protocol: "https", hostname: "**.kompas.com" },
      { protocol: "https", hostname: "**.kompas.tv" },
      { protocol: "https", hostname: "**.liputan6.com" },
      { protocol: "https", hostname: "**.antaranews.com" },
      { protocol: "https", hostname: "**.inews.id" },
      { protocol: "https", hostname: "**.suara.com" },
      { protocol: "https", hostname: "**.inilah.com" },
      { protocol: "https", hostname: "**.ddtc.co.id" },
    ],
  },
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
