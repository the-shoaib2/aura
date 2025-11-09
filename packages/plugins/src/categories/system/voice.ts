/**
 * @system/voice Plugin
 *
 * Voice in/out
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@system/voice',
	version: '1.0.0',
	category: 'system',
	description: 'Voice in/out',
	tags: ['voice', 'system', 'audio', 'speech'],
};

export class SystemVoicePlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'speak',
			displayName: 'Text to Speech',
			description: 'Convert text to speech',
			operation: 'speak',
			properties: [
				{
					name: 'text',
					displayName: 'Text',
					type: 'string',
					required: true,
					description: 'Text to speak',
				},
				{
					name: 'voice',
					displayName: 'Voice',
					type: 'string',
					description: 'Voice name (platform-specific)',
				},
				{
					name: 'speed',
					displayName: 'Speed',
					type: 'number',
					default: 1.0,
					description: 'Speech speed (0.5 - 2.0)',
				},
			],
		},
		{
			name: 'listen',
			displayName: 'Speech to Text',
			description: 'Convert speech to text',
			operation: 'listen',
			properties: [
				{
					name: 'duration',
					displayName: 'Duration (seconds)',
					type: 'number',
					default: 5,
					description: 'Recording duration in seconds',
				},
			],
		},
	];

	protected async executeDarwin(params: ExecuteParams): Promise<any> {
		// macOS: use `say` command for TTS
		if (params.operation === 'speak') {
			const { exec } = await import('child_process');
			const { promisify } = await import('util');
			const execAsync = promisify(exec);

			const text = params.parameters.text;
			const voice = params.parameters.voice ? `-v ${params.parameters.voice}` : '';
			await execAsync(`say ${voice} "${text}"`);
			return { success: true };
		}
		throw new Error('Voice operations require platform-specific libraries. Not yet implemented.');
	}

	protected async executeWindows(params: ExecuteParams): Promise<any> {
		throw new Error(
			'Voice operations require Windows SAPI or platform-specific libraries. Not yet implemented.',
		);
	}

	protected async executeLinux(params: ExecuteParams): Promise<any> {
		// Linux: use espeak or festival for TTS
		if (params.operation === 'speak') {
			const { exec } = await import('child_process');
			const { promisify } = await import('util');
			const execAsync = promisify(exec);

			const text = params.parameters.text;
			await execAsync(`espeak "${text}"`);
			return { success: true };
		}
		throw new Error('Voice operations require platform-specific libraries. Not yet implemented.');
	}
}
