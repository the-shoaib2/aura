/**
 * Integration Registry
 *
 * Manages all available integrations in the AURA platform
 * Supports 1.5k+ integrations with efficient lookup and categorization
 */

import type { AuraIntegration, RegistryEntry, IntegrationCategory } from './integration.types';
import { createLogger } from '@aura/utils';

const logger = createLogger();

export class IntegrationRegistry {
	private integrations: Map<string, RegistryEntry> = new Map();
	private categories: Map<string, IntegrationCategory> = new Map();
	private initialized = false;

	/**
	 * Register an integration
	 */
	register(integration: AuraIntegration): void {
		const entry: RegistryEntry = {
			integration,
			loaded: true,
			initialized: false,
			loadTime: Date.now(),
		};

		this.integrations.set(integration.metadata.name, entry);

		// Update category
		this.addToCategory(integration.metadata.category, integration.metadata.name);

		logger.info(`Registered integration: ${integration.metadata.name}`, {
			category: integration.metadata.category,
			version: integration.metadata.version,
		});
	}

	/**
	 * Get an integration by name
	 */
	get(name: string): AuraIntegration | undefined {
		const entry = this.integrations.get(name);
		return entry?.integration;
	}

	/**
	 * Get registry entry (includes metadata)
	 */
	getEntry(name: string): RegistryEntry | undefined {
		return this.integrations.get(name);
	}

	/**
	 * Get all integrations
	 */
	getAll(): AuraIntegration[] {
		return Array.from(this.integrations.values())
			.map((entry) => entry.integration)
			.filter(Boolean);
	}

	/**
	 * Get integrations by category
	 */
	getByCategory(category: string): AuraIntegration[] {
		return Array.from(this.integrations.values())
			.map((entry) => entry.integration)
			.filter((integration) => integration.metadata.category === category);
	}

	/**
	 * Get integrations by tag
	 */
	getByTag(tag: string): AuraIntegration[] {
		return Array.from(this.integrations.values())
			.map((entry) => entry.integration)
			.filter((integration) => integration.metadata.tags?.includes(tag));
	}

	/**
	 * Search integrations
	 */
	search(query: string): AuraIntegration[] {
		const lowerQuery = query.toLowerCase();
		return Array.from(this.integrations.values())
			.map((entry) => entry.integration)
			.filter((integration) => {
				const name = integration.metadata.name.toLowerCase();
				const description = integration.metadata.description.toLowerCase();
				const category = integration.metadata.category.toLowerCase();
				const tags = integration.metadata.tags?.join(' ').toLowerCase() || '';

				return (
					name.includes(lowerQuery) ||
					description.includes(lowerQuery) ||
					category.includes(lowerQuery) ||
					tags.includes(lowerQuery)
				);
			});
	}

	/**
	 * Initialize an integration
	 */
	async initialize(name: string, config?: any): Promise<void> {
		const entry = this.integrations.get(name);
		if (!entry) {
			throw new Error(`Integration not found: ${name}`);
		}

		if (entry.initialized) {
			return;
		}

		try {
			if (entry.integration.init) {
				await entry.integration.init(config || {});
			}
			entry.initialized = true;
			logger.info(`Initialized integration: ${name}`);
		} catch (error) {
			entry.error = error instanceof Error ? error.message : 'Unknown error';
			logger.error(`Failed to initialize integration: ${name}`, { error });
			throw error;
		}
	}

	/**
	 * Execute an integration action
	 */
	async execute(name: string, params: any): Promise<any> {
		const entry = this.integrations.get(name);
		if (!entry) {
			throw new Error(`Integration not found: ${name}`);
		}

		if (!entry.initialized && entry.integration.init) {
			await this.initialize(name);
		}

		if (!entry.integration.execute) {
			throw new Error(`Integration does not support execution: ${name}`);
		}

		try {
			return await entry.integration.execute(params);
		} catch (error) {
			logger.error(`Execution failed for integration: ${name}`, { error, params });
			throw error;
		}
	}

	/**
	 * Add integration to category
	 */
	private addToCategory(categoryName: string, integrationName: string): void {
		if (!this.categories.has(categoryName)) {
			this.categories.set(categoryName, {
				name: categoryName,
				displayName: this.formatCategoryName(categoryName),
				description: '',
				integrations: [],
			});
		}

		const category = this.categories.get(categoryName)!;
		if (!category.integrations.includes(integrationName)) {
			category.integrations.push(integrationName);
		}
	}

	/**
	 * Get all categories
	 */
	getCategories(): IntegrationCategory[] {
		return Array.from(this.categories.values());
	}

	/**
	 * Get category by name
	 */
	getCategory(name: string): IntegrationCategory | undefined {
		return this.categories.get(name);
	}

	/**
	 * Get integration count
	 */
	getCount(): number {
		return this.integrations.size;
	}

	/**
	 * Get statistics
	 */
	getStats(): {
		total: number;
		byCategory: Record<string, number>;
		initialized: number;
		errors: number;
	} {
		const stats = {
			total: this.integrations.size,
			byCategory: {} as Record<string, number>,
			initialized: 0,
			errors: 0,
		};

		for (const entry of this.integrations.values()) {
			const category = entry.integration.metadata.category;
			stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

			if (entry.initialized) {
				stats.initialized++;
			}

			if (entry.error) {
				stats.errors++;
			}
		}

		return stats;
	}

	/**
	 * Format category name for display
	 */
	private formatCategoryName(name: string): string {
		return name
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	/**
	 * Clear registry (for testing)
	 */
	clear(): void {
		this.integrations.clear();
		this.categories.clear();
		this.initialized = false;
	}
}

// Singleton instance
export const integrationRegistry = new IntegrationRegistry();
