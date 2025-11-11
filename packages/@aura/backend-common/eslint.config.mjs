import { defineConfig } from 'eslint/config';
import { baseConfig } from '@aura/eslint-config/base';

export default defineConfig(
	baseConfig,
	{
		rules: {
			'unicorn/filename-case': ['error', { case: 'kebabCase' }],

			// TODO: Remove this
			'@typescript-eslint/naming-convention': 'warn',
			'@typescript-eslint/no-wrapper-object-types': 'warn',
		},
	},
	{
		files: ['**/*.test.ts'],
		rules: {
			'aura-local-rules/no-uncaught-json-parse': 'warn',
			'@typescript-eslint/no-unsafe-return': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/unbound-method': 'warn',
		},
	},
);
