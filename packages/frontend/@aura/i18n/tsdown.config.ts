import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: [
		'src/**/*.ts',
		'!src/**/*.test.*',
		'!src/**/*.spec.*',
		'!src/**/*.d.ts',
		'!src/__tests__/**/*',
	],
	format: ['esm'],
	clean: true,
	dts: true,
	sourcemap: true,
});
