/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@codai/logai-universal'],
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    LOGAI_DASHBOARD_PORT: '4036',
    LOGAI_WS_ENDPOINT: 'ws://localhost:8080/logai',
    LOGAI_API_ENDPOINT: 'http://localhost:8080/api/logai'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig
