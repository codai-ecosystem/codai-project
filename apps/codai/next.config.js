/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@codai/shared-ui', '@codai/memorai', '@codai/auth'],
  // Enable strict type and lint checking
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
