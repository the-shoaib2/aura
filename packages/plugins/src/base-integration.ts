/**
 * Base Integration Class
 *
 * Provides a base class for all integrations with common functionality
 */

import type {
	AuraIntegration,
	IntegrationConfig,
	ExecuteParams,
	IntegrationMetadata,
	ActionDefinition,
	TriggerDefinition,
	CredentialDefinition,
	ExecutionResult,
} from './integration.types';

// Re-export types for use in other modules
export type { ExecuteParams, IntegrationMetadata, IntegrationConfig, ExecutionResult };
import { createLogger } from '@aura/utils';

const logger = createLogger();

export abstract class BaseIntegration implements AuraIntegration {
	abstract metadata: IntegrationMetadata;
	abstract actions?: ActionDefinition[];
	triggers?: TriggerDefinition[];
	credentials?: CredentialDefinition[];

	protected config?: IntegrationConfig;
	protected initialized = false;

	/**
	 * Initialize the integration
	 */
	async init(config: IntegrationConfig): Promise<void> {
		this.config = config;
		this.initialized = true;
		logger.debug(`Initialized integration: ${this.metadata.name}`, {
			category: this.metadata.category,
			version: this.metadata.version,
		});
	}

	/**
	 * Execute an action or trigger
	 */
	async execute(params: ExecuteParams): Promise<ExecutionResult> {
		if (!this.initialized) {
			await this.init(params.credentials || {});
		}

		const startTime = Date.now();

		try {
			// Validate parameters
			if (!this.validate(params)) {
				throw new Error('Invalid parameters');
			}

			// Execute the action
			const result = await this.executeAction(params);

			return {
				success: true,
				data: result,
				metadata: {
					executionTime: Date.now() - startTime,
				},
			};
		} catch (error) {
			logger.error(`Execution error in ${this.metadata.name}`, {
				error: error instanceof Error ? error.message : 'Unknown error',
				params,
			});

			return {
				success: false,
				error: {
					message: error instanceof Error ? error.message : 'Unknown error',
					code: 'EXECUTION_ERROR',
				},
				metadata: {
					executionTime: Date.now() - startTime,
				},
			};
		}
	}

	/**
	 * Validate parameters
	 */
	validate(params: any): boolean {
		// Override in subclasses for custom validation
		return true;
	}

	/**
	 * Execute action - to be implemented by subclasses
	 */
	protected abstract executeAction(params: ExecuteParams): Promise<any>;

	/**
	 * Cleanup resources
	 */
	async cleanup(): Promise<void> {
		this.initialized = false;
		this.config = undefined;
		logger.debug(`Cleaned up integration: ${this.metadata.name}`);
	}

	/**
	 * Get action definition by name
	 */
	protected getAction(actionName: string): ActionDefinition | undefined {
		return this.actions?.find((action) => action.name === actionName);
	}

	/**
	 * Get trigger definition by name
	 */
	protected getTrigger(triggerName: string): TriggerDefinition | undefined {
		return this.triggers?.find((trigger) => trigger.name === triggerName);
	}

	/**
	 * Get credential definition by name
	 */
	protected getCredential(credentialName: string): CredentialDefinition | undefined {
		return this.credentials?.find((credential) => credential.name === credentialName);
	}
}
