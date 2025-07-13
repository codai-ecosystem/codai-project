/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_NAME: 'FABRICAI',
    APP_DESCRIPTION: 'AI Services Platform',
    APP_PORT: '4035',
  },
}

module.exports = nextConfig;