import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // devIndicators: false, // Optional: Next 16 has a redesigned, less intrusive indicator

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.fatafatsewa.com" }, // Modern wildcard matches all subdomains
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
    formats: [ "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  reactCompiler: true,

  // React Compiler is now stable in v16! 
  // It automatically handles memoization (no more manual useMemo)
  experimental: {
    optimizePackageImports: ["lucide-react"] // No longer needed; Turbopack handles this automatically
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  allowedDevOrigins: ['192.168.1.111'],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Link",
            value: "<https://img.fatafatsewa.com>; rel=preconnect, <https://admin.fatafatsewa.com>; rel=preconnect",
          },
        ],
      },
      // {
      //   source: "/_next/static/(.*)",
      //   headers: [
      //     { key: "Cache-Control", value: "public, max-age=36555, immutable" },
      //   ],
      // },
    ];
  },
};

export default nextConfig;