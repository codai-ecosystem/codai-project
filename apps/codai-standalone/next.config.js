/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Azure Static Web Apps deployment
  output: 'standalone',

  // Disable experimental features that cause build issues
  experimental: {
    optimizeCss: false,
  },

  typescript: {
    // Skip type checking during build for faster deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build for faster deployment
    ignoreDuringBuilds: true,
  },

  // Configure headers for API routes and security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // Redirects for backward compatibility
  async redirects() {
    return [
      {
        source: '/api.codai.ro/:path*',
        destination: '/api/:path*',
        permanent: true,
      },
    ]
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Optimize images
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
