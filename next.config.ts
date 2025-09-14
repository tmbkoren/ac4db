import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lsfrqiqlplwrsfuhipkk.supabase.co',
        pathname: '/storage/v1/object/public/images/**',
      },
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
