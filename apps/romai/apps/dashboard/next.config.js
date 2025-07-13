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
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
