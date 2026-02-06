import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    // Modern formats for better compression
    formats: ["image/avif", "image/webp"],
    // Allow images from Vercel Blob storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dxgukukwhf1tx4uy.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  
  // Disable the X-Powered-By header
  poweredByHeader: false,
  
  // Enable experimental performance optimizations
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      "react",
      "react-dom",
      "@supabase/supabase-js",
      "stripe",
    ],
  },
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/(.*).(js|css|woff|woff2|png|jpg|jpeg|gif|ico|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
