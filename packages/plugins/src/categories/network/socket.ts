/**
 * @network/socket Plugin
 *
 * Real-time socket connections
 */

import { BaseIntegration } from '../../base-integration';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@network/socket',
	version: '1.0.0',
	category: 'network',
	description: 'Real-time socket connections',
	tags: ['socket', 'network', 'websocket', 'realtime'],
};

export class NetworkSocketPlugin extends BaseIntegration {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'connect',
			displayName: 'Connect to Socket',
			description: 'Connect to a WebSocket server',
			operation: 'connect',
			properties: [
				{ name: 'url', displayName: 'WebSocket URL', type: 'string', required: true },
				{
					name: 'protocols',
					displayName: 'Protocols',
					type: 'array',
					description: 'WebSocket subprotocols',
				},
			],
		},
		{
			name: 'send',
			displayName: 'Send Message',
			description: 'Send message through socket',
			operation: 'send',
			properties: [
				{ name: 'message', displayName: 'Message', type: 'string', required: true },
				{ name: 'connectionId', displayName: 'Connection ID', type: 'string', required: true },
			],
		},
		{
			name: 'close',
			displayName: 'Close Connection',
			description: 'Close socket connection',
			operation: 'close',
			properties: [
				{ name: 'connectionId', displayName: 'Connection ID', type: 'string', required: true },
			],
		},
	];

	private connections = new Map<string, WebSocket>();

	protected async executeAction(params: ExecuteParams): Promise<any> {
		const { operation, parameters } = params;

		switch (operation) {
			case 'connect':
				return this.connect(parameters.url, parameters.protocols);
			case 'send':
				return this.send(parameters.connectionId, parameters.message);
			case 'close':
				return this.close(parameters.connectionId);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async connect(url: string, protocols?: string[]): Promise<{ connectionId: string }> {
		const WebSocket = (await import('ws')).default;
		const ws = new WebSocket(url, protocols);
		const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		this.connections.set(connectionId, ws as any);

		return new Promise((resolve, reject) => {
			ws.on('open', () => resolve({ connectionId }));
			ws.on('error', reject);
		});
	}

	private async send(connectionId: string, message: string): Promise<void> {
		const ws = this.connections.get(connectionId);
		if (!ws) throw new Error(`Connection ${connectionId} not found`);

		ws.send(message);
	}

	private async close(connectionId: string): Promise<void> {
		const ws = this.connections.get(connectionId);
		if (!ws) throw new Error(`Connection ${connectionId} not found`);

		ws.close();
		this.connections.delete(connectionId);
	}

	async cleanup(): Promise<void> {
		for (const [id, ws] of this.connections.entries()) {
			ws.close();
			this.connections.delete(id);
		}
		await super.cleanup();
	}
}
