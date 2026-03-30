import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the Next.js dev indicator (N icon) in bottom left
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: "http", hostname: "noeyai.local" }],
  },
};

export default nextConfig;