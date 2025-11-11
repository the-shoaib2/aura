import { defineConfig } from 'eslint/config';
import { baseConfig } from '@aura/eslint-config/base';

export default defineConfig(baseConfig, {
	rules: {
		'unicorn/filename-case': ['error', { case: 'kebabCase' }],
		'@typescript-eslint/consistent-type-imports': 'error',
		'aura-local-rules/no-plain-errors': 'off',

		// TODO: Remove this
		'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
		'@typescript-eslint/prefer-nullish-coalescing': 'warn',
		'@typescript-eslint/no-floating-promises': 'warn',
		'import-x/order': 'warn',
	},
});
