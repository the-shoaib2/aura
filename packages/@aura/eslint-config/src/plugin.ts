import type { ESLint } from 'eslint';
import { rules } from './rules/index.js';

const plugin = {
	meta: {
		name: 'aura-local-rules',
	},
	configs: {},
	// @ts-expect-error Rules type does not match for typescript-eslint and eslint
	rules: rules as ESLint.Plugin['rules'],
} satisfies ESLint.Plugin;

export const localRulesPlugin = {
	...plugin,
	configs: {
		recommended: {
			plugins: {
				'aura-local-rules': plugin,
			},
			rules: {
				'aura-local-rules/no-uncaught-json-parse': 'error',
				'aura-local-rules/no-json-parse-json-stringify': 'error',
				'aura-local-rules/no-unneeded-backticks': 'error',
				'aura-local-rules/no-interpolation-in-regular-string': 'error',
				'aura-local-rules/no-unused-param-in-catch-clause': 'error',
				'aura-local-rules/no-useless-catch-throw': 'error',
				'aura-local-rules/no-internal-package-import': 'error',
			},
		},
	},
} satisfies ESLint.Plugin;
