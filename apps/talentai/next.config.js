/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
    APP_NAME: 'TALENTAI',
    APP_DESCRIPTION: 'AI-driven talent acquisition',
    APP_PORT: '4040',
  },
}

module.exports = nextConfig;