/**
 * @integration/slack Plugin
 *
 * Slack messaging integration
 */

import { BaseIntegration } from '../../base-integration';
import {
	type ActionDefinition,
	type IntegrationMetadata,
	type CredentialDefinition,
} from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@integration/slack',
	version: '1.0.0',
	category: 'integration',
	description: 'Slack messaging integration',
	tags: ['slack', 'messaging', 'communication', 'chat'],
};

export class IntegrationSlackPlugin extends BaseIntegration {
	metadata = metadata;
	triggers?: undefined;

	credentials: CredentialDefinition[] = [
		{
			name: 'slackApi',
			displayName: 'Slack API',
			type: 'apiKey',
			properties: [{ name: 'token', displayName: 'Bot Token', type: 'string', required: true }],
		},
	];

	actions: ActionDefinition[] = [
		{
			name: 'sendMessage',
			displayName: 'Send Message',
			description: 'Send a message to a channel',
			operation: 'sendMessage',
			properties: [
				{ name: 'channel', displayName: 'Channel', type: 'string', required: true },
				{ name: 'text', displayName: 'Text', type: 'string', required: true },
				{
					name: 'threadTs',
					displayName: 'Thread TS',
					type: 'string',
					description: 'Thread timestamp for replies',
				},
			],
		},
		{
			name: 'uploadFile',
			displayName: 'Upload File',
			description: 'Upload a file to Slack',
			operation: 'uploadFile',
			properties: [
				{ name: 'channels', displayName: 'Channels', type: 'string', required: true },
				{
					name: 'file',
					displayName: 'File',
					type: 'string',
					required: true,
					description: 'File path or URL',
				},
				{ name: 'title', displayName: 'Title', type: 'string' },
			],
		},
	];

	protected async executeAction(params: ExecuteParams): Promise<any> {
		const { operation, parameters, credentials } = params;
		const token = credentials?.slackApi?.token || credentials?.token;

		if (!token) {
			throw new Error('Slack token is required');
		}

		const fetch = (await import('node-fetch')).default;
		const baseUrl = 'https://slack.com/api';

		switch (operation) {
			case 'sendMessage':
				const messageResponse = await fetch(`${baseUrl}/chat.postMessage`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						channel: parameters.channel,
						text: parameters.text,
						thread_ts: parameters.threadTs,
					}),
				});
				return messageResponse.json();

			case 'uploadFile':
				// File upload would require form-data
				throw new Error('File upload not yet implemented. Requires form-data library.');

			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}
}
