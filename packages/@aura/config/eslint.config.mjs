import { defineConfig } from 'eslint/config';
import { nodeConfig } from '@aura/eslint-config/node';

export default defineConfig(
	nodeConfig,
	{
		rules: {
			'unicorn/filename-case': ['error', { case: 'kebabCase' }],

			// TODO: Remove this
			'@typescript-eslint/naming-convention': 'warn',
			'@typescript-eslint/no-unsafe-call': 'warn',
			'@typescript-eslint/no-unsafe-function-type': 'warn',
		},
	},
	{
		files: ['**/*.config.ts'],
		rules: {
			'aura-local-rules/no-untyped-config-class-field': 'error',
		},
	},
);
