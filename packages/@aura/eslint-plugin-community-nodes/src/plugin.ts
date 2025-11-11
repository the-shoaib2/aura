import type { ESLint, Linter } from 'eslint';

import pkg from '../package.json' with { type: 'json' };
import { rules } from './rules/index.js';

const plugin = {
	meta: {
		name: pkg.name,
		version: pkg.version,
		namespace: '@aura/community-nodes',
	},
	// @ts-expect-error Rules type does not match for typescript-eslint and eslint
	rules: rules as ESLint.Plugin['rules'],
} satisfies ESLint.Plugin;

const configs = {
	recommended: {
		ignores: ['eslint.config.{js,mjs,ts,mts}'],
		plugins: {
			'@aura/community-nodes': plugin,
		},
		rules: {
			'@aura/community-nodes/no-restricted-globals': 'error',
			'@aura/community-nodes/no-restricted-imports': 'error',
			'@aura/community-nodes/credential-password-field': 'error',
			'@aura/community-nodes/no-deprecated-workflow-functions': 'error',
			'@aura/community-nodes/node-usable-as-tool': 'error',
			'@aura/community-nodes/package-name-convention': 'error',
			'@aura/community-nodes/credential-test-required': 'error',
			'@aura/community-nodes/no-credential-reuse': 'error',
			'@aura/community-nodes/icon-validation': 'error',
			'@aura/community-nodes/resource-operation-pattern': 'warn',
			'@aura/community-nodes/credential-documentation-url': 'error',
		},
	},
	recommendedWithoutN8nCloudSupport: {
		ignores: ['eslint.config.{js,mjs,ts,mts}'],
		plugins: {
			'@aura/community-nodes': plugin,
		},
		rules: {
			'@aura/community-nodes/credential-password-field': 'error',
			'@aura/community-nodes/no-deprecated-workflow-functions': 'error',
			'@aura/community-nodes/node-usable-as-tool': 'error',
			'@aura/community-nodes/package-name-convention': 'error',
			'@aura/community-nodes/credential-test-required': 'error',
			'@aura/community-nodes/no-credential-reuse': 'error',
			'@aura/community-nodes/icon-validation': 'error',
			'@aura/community-nodes/credential-documentation-url': 'error',
			'@aura/community-nodes/resource-operation-pattern': 'warn',
		},
	},
} satisfies Record<string, Linter.Config>;

const pluginWithConfigs = { ...plugin, configs } satisfies ESLint.Plugin;

const auraCommunityNodesPlugin = pluginWithConfigs;
export default pluginWithConfigs;
export { rules, configs, auraCommunityNodesPlugin };
