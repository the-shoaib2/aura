/**
 * @system/network Plugin
 *
 * WiFi, IP, VPN control
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';
import { networkInterfaces } from 'os';

const metadata: IntegrationMetadata = {
	name: '@system/network',
	version: '1.0.0',
	category: 'system',
	description: 'WiFi, IP, VPN control',
	tags: ['network', 'system', 'wifi', 'ip', 'vpn'],
};

export class SystemNetworkPlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'getIP',
			displayName: 'Get IP Address',
			description: 'Get local IP address',
			operation: 'getIP',
			properties: [
				{
					name: 'interface',
					displayName: 'Network Interface',
					type: 'string',
					description: 'Network interface name (e.g., "eth0", "wlan0")',
				},
			],
		},
		{
			name: 'listInterfaces',
			displayName: 'List Network Interfaces',
			description: 'List all network interfaces',
			operation: 'listInterfaces',
			properties: [],
		},
		{
			name: 'ping',
			displayName: 'Ping Host',
			description: 'Ping a host',
			operation: 'ping',
			properties: [
				{
					name: 'host',
					displayName: 'Host',
					type: 'string',
					required: true,
					description: 'Hostname or IP address to ping',
				},
				{
					name: 'count',
					displayName: 'Count',
					type: 'number',
					default: 4,
					description: 'Number of ping packets',
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
			case 'getIP':
				return this.getIPAddress(parameters.interface);
			case 'listInterfaces':
				return this.listInterfaces();
			case 'ping':
				return this.pingHost(parameters.host, parameters.count || 4);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private getIPAddress(interfaceName?: string): { interface: string; addresses: string[] } {
		const interfaces = networkInterfaces();

		if (interfaceName) {
			const iface = interfaces[interfaceName];
			if (iface) {
				const addresses = iface
					.filter((addr) => addr.family === 'IPv4' && !addr.internal)
					.map((addr) => addr.address);
				return { interface: interfaceName, addresses };
			}
			return { interface: interfaceName, addresses: [] };
		}

		// Return first non-internal IPv4 address
		for (const [name, addrs] of Object.entries(interfaces)) {
			if (!addrs) continue;
			const addresses = addrs
				.filter((addr) => addr.family === 'IPv4' && !addr.internal)
				.map((addr) => addr.address);
			if (addresses.length > 0) {
				return { interface: name, addresses };
			}
		}

		return { interface: 'unknown', addresses: [] };
	}

	private listInterfaces(): Record<string, any[]> {
		const interfaces = networkInterfaces();
		const result: Record<string, any[]> = {};

		for (const [name, addrs] of Object.entries(interfaces)) {
			if (!addrs) continue;
			result[name] = addrs.map((addr) => ({
				address: addr.address,
				netmask: addr.netmask,
				family: addr.family,
				mac: addr.mac,
				internal: addr.internal,
			}));
		}

		return result;
	}

	private async pingHost(host: string, count: number): Promise<any> {
		// Ping implementation would require platform-specific commands
		// For now, return a placeholder
		throw new Error(
			'Ping requires platform-specific implementation. Use shell plugin to execute ping command.',
		);
	}
}
