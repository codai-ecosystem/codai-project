/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  eslint: {
    dirs: ['apps/web']
  },
  typescript: {
    tsconfigPath: './apps/web/tsconfig.json'
  }
}

module.exports = nextConfig
