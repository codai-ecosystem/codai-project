/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_NAME: 'STUDIAI',
    APP_DESCRIPTION: 'AI Education Platform',
    APP_PORT: '4036',
  },
}

module.exports = nextConfig;