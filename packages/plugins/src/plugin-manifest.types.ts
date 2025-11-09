/**
 * Plugin Manifest Types for AURA
 *
 * Defines the complete structure for plugin manifests that enable
 * auto-loading, permission management, and dependency resolution
 * for 200+ plugins across 21 categories.
 */

/**
 * Plugin Permission Types
 */
export type PermissionType =
	| 'file.read'
	| 'file.write'
	| 'file.delete'
	| 'network.http'
	| 'network.socket'
	| 'network.webhook'
	| 'system.process'
	| 'system.window'
	| 'system.clipboard'
	| 'system.audio'
	| 'system.notification'
	| 'system.hardware'
	| 'system.shell'
	| 'system.keyboard'
	| 'system.mouse'
	| 'system.screen'
	| 'system.power'
	| 'ai.execute'
	| 'ai.memory'
	| 'database.read'
	| 'database.write'
	| 'crypto.encrypt'
	| 'crypto.decrypt'
	| 'iot.device'
	| 'cloud.deploy'
	| 'security.auth'
	| 'security.vault'
	| 'security.sandbox'
	| 'security.permission'
	| 'security.audit'
	| 'security.network'
	| 'security.antivirus'
	| 'security.ai-guardian'
	| 'custom';

/**
 * Platform Support
 */
export type Platform = 'darwin' | 'win32' | 'linux' | 'all';
export type Architecture = 'x64' | 'arm64' | 'all';

/**
 * Plugin Type
 */
export type PluginType = 'system' | 'integration' | 'ai' | 'utility' | 'experimental';

/**
 * Plugin Status
 */
export type PluginStatus = 'stable' | 'beta' | 'alpha' | 'experimental' | 'deprecated';

/**
 * Dependency Type
 */
export interface PluginDependency {
	name: string;
	version: string;
	type: 'npm' | 'system' | 'plugin' | 'native';
	optional?: boolean;
	description?: string;
}

/**
 * Permission Definition
 */
export interface PermissionDefinition {
	type: PermissionType;
	description: string;
	required: boolean;
	scope?: string;
	reason?: string;
}

/**
 * Plugin Entry Point
 */
export interface PluginEntry {
	main: string;
	types?: string;
	browser?: string;
	module?: string;
	exports?: Record<string, string>;
}

/**
 * Plugin API Surface
 */
export interface PluginAPI {
	actions?: string[];
	triggers?: string[];
	credentials?: string[];
	events?: string[];
	methods?: string[];
}

/**
 * Plugin Runtime Configuration
 */
export interface PluginRuntime {
	sandbox?: boolean;
	timeout?: number;
	memoryLimit?: number;
	cpuLimit?: number;
	networkAccess?: boolean;
	fileSystemAccess?: boolean;
	isolation?: 'strict' | 'moderate' | 'permissive';
}

/**
 * Plugin Metadata
 */
export interface PluginManifestMetadata {
	name: string;
	displayName: string;
	version: string;
	description: string;
	category: string;
	type: PluginType;
	status: PluginStatus;
	author?: string;
	homepage?: string;
	repository?: string;
	documentation?: string;
	changelog?: string;
	license?: string;
	icon?: string;
	banner?: string;
	tags?: string[];
	keywords?: string[];
	platforms?: Platform[];
	architectures?: Architecture[];
	minAuraVersion?: string;
	maxAuraVersion?: string;
}

/**
 * Plugin Configuration Schema
 */
export interface PluginConfigSchema {
	type: 'object';
	properties: Record<
		string,
		{
			type: string;
			description?: string;
			default?: any;
			required?: boolean;
			enum?: any[];
			minimum?: number;
			maximum?: number;
			pattern?: string;
		}
	>;
	required?: string[];
}

/**
 * Plugin Health Check
 */
export interface PluginHealthCheck {
	endpoint?: string;
	method?: 'GET' | 'POST';
	interval?: number;
	timeout?: number;
	retries?: number;
}

/**
 * Complete Plugin Manifest
 */
export interface PluginManifest {
	// Core metadata
	metadata: PluginManifestMetadata;

	// Entry points
	entry: PluginEntry;

	// Dependencies
	dependencies?: PluginDependency[];
	peerDependencies?: PluginDependency[];
	optionalDependencies?: PluginDependency[];

	// Permissions
	permissions: PermissionDefinition[];

	// API surface
	api?: PluginAPI;

	// Runtime configuration
	runtime?: PluginRuntime;

	// Configuration schema
	configSchema?: PluginConfigSchema;

	// Health check
	healthCheck?: PluginHealthCheck;

	// Lifecycle hooks
	hooks?: {
		preInstall?: string;
		postInstall?: string;
		preUninstall?: string;
		postUninstall?: string;
		preLoad?: string;
		postLoad?: string;
		preExecute?: string;
		postExecute?: string;
	};

	// Extension points
	extensions?: {
		workflows?: string[];
		ui?: string[];
		commands?: string[];
		events?: string[];
	};

	// Additional metadata
	screenshots?: string[];
	videos?: string[];
	examples?: Array<{
		name: string;
		description: string;
		code: string;
	}>;

	// Version info
	createdAt?: string;
	updatedAt?: string;
	deprecatedAt?: string;
	migrationGuide?: string;
}

/**
 * Plugin Manifest Registry
 */
export interface PluginManifestRegistry {
	version: string;
	generatedAt: string;
	totalPlugins: number;
	categories: Record<
		string,
		{
			name: string;
			displayName: string;
			description: string;
			plugins: string[];
			count: number;
		}
	>;
	plugins: Record<string, PluginManifest>;
}

/**
 * Plugin Manifest Validation Result
 */
export interface ManifestValidationResult {
	valid: boolean;
	errors: Array<{
		field: string;
		message: string;
		code: string;
	}>;
	warnings: Array<{
		field: string;
		message: string;
		code: string;
	}>;
}
