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
    APP_NAME: 'MEMORAI',
    APP_DESCRIPTION: 'AI Memory & Database Core',
    APP_PORT: '4031',
  },
}

export default nextConfig;