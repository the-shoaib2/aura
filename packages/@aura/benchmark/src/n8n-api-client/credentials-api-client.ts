import type { Credential } from '@/aura-api-client/aura-api-client.types';

import type { AuthenticatedauraApiClient } from './authenticated-aura-api-client';

export class CredentialApiClient {
	constructor(private readonly apiClient: AuthenticatedauraApiClient) {}

	async getAllCredentials(): Promise<Credential[]> {
		const response = await this.apiClient.get<{ count: number; data: Credential[] }>(
			'/credentials',
		);

		return response.data.data;
	}

	async createCredential(credential: Credential): Promise<Credential> {
		const response = await this.apiClient.post<{ data: Credential }>('/credentials', {
			...credential,
			id: undefined,
		});

		return response.data.data;
	}

	async deleteCredential(credentialId: Credential['id']): Promise<void> {
		await this.apiClient.delete(`/credentials/${credentialId}`);
	}
}
