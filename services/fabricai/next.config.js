/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server external packages (moved from experimental)
  serverExternalPackages: [],
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Redirect configuration
  async redirects() {
    return [];
  },
  // Rewrite configuration
  async rewrites() {
    return [];
  },
};

export default nextConfig;
