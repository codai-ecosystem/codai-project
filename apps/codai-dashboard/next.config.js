/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['localhost', 'codai.dev'],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8102/auth/:path*',
      },
      {
        source: '/api/gateway/:path*',
        destination: 'http://localhost:8010/:path*',
      },
      {
        source: '/api/hub/:path*',
        destination: 'http://localhost:8110/:path*',
      },
      {
        source: '/api/bancai/:path*',
        destination: 'http://localhost:8120/:path*',
      },
      {
        source: '/api/cbd/:path*',
        destination: 'http://localhost:8180/:path*',
      },
    ]
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:4250',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret-key-2025',
    IDENTITY_API_URL: process.env.IDENTITY_API_URL || 'http://localhost:8102',
    API_GATEWAY_URL: process.env.API_GATEWAY_URL || 'http://localhost:8010',
    HUB_API_URL: process.env.HUB_API_URL || 'http://localhost:8110',
    BANCAI_API_URL: process.env.BANCAI_API_URL || 'http://localhost:8120',
    CBD_API_URL: process.env.CBD_API_URL || 'http://localhost:8180',
    WEBSOCKET_URL: process.env.WEBSOCKET_URL || 'http://localhost:8110',
  }
};

export default nextConfig;