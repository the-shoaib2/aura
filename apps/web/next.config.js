/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: [
		'@aura/design-system',
		'@aura/api-client',
		'@aura/hooks',
		'@aura/stores',
		'@aura/i18n',
	],
	// Use webpack instead of Turbopack for better workspace package support
	// Turbopack may have issues resolving workspace packages
};

export default nextConfig;
