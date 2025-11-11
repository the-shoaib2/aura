import type { AuthenticatedauraApiClient } from './authenticated-aura-api-client';

export class ProjectApiClient {
	constructor(private readonly apiClient: AuthenticatedauraApiClient) {}

	async getPersonalProject(): Promise<string> {
		const response = await this.apiClient.get<{ data: { id: string } }>('/projects/personal');

		return response.data.data.id;
	}
}
