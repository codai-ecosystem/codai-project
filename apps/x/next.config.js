/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  turbopack: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_NAME: 'X',
    APP_DESCRIPTION: 'AI Trading Platform',
    APP_PORT: '4039',
  },
}

module.exports = nextConfig;