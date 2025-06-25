/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['bancai.ro'],
  },
};

module.exports = nextConfig;
