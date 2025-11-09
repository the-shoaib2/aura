/**
 * @system/power Plugin
 *
 * Sleep, restart, shutdown
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@system/power',
	version: '1.0.0',
	category: 'system',
	description: 'Sleep, restart, shutdown',
	tags: ['power', 'system', 'sleep', 'restart', 'shutdown'],
};

export class SystemPowerPlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'sleep',
			displayName: 'Sleep System',
			description: 'Put system to sleep',
			operation: 'sleep',
			properties: [],
		},
		{
			name: 'restart',
			displayName: 'Restart System',
			description: 'Restart the system',
			operation: 'restart',
			properties: [
				{
					name: 'delay',
					displayName: 'Delay (seconds)',
					type: 'number',
					default: 0,
					description: 'Delay before restart',
				},
			],
		},
		{
			name: 'shutdown',
			displayName: 'Shutdown System',
			description: 'Shutdown the system',
			operation: 'shutdown',
			properties: [
				{
					name: 'delay',
					displayName: 'Delay (seconds)',
					type: 'number',
					default: 0,
					description: 'Delay before shutdown',
				},
			],
		},
	];

	protected async executeDarwin(params: ExecuteParams): Promise<any> {
		throw new Error('Power control requires platform-specific commands. Not yet implemented.');
	}

	protected async executeWindows(params: ExecuteParams): Promise<any> {
		throw new Error('Power control requires platform-specific commands. Not yet implemented.');
	}

	protected async executeLinux(params: ExecuteParams): Promise<any> {
		throw new Error('Power control requires platform-specific commands. Not yet implemented.');
	}
}
