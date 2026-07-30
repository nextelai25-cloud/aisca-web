import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ywtrxmwmfozkwwdsiced.supabase.co'
      }
    ]
  },
  trailingSlash: false,
  poweredByHeader: false, // don't advertise "X-Powered-By: Next.js"
  async headers() {
    // Baseline security headers applied to every route.
    // (CSP intentionally omitted here — it needs per-page testing against
    // framer-motion / GSAP / inline JSON-LD before enabling.)
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
}

export default nextConfig
