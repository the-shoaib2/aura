/**
 * @network/webhook Plugin
 *
 * Inbound/outbound webhooks
 */

import { BaseIntegration } from '../../base-integration';
import {
	type ActionDefinition,
	type TriggerDefinition,
	type IntegrationMetadata,
} from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@network/webhook',
	version: '1.0.0',
	category: 'network',
	description: 'Inbound/outbound webhooks',
	tags: ['webhook', 'network', 'http', 'trigger'],
};

export class NetworkWebhookPlugin extends BaseIntegration {
	metadata = metadata;
	credentials?: undefined;

	triggers: TriggerDefinition[] = [
		{
			name: 'webhook',
			displayName: 'Webhook Trigger',
			description: 'Trigger workflow on webhook request',
			type: 'webhook',
			properties: [
				{ name: 'path', displayName: 'Webhook Path', type: 'string', required: true },
				{
					name: 'httpMethod',
					displayName: 'HTTP Method',
					type: 'options',
					default: 'POST',
					options: [
						{ name: 'GET', value: 'GET' },
						{ name: 'POST', value: 'POST' },
						{ name: 'PUT', value: 'PUT' },
						{ name: 'DELETE', value: 'DELETE' },
					],
				},
			],
			webhook: {
				path: '{{$parameter.path}}',
				httpMethod: 'POST',
				responseMode: 'responseNode',
			},
		},
	];

	actions: ActionDefinition[] = [
		{
			name: 'send',
			displayName: 'Send Webhook',
			description: 'Send webhook to external URL',
			operation: 'send',
			properties: [
				{ name: 'url', displayName: 'Webhook URL', type: 'string', required: true },
				{
					name: 'method',
					displayName: 'HTTP Method',
					type: 'options',
					default: 'POST',
					options: [
						{ name: 'POST', value: 'POST' },
						{ name: 'PUT', value: 'PUT' },
						{ name: 'PATCH', value: 'PATCH' },
					],
				},
				{ name: 'body', displayName: 'Body', type: 'json', description: 'Webhook payload' },
				{ name: 'headers', displayName: 'Headers', type: 'json', description: 'Request headers' },
			],
		},
	];

	protected async executeAction(params: ExecuteParams): Promise<any> {
		const { operation, parameters } = params;

		if (operation === 'send') {
			const fetch = (await import('node-fetch')).default;
			const response = await fetch(parameters.url, {
				method: parameters.method || 'POST',
				headers: { 'Content-Type': 'application/json', ...parameters.headers },
				body: JSON.stringify(parameters.body),
			});

			return {
				status: response.status,
				data: await response.json().catch(() => response.text()),
			};
		}

		throw new Error(`Unknown operation: ${operation}`);
	}
}
