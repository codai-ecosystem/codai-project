/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_NAME: 'SOCIAI',
    APP_DESCRIPTION: 'AI Social Platform',
    APP_PORT: '4037',
  },
  // Exclude development files from production build
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Exclude Storybook stories and test files from production builds
      config.module.rules.push({
        test: /\.(stories|test|spec)\.(js|jsx|ts|tsx)$/,
        use: 'ignore-loader',
      });
    }
    return config;
  },
}

module.exports = nextConfig;