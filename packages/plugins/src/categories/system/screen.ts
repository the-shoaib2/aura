/**
 * @system/screen Plugin
 *
 * Screenshot, record screen
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@system/screen',
	version: '1.0.0',
	category: 'system',
	description: 'Screenshot, record screen',
	tags: ['screen', 'system', 'screenshot', 'recording'],
};

export class SystemScreenPlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'screenshot',
			displayName: 'Take Screenshot',
			description: 'Capture screenshot of screen or region',
			operation: 'screenshot',
			properties: [
				{
					name: 'path',
					displayName: 'Save Path',
					type: 'string',
					description: 'Path to save screenshot',
				},
				{ name: 'x', displayName: 'X', type: 'number', description: 'Region X coordinate' },
				{ name: 'y', displayName: 'Y', type: 'number', description: 'Region Y coordinate' },
				{ name: 'width', displayName: 'Width', type: 'number', description: 'Region width' },
				{ name: 'height', displayName: 'Height', type: 'number', description: 'Region height' },
			],
		},
		{
			name: 'startRecording',
			displayName: 'Start Screen Recording',
			description: 'Start recording screen',
			operation: 'startRecording',
			properties: [
				{
					name: 'path',
					displayName: 'Save Path',
					type: 'string',
					required: true,
					description: 'Path to save recording',
				},
				{
					name: 'fps',
					displayName: 'FPS',
					type: 'number',
					default: 30,
					description: 'Frames per second',
				},
			],
		},
		{
			name: 'stopRecording',
			displayName: 'Stop Screen Recording',
			description: 'Stop screen recording',
			operation: 'stopRecording',
			properties: [],
		},
	];

	protected async executeDarwin(params: ExecuteParams): Promise<any> {
		throw new Error(
			'Screen capture requires platform-specific libraries (screenshot-desktop, etc.). Not yet implemented.',
		);
	}

	protected async executeWindows(params: ExecuteParams): Promise<any> {
		throw new Error(
			'Screen capture requires platform-specific libraries (screenshot-desktop, etc.). Not yet implemented.',
		);
	}

	protected async executeLinux(params: ExecuteParams): Promise<any> {
		throw new Error(
			'Screen capture requires platform-specific libraries (screenshot-desktop, etc.). Not yet implemented.',
		);
	}
}
