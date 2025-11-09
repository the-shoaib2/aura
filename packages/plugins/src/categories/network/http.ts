/**
 * @network/http Plugin
 *
 * Fetch, POST, REST calls
 */

import { BaseIntegration } from '../../base-integration';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@network/http',
	version: '1.0.0',
	category: 'network',
	description: 'Fetch, POST, REST calls',
	tags: ['http', 'network', 'rest', 'api', 'fetch'],
};

export class NetworkHttpPlugin extends BaseIntegration {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'get',
			displayName: 'GET Request',
			description: 'Make a GET request',
			operation: 'get',
			properties: [
				{ name: 'url', displayName: 'URL', type: 'string', required: true },
				{
					name: 'headers',
					displayName: 'Headers',
					type: 'json',
					description: 'Request headers as JSON object',
				},
				{ name: 'timeout', displayName: 'Timeout (ms)', type: 'number', default: 30000 },
			],
		},
		{
			name: 'post',
			displayName: 'POST Request',
			description: 'Make a POST request',
			operation: 'post',
			properties: [
				{ name: 'url', displayName: 'URL', type: 'string', required: true },
				{ name: 'body', displayName: 'Body', type: 'json', description: 'Request body' },
				{ name: 'headers', displayName: 'Headers', type: 'json', description: 'Request headers' },
				{ name: 'timeout', displayName: 'Timeout (ms)', type: 'number', default: 30000 },
			],
		},
		{
			name: 'put',
			displayName: 'PUT Request',
			description: 'Make a PUT request',
			operation: 'put',
			properties: [
				{ name: 'url', displayName: 'URL', type: 'string', required: true },
				{ name: 'body', displayName: 'Body', type: 'json', description: 'Request body' },
				{ name: 'headers', displayName: 'Headers', type: 'json', description: 'Request headers' },
			],
		},
		{
			name: 'delete',
			displayName: 'DELETE Request',
			description: 'Make a DELETE request',
			operation: 'delete',
			properties: [
				{ name: 'url', displayName: 'URL', type: 'string', required: true },
				{ name: 'headers', displayName: 'Headers', type: 'json', description: 'Request headers' },
			],
		},
	];

	protected async executeAction(params: ExecuteParams): Promise<any> {
		const { operation, parameters } = params;

		// Dynamic import to avoid requiring fetch polyfill at build time
		const fetch = (await import('node-fetch')).default;

		const url = parameters.url;
		const headers = parameters.headers || {};
		const timeout = parameters.timeout || 30000;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			let response;
			switch (operation) {
				case 'get':
					response = await fetch(url, {
						method: 'GET',
						headers,
						signal: controller.signal,
					});
					break;
				case 'post':
					response = await fetch(url, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', ...headers },
						body: JSON.stringify(parameters.body),
						signal: controller.signal,
					});
					break;
				case 'put':
					response = await fetch(url, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json', ...headers },
						body: JSON.stringify(parameters.body),
						signal: controller.signal,
					});
					break;
				case 'delete':
					response = await fetch(url, {
						method: 'DELETE',
						headers,
						signal: controller.signal,
					});
					break;
				default:
					throw new Error(`Unknown operation: ${operation}`);
			}

			clearTimeout(timeoutId);

			const data = await response.json().catch(() => response.text());

			return {
				status: response.status,
				statusText: response.statusText,
				headers: Object.fromEntries(response.headers.entries()),
				data,
			};
		} catch (error) {
			clearTimeout(timeoutId);
			throw error;
		}
	}
}
