/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_NAME: 'WALLET',
    APP_DESCRIPTION: 'Programmable Wallet',
    APP_PORT: '4034',
  },
}

module.exports = nextConfig;