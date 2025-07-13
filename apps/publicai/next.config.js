/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_NAME: 'PUBLICAI',
    APP_DESCRIPTION: 'Civic AI & Transparency Tools',
    APP_PORT: '4040',
  },
}

module.exports = nextConfig;