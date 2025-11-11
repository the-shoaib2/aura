import eslint from '@eslint/js';
import { auraCommunityNodesPlugin } from '@aura/eslint-plugin-community-nodes';
import { globalIgnores } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importPlugin from 'eslint-plugin-import-x';
import auraNodesPlugin from 'eslint-plugin-aura-nodes-base';
import tseslint, { type ConfigArray } from 'typescript-eslint';

function createConfig(supportCloud = true): ConfigArray {
	return tseslint.config(
		globalIgnores(['dist']),
		{
			files: ['**/*.ts'],
			extends: [
				eslint.configs.recommended,
				tseslint.configs.recommended,
				supportCloud
					? auraCommunityNodesPlugin.configs.recommended
					: auraCommunityNodesPlugin.configs.recommendedWithoutN8nCloudSupport,
				importPlugin.configs['flat/recommended'],
			],
			rules: {
				'prefer-spread': 'off',
			},
		},
		{
			plugins: { 'aura-nodes-base': auraNodesPlugin },
			settings: {
				'import-x/resolver-next': [createTypeScriptImportResolver()],
			},
		},
		{
			files: ['package.json'],
			rules: {
				...auraNodesPlugin.configs.community.rules,
			},
			languageOptions: {
				parser: tseslint.parser,
				parserOptions: {
					extraFileExtensions: ['.json'],
				},
			},
		},
		{
			files: ['./credentials/**/*.ts'],
			rules: {
				...auraNodesPlugin.configs.credentials.rules,
				// Not valid for community nodes
				'aura-nodes-base/cred-class-field-documentation-url-miscased': 'off',
				// @aura/eslint-plugin-community-nodes credential-password-field rule is more accurate
				'aura-nodes-base/cred-class-field-type-options-password-missing': 'off',
			},
		},
		{
			files: ['./nodes/**/*.ts'],
			rules: {
				...auraNodesPlugin.configs.nodes.rules,
				// Inputs and outputs can be enum instead of string "main"
				'aura-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
				'aura-nodes-base/node-class-description-outputs-wrong': 'off',
				// Sometimes the 3rd party API does have a maximum limit, so maxValue is valid
				'aura-nodes-base/node-param-type-options-max-value-present': 'off',
			},
		},
	);
}
export const config = createConfig();
export const configWithoutCloudSupport = createConfig(false);

export default config;
