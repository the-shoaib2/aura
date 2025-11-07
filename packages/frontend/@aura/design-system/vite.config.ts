import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const packagesDir = resolve(__dirname, '..', '..', '..');

export default defineConfig({
	plugins: [
		react(),
		dts({
			insertTypesEntry: true,
			include: ['src/**/*'],
			exclude: ['src/**/*.test.*', 'src/**/*.spec.*'],
		}),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
			'@aura/design-system': resolve(__dirname, 'src'),
			'@aura/hooks': resolve(packagesDir, 'frontend', '@aura', 'hooks', 'src'),
			'@aura/utils': resolve(packagesDir, '@aura', 'utils', 'src'),
		},
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src', 'index.ts'),
			name: 'AuraDesignSystem',
			formats: ['es'],
			fileName: () => 'index.js',
		},
		rollupOptions: {
			external: ['react', 'react-dom', 'react/jsx-runtime'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
				},
			},
		},
	},
	css: {
		postcss: './postcss.config.cjs',
	},
});
