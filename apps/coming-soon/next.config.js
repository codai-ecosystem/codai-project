/** @type {import('next').NextConfig} */
const nextConfig = {
    // Basic configuration
    reactStrictMode: true,

    // TypeScript configuration
    typescript: {
        ignoreBuildErrors: false,
    },

    // ESLint configuration
    eslint: {
        ignoreDuringBuilds: false,
    },

    // Performance optimizations
    compress: true,
    poweredByHeader: false,

    // Image optimization
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000, // 1 year
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Build optimizations
    experimental: {
        // Temporarily disable CSS optimization to avoid critters dependency issue
        optimizePackageImports: ['lucide-react'],
    },

    // Bundle analyzer (only in development)
    ...(process.env.ANALYZE === 'true' && {
        webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
            if (process.env.ANALYZE === 'true') {
                const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
                config.plugins.push(new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    openAnalyzer: false,
                }));
            }
            return config;
        },
    }),

    // Headers for security, performance, and Core Web Vitals
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Security headers
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                ],
            },
            // Static assets caching
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;