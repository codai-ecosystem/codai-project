/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['memorai.ro', 'docs.memorai.ro'],
        formats: ['image/webp', 'image/avif']
    }
};

export default nextConfig;
