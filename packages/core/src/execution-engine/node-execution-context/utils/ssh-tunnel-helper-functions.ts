import { Container } from '@aura/di';
import type { SSHTunnelFunctions } from 'workflow';
import type { Client } from 'ssh2';

import { SSHClientsManager } from '../../ssh-clients-manager';

export const getSSHTunnelFunctions = (): SSHTunnelFunctions => {
	const sshClientsManager = Container.get(SSHClientsManager);
	return {
		getSSHClient: async (credentials, abortController) =>
			await sshClientsManager.getClient(credentials, abortController),
		updateLastUsed: (client: Client) => sshClientsManager.updateLastUsed(client),
	};
};
