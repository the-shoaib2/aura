/**
 * @system/update Plugin
 *
 * Auto-update & patch installer
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@system/update',
	version: '1.0.0',
	category: 'system',
	description: 'Auto-update & patch installer',
	tags: ['update', 'system', 'patch', 'installer'],
};

export class SystemUpdatePlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'checkForUpdates',
			displayName: 'Check for Updates',
			description: 'Check if updates are available',
			operation: 'checkForUpdates',
			properties: [],
		},
		{
			name: 'downloadUpdate',
			displayName: 'Download Update',
			description: 'Download available update',
			operation: 'downloadUpdate',
			properties: [
				{
					name: 'version',
					displayName: 'Version',
					type: 'string',
					description: 'Specific version to download',
				},
			],
		},
		{
			name: 'installUpdate',
			displayName: 'Install Update',
			description: 'Install downloaded update',
			operation: 'installUpdate',
			properties: [],
		},
		{
			name: 'installPatch',
			displayName: 'Install Patch',
			description: 'Install a patch file',
			operation: 'installPatch',
			properties: [
				{
					name: 'patchPath',
					displayName: 'Patch Path',
					type: 'string',
					required: true,
					description: 'Path to patch file',
				},
			],
		},
	];

	protected async executeDarwin(params: ExecuteParams): Promise<any> {
		throw new Error('Auto-update requires electron-updater or similar. Not yet implemented.');
	}

	protected async executeWindows(params: ExecuteParams): Promise<any> {
		throw new Error('Auto-update requires electron-updater or similar. Not yet implemented.');
	}

	protected async executeLinux(params: ExecuteParams): Promise<any> {
		throw new Error('Auto-update requires electron-updater or similar. Not yet implemented.');
	}
}
