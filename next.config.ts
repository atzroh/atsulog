import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Site data lives on the server; never ship the local copy.
  outputFileTracingExcludes: { "*": ["data/**"] },
};

export default nextConfig;
