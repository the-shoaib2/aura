/**
 * @system/shell Plugin
 *
 * Safe command execution
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const metadata: IntegrationMetadata = {
	name: '@system/shell',
	version: '1.0.0',
	category: 'system',
	description: 'Safe command execution',
	tags: ['shell', 'system', 'command', 'exec'],
};

export class SystemShellPlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'execute',
			displayName: 'Execute Command',
			description: 'Execute a shell command safely',
			operation: 'execute',
			properties: [
				{
					name: 'command',
					displayName: 'Command',
					type: 'string',
					required: true,
					description: 'Command to execute',
				},
				{
					name: 'timeout',
					displayName: 'Timeout (ms)',
					type: 'number',
					default: 30000,
					description: 'Command execution timeout in milliseconds',
				},
				{
					name: 'workingDirectory',
					displayName: 'Working Directory',
					type: 'string',
					description: 'Working directory for command execution',
				},
			],
		},
	];

	protected async executeDarwin(params: ExecuteParams): Promise<any> {
		return this.executeCommon(params);
	}

	protected async executeWindows(params: ExecuteParams): Promise<any> {
		return this.executeCommon(params);
	}

	protected async executeLinux(params: ExecuteParams): Promise<any> {
		return this.executeCommon(params);
	}

	private async executeCommon(params: ExecuteParams): Promise<any> {
		const { operation, parameters } = params;

		switch (operation) {
			case 'execute':
				return this.executeCommand(
					parameters.command,
					parameters.timeout || 30000,
					parameters.workingDirectory,
				);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async executeCommand(
		command: string,
		timeout: number,
		workingDirectory?: string,
	): Promise<{ stdout: string; stderr: string; exitCode: number }> {
		const options: any = {
			timeout,
			maxBuffer: 1024 * 1024 * 10, // 10MB
		};

		if (workingDirectory) {
			options.cwd = workingDirectory;
		}

		try {
			const { stdout, stderr } = await execAsync(command, options);
			return {
				stdout: typeof stdout === 'string' ? stdout : stdout.toString('utf-8'),
				stderr: typeof stderr === 'string' ? stderr : stderr.toString('utf-8'),
				exitCode: 0,
			};
		} catch (error: any) {
			return {
				stdout: error.stdout
					? typeof error.stdout === 'string'
						? error.stdout
						: error.stdout.toString('utf-8')
					: '',
				stderr: error.stderr
					? typeof error.stderr === 'string'
						? error.stderr
						: error.stderr.toString('utf-8')
					: error.message || '',
				exitCode: error.code || 1,
			};
		}
	}
}
