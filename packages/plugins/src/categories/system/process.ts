/**
 * @system/process Plugin
 *
 * Monitor system processes
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@system/process',
	version: '1.0.0',
	category: 'system',
	description: 'Monitor system processes',
	tags: ['process', 'system', 'monitor'],
};

export class SystemProcessPlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'list',
			displayName: 'List Processes',
			description: 'List all running processes',
			operation: 'list',
			properties: [],
		},
		{
			name: 'getProcessInfo',
			displayName: 'Get Process Info',
			description: 'Get information about a specific process',
			operation: 'getProcessInfo',
			properties: [{ name: 'pid', displayName: 'Process ID', type: 'number', required: true }],
		},
		{
			name: 'kill',
			displayName: 'Kill Process',
			description: 'Kill a process by PID',
			operation: 'kill',
			properties: [
				{ name: 'pid', displayName: 'Process ID', type: 'number', required: true },
				{
					name: 'signal',
					displayName: 'Signal',
					type: 'string',
					default: 'SIGTERM',
					description: 'Signal to send (SIGTERM, SIGKILL)',
				},
			],
		},
	];

	protected async executeDarwin(params: ExecuteParams): Promise<any> {
		throw new Error('Process management requires ps-list library. Not yet implemented.');
	}

	protected async executeWindows(params: ExecuteParams): Promise<any> {
		throw new Error('Process management requires ps-list library. Not yet implemented.');
	}

	protected async executeLinux(params: ExecuteParams): Promise<any> {
		throw new Error('Process management requires ps-list library. Not yet implemented.');
	}
}
