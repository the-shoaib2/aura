#!/usr/bin/env ts-node
/**
 * Create Plugin Stubs
 *
 * Creates stub files for all plugins defined in the manifest
 */

import { manifestLoader } from '../src/manifest-loader';
import type { PluginManifest } from '../src/plugin-manifest.types';
import * as fs from 'fs';
import * as path from 'path';

const manifestsPath = path.join(__dirname, '../manifests/plugin-manifest.json');
const srcPath = path.join(__dirname, '../src');

async function main() {
	console.log('🚀 Creating plugin stubs...');

	// Load manifest
	await manifestLoader.loadRegistry(manifestsPath);
	const registry = manifestLoader.getRegistry();

	if (!registry) {
		throw new Error('Failed to load manifest registry');
	}

	let created = 0;
	let skipped = 0;

	// Create stubs for all plugins
	for (const [pluginName, manifest] of Object.entries(registry.plugins)) {
		const filePath = path.join(srcPath, manifest.entry.main);
		const dirPath = path.dirname(filePath);

		// Check if file already exists
		if (fs.existsSync(filePath)) {
			console.log(`⏭️  Skipping ${pluginName} (already exists)`);
			skipped++;
			continue;
		}

		// Create directory if it doesn't exist
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		}

		// Generate stub content
		const stubContent = generatePluginStub(manifest);

		// Write stub file
		fs.writeFileSync(filePath, stubContent, 'utf-8');
		console.log(`✅ Created ${pluginName} → ${filePath}`);
		created++;
	}

	console.log(`\n📊 Summary:`);
	console.log(`  Created: ${created} plugins`);
	console.log(`  Skipped: ${skipped} plugins`);
	console.log(`  Total: ${created + skipped} plugins`);
}

function generatePluginStub(manifest: PluginManifest): string {
	const [category, pluginName] = manifest.metadata.name.replace('@', '').split('/');
	const className = formatClassName(pluginName, category);

	// Determine base class based on category
	let baseClass = 'BaseIntegration';
	let importStatement =
		"import { BaseIntegration, type ExecuteParams, type IntegrationMetadata } from '../../base-integration';\n";

	if (category === 'system') {
		baseClass = 'BaseSystemPlugin';
		importStatement =
			"import { BaseSystemPlugin } from './base-system-plugin';\nimport { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';\nimport { ExecuteParams } from '../../base-integration';\n";
	}

	return `/**
 * ${manifest.metadata.name} Plugin
 *
 * ${manifest.metadata.description}
 */

${importStatement}

const metadata: IntegrationMetadata = {
  name: '${manifest.metadata.name}',
  version: '${manifest.metadata.version}',
  category: '${manifest.metadata.category}',
  description: '${manifest.metadata.description}',
  tags: ${JSON.stringify(manifest.metadata.tags || [])},
};

export class ${className} extends ${baseClass} {
  metadata = metadata;
  triggers?: undefined;
  credentials?: undefined;

  actions: ActionDefinition[] = [
    // TODO: Define actions
  ];

  ${category === 'system' ? generateSystemPluginMethods(manifest) : generateIntegrationPluginMethods(manifest)}
}

`;
}

function generateSystemPluginMethods(manifest: PluginManifest): string {
	return `protected async executeDarwin(_params: ExecuteParams): Promise<any> {
    // TODO: Implement macOS specific logic
    throw new Error('${manifest.metadata.name} is not yet implemented for macOS.');
  }

  protected async executeWindows(_params: ExecuteParams): Promise<any> {
    // TODO: Implement Windows specific logic
    throw new Error('${manifest.metadata.name} is not yet implemented for Windows.');
  }

  protected async executeLinux(_params: ExecuteParams): Promise<any> {
    // TODO: Implement Linux specific logic
    throw new Error('${manifest.metadata.name} is not yet implemented for Linux.');
  }`;
}

function generateIntegrationPluginMethods(manifest: PluginManifest): string {
	return `protected async executeAction(params: ExecuteParams): Promise<any> {
    // TODO: Implement plugin logic
    throw new Error('${manifest.metadata.name} is not yet implemented.');
  }`;
}

function formatClassName(pluginName: string, category: string): string {
	const parts = pluginName.split('-');
	const classNameParts = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1));
	const categoryPart = category.charAt(0).toUpperCase() + category.slice(1);
	return `${categoryPart}${classNameParts.join('')}Plugin`;
}

main().catch(console.error);
