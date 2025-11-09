/**
 * Plugin Manifest Loader
 *
 * Loads and validates plugin manifests from JSON files
 */

import type {
	PluginManifest,
	PluginManifestRegistry,
	ManifestValidationResult,
} from './plugin-manifest.types';
import { createLogger } from '@aura/utils';
import * as fs from 'fs';

const logger = createLogger();

export class ManifestLoader {
	private registry: PluginManifestRegistry | null = null;
	private manifests: Map<string, PluginManifest> = new Map();

	/**
	 * Load manifest registry from file
	 */
	async loadRegistry(manifestPath: string): Promise<PluginManifestRegistry> {
		try {
			const content = fs.readFileSync(manifestPath, 'utf-8');
			this.registry = JSON.parse(content) as PluginManifestRegistry;

			// Load all plugin manifests
			for (const [pluginName, manifest] of Object.entries(this.registry.plugins)) {
				this.manifests.set(pluginName, manifest);
			}

			logger.info(`Loaded plugin manifest registry`, {
				totalPlugins: this.registry.totalPlugins,
				categories: Object.keys(this.registry.categories).length,
			});

			return this.registry;
		} catch (error) {
			logger.error(`Failed to load manifest registry`, { error, path: manifestPath });
			throw error;
		}
	}

	/**
	 * Get manifest for a plugin
	 */
	getManifest(pluginName: string): PluginManifest | undefined {
		return this.manifests.get(pluginName);
	}

	/**
	 * Get all manifests
	 */
	getAllManifests(): PluginManifest[] {
		return Array.from(this.manifests.values());
	}

	/**
	 * Get manifests by category
	 */
	getManifestsByCategory(category: string): PluginManifest[] {
		return Array.from(this.manifests.values()).filter(
			(manifest) => manifest.metadata.category === category,
		);
	}

	/**
	 * Get registry
	 */
	getRegistry(): PluginManifestRegistry | null {
		return this.registry;
	}

	/**
	 * Validate a plugin manifest
	 */
	validateManifest(manifest: PluginManifest): ManifestValidationResult {
		const errors: Array<{ field: string; message: string; code: string }> = [];
		const warnings: Array<{ field: string; message: string; code: string }> = [];

		// Validate required fields
		if (!manifest.metadata) {
			errors.push({ field: 'metadata', message: 'Metadata is required', code: 'MISSING_METADATA' });
		} else {
			if (!manifest.metadata.name) {
				errors.push({
					field: 'metadata.name',
					message: 'Plugin name is required',
					code: 'MISSING_NAME',
				});
			}
			if (!manifest.metadata.version) {
				errors.push({
					field: 'metadata.version',
					message: 'Plugin version is required',
					code: 'MISSING_VERSION',
				});
			}
			if (!manifest.metadata.category) {
				errors.push({
					field: 'metadata.category',
					message: 'Plugin category is required',
					code: 'MISSING_CATEGORY',
				});
			}
			if (!manifest.metadata.description) {
				errors.push({
					field: 'metadata.description',
					message: 'Plugin description is required',
					code: 'MISSING_DESCRIPTION',
				});
			}
		}

		if (!manifest.entry) {
			errors.push({ field: 'entry', message: 'Entry point is required', code: 'MISSING_ENTRY' });
		} else {
			if (!manifest.entry.main) {
				errors.push({
					field: 'entry.main',
					message: 'Main entry point is required',
					code: 'MISSING_MAIN_ENTRY',
				});
			}
		}

		if (!manifest.permissions || manifest.permissions.length === 0) {
			warnings.push({
				field: 'permissions',
				message: 'No permissions defined',
				code: 'NO_PERMISSIONS',
			});
		}

		// Validate version format
		if (manifest.metadata?.version && !/^\d+\.\d+\.\d+/.test(manifest.metadata.version)) {
			warnings.push({
				field: 'metadata.version',
				message: 'Version should follow semantic versioning',
				code: 'INVALID_VERSION_FORMAT',
			});
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
		};
	}

	/**
	 * Add or update a manifest
	 */
	addManifest(manifest: PluginManifest): void {
		const validation = this.validateManifest(manifest);
		if (!validation.valid) {
			throw new Error(
				`Invalid manifest for ${manifest.metadata.name}: ${validation.errors.map((e) => e.message).join(', ')}`,
			);
		}

		this.manifests.set(manifest.metadata.name, manifest);

		// Update registry if it exists
		if (this.registry) {
			this.registry.plugins[manifest.metadata.name] = manifest;
			this.registry.totalPlugins = this.manifests.size;

			// Update category count
			const category = manifest.metadata.category;
			if (this.registry.categories[category]) {
				if (!this.registry.categories[category].plugins.includes(manifest.metadata.name)) {
					this.registry.categories[category].plugins.push(manifest.metadata.name);
					this.registry.categories[category].count =
						this.registry.categories[category].plugins.length;
				}
			}
		}
	}

	/**
	 * Save registry to file
	 */
	async saveRegistry(manifestPath: string): Promise<void> {
		if (!this.registry) {
			throw new Error('No registry loaded');
		}

		// Update totals
		this.registry.totalPlugins = this.manifests.size;
		this.registry.generatedAt = new Date().toISOString();

		// Update category counts
		for (const category of Object.values(this.registry.categories)) {
			category.count = category.plugins.length;
		}

		try {
			const content = JSON.stringify(this.registry, null, 2);
			fs.writeFileSync(manifestPath, content, 'utf-8');
			logger.info(`Saved plugin manifest registry`, {
				path: manifestPath,
				totalPlugins: this.registry.totalPlugins,
			});
		} catch (error) {
			logger.error(`Failed to save manifest registry`, { error, path: manifestPath });
			throw error;
		}
	}

	/**
	 * Search manifests
	 */
	search(query: string): PluginManifest[] {
		const lowerQuery = query.toLowerCase();
		return Array.from(this.manifests.values()).filter((manifest) => {
			const name = manifest.metadata.name.toLowerCase();
			const description = manifest.metadata.description.toLowerCase();
			const category = manifest.metadata.category.toLowerCase();
			const tags = manifest.metadata.tags?.join(' ').toLowerCase() || '';
			const keywords = manifest.metadata.keywords?.join(' ').toLowerCase() || '';

			return (
				name.includes(lowerQuery) ||
				description.includes(lowerQuery) ||
				category.includes(lowerQuery) ||
				tags.includes(lowerQuery) ||
				keywords.includes(lowerQuery)
			);
		});
	}
}

// Singleton instance
export const manifestLoader = new ManifestLoader();
