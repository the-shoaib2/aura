/**
 * @system/scheduler Plugin
 *
 * Time-based job triggers
 */

import { BaseSystemPlugin } from './base-system-plugin';
import {
	type ActionDefinition,
	type TriggerDefinition,
	type IntegrationMetadata,
} from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@system/scheduler',
	version: '1.0.0',
	category: 'system',
	description: 'Time-based job triggers',
	tags: ['scheduler', 'system', 'cron', 'timer'],
};

export class SystemSchedulerPlugin extends BaseSystemPlugin {
	metadata = metadata;
	credentials?: undefined;

	triggers: TriggerDefinition[] = [
		{
			name: 'schedule',
			displayName: 'Schedule Trigger',
			description: 'Trigger based on schedule (cron expression)',
			type: 'schedule',
			properties: [
				{
					name: 'cron',
					displayName: 'Cron Expression',
					type: 'string',
					required: true,
					description: 'Cron expression (e.g., "0 0 * * *" for daily at midnight)',
				},
			],
		},
	];

	actions: ActionDefinition[] = [
		{
			name: 'schedule',
			displayName: 'Schedule Job',
			description: 'Schedule a job to run at a specific time',
			operation: 'schedule',
			properties: [
				{
					name: 'cron',
					displayName: 'Cron Expression',
					type: 'string',
					required: true,
					description: 'Cron expression',
				},
				{
					name: 'command',
					displayName: 'Command',
					type: 'string',
					required: true,
					description: 'Command or workflow to execute',
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
		const { operation } = params;

		switch (operation) {
			case 'schedule':
				// Scheduling would be handled by the workflow engine
				return { success: true, message: 'Job scheduled' };
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}
}
