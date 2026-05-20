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
  trailingSlash: false
}

export default nextConfig
