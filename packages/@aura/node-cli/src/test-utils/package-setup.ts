import fs from 'node:fs/promises';

import type { N8nPackageJson } from '../utils/package';

export interface PackageSetupOptions {
	packageJson?: Partial<N8nPackageJson>;
	eslintConfig?: string | boolean;
}

const DEFAULT_PACKAGE_CONFIG: N8nPackageJson = {
	name: 'test-node',
	version: '1.0.0',
	aura: {
		nodes: ['dist/nodes/TestNode.node.js'],
		strict: true,
	},
};

const DEFAULT_ESLINT_CONFIG =
	"import { config } from '@aura/node-cli/eslint';\n\nexport default config;\n";

export async function setupTestPackage(
	tmpdir: string,
	options: PackageSetupOptions = {},
): Promise<void> {
	const packageConfig = {
		...DEFAULT_PACKAGE_CONFIG,
		...options.packageJson,
		aura: {
			...DEFAULT_PACKAGE_CONFIG.aura,
			...options.packageJson?.aura,
		},
	};
	await fs.writeFile(`${tmpdir}/package.json`, JSON.stringify(packageConfig, null, 2));

	if (options.eslintConfig === true) {
		await fs.writeFile(`${tmpdir}/eslint.config.mjs`, DEFAULT_ESLINT_CONFIG);
	} else if (typeof options.eslintConfig === 'string') {
		await fs.writeFile(`${tmpdir}/eslint.config.mjs`, options.eslintConfig);
	}
}
