/**
 * @system/keyboard Plugin
 *
 * Keyboard simulation
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@system/keyboard',
	version: '1.0.0',
	category: 'system',
	description: 'Keyboard simulation',
	tags: ['keyboard', 'system', 'automation', 'input'],
};

export class SystemKeyboardPlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'type',
			displayName: 'Type Text',
			description: 'Type text',
			operation: 'type',
			properties: [{ name: 'text', displayName: 'Text', type: 'string', required: true }],
		},
		{
			name: 'key',
			displayName: 'Press Key',
			description: 'Press a key or key combination',
			operation: 'key',
			properties: [
				{
					name: 'key',
					displayName: 'Key',
					type: 'string',
					required: true,
					description: 'Key name (e.g., "Enter", "Ctrl+C")',
				},
			],
		},
	];

	protected async executeDarwin(params: ExecuteParams): Promise<any> {
		throw new Error('Keyboard automation requires robotjs library. Not yet implemented.');
	}

	protected async executeWindows(params: ExecuteParams): Promise<any> {
		throw new Error('Keyboard automation requires robotjs library. Not yet implemented.');
	}

	protected async executeLinux(params: ExecuteParams): Promise<any> {
		throw new Error('Keyboard automation requires robotjs library. Not yet implemented.');
	}
}
