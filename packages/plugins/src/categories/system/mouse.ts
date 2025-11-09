/**
 * @system/mouse Plugin
 *
 * Mouse automation
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@system/mouse',
	version: '1.0.0',
	category: 'system',
	description: 'Mouse automation',
	tags: ['mouse', 'system', 'automation', 'input'],
};

export class SystemMousePlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'move',
			displayName: 'Move Mouse',
			description: 'Move mouse to coordinates',
			operation: 'move',
			properties: [
				{ name: 'x', displayName: 'X', type: 'number', required: true },
				{ name: 'y', displayName: 'Y', type: 'number', required: true },
			],
		},
		{
			name: 'click',
			displayName: 'Click Mouse',
			description: 'Click mouse button',
			operation: 'click',
			properties: [
				{
					name: 'button',
					displayName: 'Button',
					type: 'options',
					default: 'left',
					options: [
						{ name: 'Left', value: 'left' },
						{ name: 'Right', value: 'right' },
						{ name: 'Middle', value: 'middle' },
					],
				},
				{ name: 'x', displayName: 'X', type: 'number' },
				{ name: 'y', displayName: 'Y', type: 'number' },
			],
		},
		{
			name: 'drag',
			displayName: 'Drag Mouse',
			description: 'Drag mouse from one point to another',
			operation: 'drag',
			properties: [
				{ name: 'fromX', displayName: 'From X', type: 'number', required: true },
				{ name: 'fromY', displayName: 'From Y', type: 'number', required: true },
				{ name: 'toX', displayName: 'To X', type: 'number', required: true },
				{ name: 'toY', displayName: 'To Y', type: 'number', required: true },
			],
		},
	];

	protected async executeDarwin(_params: ExecuteParams): Promise<any> {
		// Would use robotjs or similar library
		throw new Error('Mouse automation requires robotjs library. Not yet implemented.');
	}

	protected async executeWindows(_params: ExecuteParams): Promise<any> {
		throw new Error('Mouse automation requires robotjs library. Not yet implemented.');
	}

	protected async executeLinux(_params: ExecuteParams): Promise<any> {
		throw new Error('Mouse automation requires robotjs library. Not yet implemented.');
	}
}
