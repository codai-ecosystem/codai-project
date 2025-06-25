/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['x.codai.ro'],
  },
};

module.exports = nextConfig;
