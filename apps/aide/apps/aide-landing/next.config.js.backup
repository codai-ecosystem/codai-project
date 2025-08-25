/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	images: {
		domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
	},
	env: {
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
		NEXT_PUBLIC_CONTROL_PANEL_URL: process.env.NEXT_PUBLIC_CONTROL_PANEL_URL || 'http://localhost:42433',
	},
	// Node.js 24.x compatibility fixes
	experimental: {
		esmExternals: 'loose',
	},
	webpack: (config, { isServer }) => {
		// Handle ESM modules in Node.js 24.x
		if (isServer) {
			config.externals = config.externals || [];
			config.externals.push({
				'jest-worker': 'jest-worker',
			});
		}
		return config;
	},
};

module.exports = nextConfig;
