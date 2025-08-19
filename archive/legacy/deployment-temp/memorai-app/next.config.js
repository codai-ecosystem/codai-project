/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['@/components', '@/lib'],
    },

    // Basic configuration without complex webpack customization
    compress: true,
    trailingSlash: false,

    // Environment variables
    env: {
        CUSTOM_KEY: 'memorai-optimized',
    },

    // Disable build-time checks for deployment
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
