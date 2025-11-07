/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	transpilePackages: ['@aura/design-system'],
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
			};
		}
		return config;
	},
};

export default nextConfig;
