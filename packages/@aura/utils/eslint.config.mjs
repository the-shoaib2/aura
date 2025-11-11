import { defineConfig } from 'eslint/config';
import { nodeConfig } from '@aura/eslint-config/node';

export default defineConfig(nodeConfig, {
	rules: {
		// TODO: Remove this
		'no-prototype-builtins': 'warn',
		'@typescript-eslint/require-await': 'warn',
	},
});
