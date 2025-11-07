/**
 * Integration Types for AURA Plugin System
 *
 * Defines the core interfaces and types for building 1.5k+ integrations
 */

export interface IntegrationConfig {
	credentials?: Record<string, any>;
	settings?: Record<string, any>;
	[key: string]: any;
}

export interface ExecuteParams {
	action: string;
	resource?: string;
	operation?: string;
	parameters: Record<string, any>;
	inputData?: any[];
	credentials?: Record<string, any>;
}

export interface TriggerDefinition {
	name: string;
	displayName: string;
	description: string;
	type: 'webhook' | 'poll' | 'manual' | 'schedule';
	properties?: PropertyDefinition[];
	webhook?: WebhookDefinition;
	poll?: PollDefinition;
}

export interface ActionDefinition {
	name: string;
	displayName: string;
	description: string;
	resource?: string;
	operation: string;
	properties?: PropertyDefinition[];
	outputSchema?: SchemaDefinition;
}

export interface PropertyDefinition {
	name: string;
	displayName: string;
	type: 'string' | 'number' | 'boolean' | 'options' | 'multiOptions' | 'json' | 'array';
	required?: boolean;
	default?: any;
	description?: string;
	options?: PropertyOption[];
	validation?: ValidationRule[];
}

export interface PropertyOption {
	name: string;
	value: string;
}

export interface ValidationRule {
	type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
	value?: any;
	message?: string;
}

export interface SchemaDefinition {
	type: 'object' | 'array' | 'string' | 'number' | 'boolean';
	properties?: Record<string, SchemaDefinition>;
	items?: SchemaDefinition;
}

export interface WebhookDefinition {
	path: string;
	httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	responseMode?: 'responseNode' | 'lastNode' | 'responseBinary' | 'usingItems';
	authentication?: 'none' | 'headerAuth' | 'queryAuth' | 'basicAuth' | 'oAuth2';
}

export interface PollDefinition {
	interval: number; // seconds
	mode: 'manual' | 'continuous';
}

export interface CredentialDefinition {
	name: string;
	displayName: string;
	type: 'apiKey' | 'oAuth2' | 'basicAuth' | 'headerAuth' | 'queryAuth' | 'custom';
	properties: PropertyDefinition[];
	test?: (credentials: Record<string, any>) => Promise<boolean>;
}

export interface IntegrationMetadata {
	name: string;
	version: string;
	category: string;
	description: string;
	icon?: string;
	tags?: string[];
	author?: string;
	homepage?: string;
	documentation?: string;
	changelog?: string;
}

/**
 * Core Integration Interface
 *
 * All integrations must implement this interface
 */
export interface AuraIntegration {
	// Metadata
	metadata: IntegrationMetadata;

	// Capabilities
	triggers?: TriggerDefinition[];
	actions?: ActionDefinition[];
	credentials?: CredentialDefinition[];

	// Lifecycle methods
	init?(config: IntegrationConfig): Promise<void>;
	execute?(params: ExecuteParams): Promise<any>;
	validate?(params: any): boolean;
	cleanup?(): Promise<void>;

	// Optional methods
	loadOptions?: (property: string, context?: any) => Promise<PropertyOption[]>;
	loadOptionsMethod?: Record<string, (context?: any) => Promise<PropertyOption[]>>;
}

/**
 * Integration Execution Result
 */
export interface ExecutionResult {
	success: boolean;
	data?: any;
	error?: {
		message: string;
		code?: string;
		details?: any;
	};
	metadata?: {
		executionTime: number;
		requestId?: string;
		[key: string]: any;
	};
}

/**
 * Integration Registry Entry
 */
export interface RegistryEntry {
	integration: AuraIntegration;
	loaded: boolean;
	initialized: boolean;
	loadTime?: number;
	error?: string;
}

/**
 * Integration Category
 */
export interface IntegrationCategory {
	name: string;
	displayName: string;
	description: string;
	icon?: string;
	integrations: string[]; // Integration names
}
