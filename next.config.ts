import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native binaries and the font/text engine must stay outside the bundle.
  serverExternalPackages: ["@resvg/resvg-js", "satori"],
  // The API reads these at request time; Vercel must trace them into the function.
  outputFileTracingIncludes: {
    "/api/render": ["./assets/**"],
  },
};

export default nextConfig;
