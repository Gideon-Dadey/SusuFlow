import type { NextConfig } from 'next';

const isDockerBuild = process.env.DOCKER_BUILD === 'true';

const nextConfig: NextConfig = {
  transpilePackages: ['@susuflow/shared'],
  ...(isDockerBuild ? { output: 'standalone' as const } : {}),
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    const raw = process.env.API_URL?.trim();
    if (!raw) return [];
    const apiUrl = raw.startsWith('http') ? raw : `https://${raw}`;
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
