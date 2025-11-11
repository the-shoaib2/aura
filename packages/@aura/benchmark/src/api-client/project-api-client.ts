import type { AuthenticatedApiClient } from './authenticated-api-client';

export class ProjectApiClient {
	constructor(private readonly apiClient: AuthenticatedApiClient) {}

	async getPersonalProject(): Promise<string> {
		const response = await this.apiClient.get<{ data: { id: string } }>('/projects/personal');

		return response.data.data.id;
	}
}
