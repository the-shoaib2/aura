/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: [
		'@aura/design-system',
		'@aura/api-client',
		'@aura/hooks',
		'@aura/stores',
		'@aura/i18n',
	],
};

export default nextConfig;
