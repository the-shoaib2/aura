/**
 * Base System Plugin
 *
 * Provides base functionality for all system-level plugins
 * with OS detection and platform-specific implementations
 *
 * @module @aura/plugins/categories/system/base-system-plugin
 * @extends BaseIntegration
 * @implements IPlugin
 * @implements IPluginMetadata
 * @implements IPluginConfig
 * @implements IPluginExecuteParams
 * @implements IPluginExecuteResult
 * @implements IPluginExecuteError
 * @implements IPluginExecuteSuccess
 * @implements IPluginExecuteFailure
 * @implements IPluginExecuteTimeout
 * @implements IPluginExecuteCancel
 * @implements IPluginExecuteAbort
 * @implements IPluginExecuteRetry
 * @implements IPluginExecuteReschedule
 * @implements IPluginExecuteResubmit
 * @implements IPluginExecuteResend
 * @implements IPluginExecuteResend
 */

import {
	BaseIntegration,
	type ExecuteParams,
	type IntegrationMetadata,
} from '../../base-integration';
import { createLogger } from '@aura/utils';

const logger = createLogger();

export type Platform = 'darwin' | 'win32' | 'linux' | 'unknown';

/**
 * Base class for system plugins
 */
export abstract class BaseSystemPlugin extends BaseIntegration {
	abstract metadata: IntegrationMetadata;
	protected platform: Platform;
	protected isSupported: boolean;

	constructor() {
		super();
		this.platform = this.detectPlatform();
		this.isSupported = this.checkPlatformSupport();
	}

	/**
	 * Detect the current platform
	 */
	protected detectPlatform(): Platform {
		const platform = process.platform;
		if (platform === 'darwin') return 'darwin';
		if (platform === 'win32') return 'win32';
		if (platform === 'linux') return 'linux';
		return 'unknown';
	}

	/**
	 * Check if the current platform is supported
	 * Override in subclasses to specify platform requirements
	 */
	protected checkPlatformSupport(): boolean {
		// By default, support all platforms
		return this.platform !== 'unknown';
	}

	/**
	 * Validate parameters with platform support check
	 */
	validate(params: any): boolean {
		if (!this.isSupported) {
			logger.warn(`Plugin ${this.metadata.name} is not supported on platform ${this.platform}`);
			return false;
		}
		return super.validate(params);
	}

	/**
	 * Execute action with platform-specific implementation
	 */
	protected async executeAction(params: ExecuteParams): Promise<any> {
		if (!this.isSupported) {
			throw new Error(`Plugin ${this.metadata.name} is not supported on platform ${this.platform}`);
		}

		// Route to platform-specific implementation
		switch (this.platform) {
			case 'darwin':
				return this.executeDarwin(params);
			case 'win32':
				return this.executeWindows(params);
			case 'linux':
				return this.executeLinux(params);
			default:
				throw new Error(`Unsupported platform: ${this.platform}`);
		}
	}

	/**
	 * Platform-specific implementations
	 * Override these methods in subclasses
	 */
	protected abstract executeDarwin(params: ExecuteParams): Promise<any>;
	protected abstract executeWindows(params: ExecuteParams): Promise<any>;
	protected abstract executeLinux(params: ExecuteParams): Promise<any>;
}
