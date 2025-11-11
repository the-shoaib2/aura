import { RuleTester } from '@typescript-eslint/rule-tester';

import { PackageNameConventionRule } from './package-name-convention.js';

const ruleTester = new RuleTester();

ruleTester.run('package-name-convention', PackageNameConventionRule, {
	valid: [
		{
			name: 'valid unscoped package name',
			filename: 'package.json',
			code: '{ "name": "aura-nodes-example", "version": "1.0.0" }',
		},
		{
			name: 'valid unscoped package name with dashes',
			filename: 'package.json',
			code: '{ "name": "aura-nodes-my-service", "version": "1.0.0" }',
		},
		{
			name: 'valid scoped package name',
			filename: 'package.json',
			code: '{ "name": "@mycompany/aura-nodes-example", "version": "1.0.0" }',
		},
		{
			name: 'valid scoped package name with dashes',
			filename: 'package.json',
			code: '{ "name": "@author/aura-nodes-service", "version": "1.0.0" }',
		},
		{
			name: 'object without name property',
			filename: 'package.json',
			code: '{ "version": "1.0.0", "description": "test" }',
		},
		{
			name: 'non-package.json file ignored',
			filename: 'some-config.json',
			code: '{ "name": "my-config", "type": "config" }',
		},
		{
			name: 'nested name fields should be ignored - only top-level name matters',
			filename: 'package.json',
			code: `{
				"name": "aura-nodes-example",
				"version": "1.0.0",
				"dependencies": {
					"name": "invalid-nested-name"
				},
				"scripts": {
					"name": "another-invalid-name"
				},
				"author": {
					"name": "John Doe"
				}
			}`,
		},
		{
			name: 'deeply nested name fields should be ignored',
			filename: 'package.json',
			code: `{
				"name": "@author/aura-nodes-service",
				"version": "1.0.0",
				"config": {
					"nested": {
						"deeply": {
							"name": "very-invalid-name"
						}
					}
				},
				"repository": {
					"type": "git",
					"url": "https://github.com/user/repo",
					"directory": {
						"name": "bad-name"
					}
				}
			}`,
		},
	],
	invalid: [
		{
			name: 'invalid package name - generic',
			filename: 'package.json',
			code: '{ "name": "my-package", "version": "1.0.0" }',
			errors: [
				{
					messageId: 'invalidPackageName',
					data: { packageName: 'my-package' },
					suggestions: [
						{
							messageId: 'renameTo',
							data: { suggestedName: 'aura-nodes-my-package' },
							output: '{ "name": "aura-nodes-my-package", "version": "1.0.0" }',
						},
					],
				},
			],
		},
		{
			name: 'invalid package name - missing nodes',
			filename: 'package.json',
			code: '{ "name": "aura-example", "version": "1.0.0" }',
			errors: [
				{
					messageId: 'invalidPackageName',
					data: { packageName: 'aura-example' },
					suggestions: [
						{
							messageId: 'renameTo',
							data: { suggestedName: 'aura-nodes-example' },
							output: '{ "name": "aura-nodes-example", "version": "1.0.0" }',
						},
					],
				},
			],
		},
		{
			name: 'invalid scoped package name',
			filename: 'package.json',
			code: '{ "name": "@company/example-nodes", "version": "1.0.0" }',
			errors: [
				{
					messageId: 'invalidPackageName',
					data: { packageName: '@company/example-nodes' },
					suggestions: [
						{
							messageId: 'renameTo',
							data: { suggestedName: '@company/aura-nodes-example' },
							output: '{ "name": "@company/aura-nodes-example", "version": "1.0.0" }',
						},
					],
				},
			],
		},
		{
			name: 'invalid package name - wrong order',
			filename: 'package.json',
			code: '{ "name": "nodes-aura-example", "version": "1.0.0" }',
			errors: [
				{
					messageId: 'invalidPackageName',
					data: { packageName: 'nodes-aura-example' },
					suggestions: [
						{
							messageId: 'renameTo',
							data: { suggestedName: 'aura-nodes-example' },
							output: '{ "name": "aura-nodes-example", "version": "1.0.0" }',
						},
					],
				},
			],
		},
		{
			name: 'empty package name',
			filename: 'package.json',
			code: '{ "name": "", "version": "1.0.0" }',
			errors: [
				{
					messageId: 'invalidPackageName',
					data: { packageName: '' },
					suggestions: [],
				},
			],
		},
		{
			name: 'incomplete package name with missing suffix',
			filename: 'package.json',
			code: '{ "name": "aura-nodes-", "version": "1.0.0" }',
			errors: [
				{
					messageId: 'invalidPackageName',
					data: { packageName: 'aura-nodes-' },
					suggestions: [],
				},
			],
		},
		{
			name: 'incomplete scoped package name with missing suffix',
			filename: 'package.json',
			code: '{ "name": "@company/aura-nodes-", "version": "1.0.0" }',
			errors: [
				{
					messageId: 'invalidPackageName',
					data: { packageName: '@company/aura-nodes-' },
					suggestions: [],
				},
			],
		},
	],
});
