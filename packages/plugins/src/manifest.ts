/**
 * Plugin Manifest Exports
 *
 * Exports the plugin manifest system for AURA
 */

export * from './plugin-manifest.types';
export { ManifestLoader, manifestLoader } from './manifest-loader';
export { generateAllPluginManifests } from './plugin-manifest-generator';

// Load and export the default manifest
import { ManifestLoader } from './manifest-loader';
import * as path from 'path';
import * as fs from 'fs';

let defaultManifestLoader: ManifestLoader | null = null;

/**
 * Get the default manifest loader
 */
export async function getDefaultManifestLoader(): Promise<ManifestLoader> {
	if (!defaultManifestLoader) {
		defaultManifestLoader = new ManifestLoader();
		const manifestPath = path.join(__dirname, '../../manifests/plugin-manifest.json');
		if (fs.existsSync(manifestPath)) {
			await defaultManifestLoader.loadRegistry(manifestPath);
		}
	}
	return defaultManifestLoader;
}
