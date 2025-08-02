/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
  env: {
    ROMAI_API_URL: process.env.ROMAI_API_URL || 'http://localhost:3000',
  },
  eslint: {
    // Enable strict ESLint checking
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
