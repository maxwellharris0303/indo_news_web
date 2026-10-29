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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
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
