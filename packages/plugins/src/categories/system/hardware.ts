/**
 * @system/hardware Plugin
 *
 * Access GPU, CPU, RAM stats
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@system/hardware',
	version: '1.0.0',
	category: 'system',
	description: 'Access GPU, CPU, RAM stats',
	tags: ['hardware', 'system', 'gpu', 'cpu', 'ram', 'stats'],
};

export class SystemHardwarePlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'getCPUInfo',
			displayName: 'Get CPU Info',
			description: 'Get CPU information and usage',
			operation: 'getCPUInfo',
			properties: [],
		},
		{
			name: 'getMemoryInfo',
			displayName: 'Get Memory Info',
			description: 'Get RAM/memory information',
			operation: 'getMemoryInfo',
			properties: [],
		},
		{
			name: 'getGPUInfo',
			displayName: 'Get GPU Info',
			description: 'Get GPU information',
			operation: 'getGPUInfo',
			properties: [],
		},
		{
			name: 'getSystemInfo',
			displayName: 'Get System Info',
			description: 'Get complete system information',
			operation: 'getSystemInfo',
			properties: [],
		},
	];

	protected async executeDarwin(params: ExecuteParams): Promise<any> {
		throw new Error('Hardware access requires system-info library. Not yet implemented.');
	}

	protected async executeWindows(params: ExecuteParams): Promise<any> {
		throw new Error('Hardware access requires system-info library. Not yet implemented.');
	}

	protected async executeLinux(params: ExecuteParams): Promise<any> {
		throw new Error('Hardware access requires system-info library. Not yet implemented.');
	}
}
