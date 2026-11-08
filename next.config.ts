import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Site data lives on the server; never ship the local copy.
  outputFileTracingExcludes: { "*": ["data/**"] },
  // Photos are shrunk on the server, so let full-size uploads in.
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  // The GitHub avatar on the home page.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
