import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cache-igetweb-v2.mt108.info" },
      { protocol: "https", hostname: "cdn.igetweb.com" },
      { protocol: "https", hostname: "www.saturday5amulet.com" },
    ],
  },
};

export default nextConfig;
