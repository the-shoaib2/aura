/**
 * @system/notifications Plugin
 *
 * Local system notifications
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@system/notifications',
	version: '1.0.0',
	category: 'system',
	description: 'Local system notifications',
	tags: ['notifications', 'system', 'alerts'],
};

export class SystemNotificationsPlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'show',
			displayName: 'Show Notification',
			description: 'Show a system notification',
			operation: 'show',
			properties: [
				{ name: 'title', displayName: 'Title', type: 'string', required: true },
				{ name: 'message', displayName: 'Message', type: 'string', required: true },
				{ name: 'icon', displayName: 'Icon', type: 'string', description: 'Path to icon image' },
				{
					name: 'sound',
					displayName: 'Sound',
					type: 'boolean',
					default: true,
					description: 'Play notification sound',
				},
			],
		},
	];

	protected async executeDarwin(params: ExecuteParams): Promise<any> {
		throw new Error(
			'System notifications require platform-specific libraries (node-notifier, etc.). Not yet implemented.',
		);
	}

	protected async executeWindows(params: ExecuteParams): Promise<any> {
		throw new Error(
			'System notifications require platform-specific libraries (node-notifier, etc.). Not yet implemented.',
		);
	}

	protected async executeLinux(params: ExecuteParams): Promise<any> {
		throw new Error(
			'System notifications require platform-specific libraries (node-notifier, etc.). Not yet implemented.',
		);
	}
}
