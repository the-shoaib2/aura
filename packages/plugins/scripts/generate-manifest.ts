#!/usr/bin/env ts-node
/**
 * Generate Plugin Manifest
 *
 * Generates the complete plugin manifest JSON file with all 200+ plugins
 */

import { generateAllPluginManifests } from '../src/plugin-manifest-generator';
import * as path from 'path';
import * as fs from 'fs';

const manifestPath = path.join(__dirname, '../manifests/plugin-manifest.json');

async function main() {
	console.log('🚀 Generating plugin manifest...');

	// Generate all plugin manifests
	const registry = generateAllPluginManifests();

	// Save directly to file
	fs.writeFileSync(manifestPath, JSON.stringify(registry, null, 2), 'utf-8');

	console.log(`✅ Generated manifest with ${registry.totalPlugins} plugins`);
	console.log(`📁 Saved to: ${manifestPath}`);
	console.log(`📊 Categories: ${Object.keys(registry.categories).length}`);

	// Print category breakdown
	console.log('\n📦 Plugin breakdown by category:');
	for (const [, info] of Object.entries(registry.categories)) {
		console.log(`  ${info.displayName}: ${info.count} plugins`);
	}
}

main().catch(console.error);
