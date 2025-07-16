/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        typedRoutes: false,
    },
    images: {
        unoptimized: true,
    },
    output: 'standalone',
    distDir: '.next',
}

module.exports = nextConfig
