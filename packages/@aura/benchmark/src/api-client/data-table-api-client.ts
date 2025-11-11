import type { DataTable } from '@/api-client/api-client.types';

import type { AuthenticatedApiClient } from './authenticated-api-client';

export class DataTableApiClient {
	constructor(private readonly apiClient: AuthenticatedApiClient) {}

	async getAllDataTables(): Promise<DataTable[]> {
		const response = await this.apiClient.get<{ data: { count: number; data: DataTable[] } }>(
			'/data-tables-global',
		);

		return response.data.data.data;
	}

	async deleteDataTable(projectId: string, dataTableId: DataTable['id']): Promise<void> {
		await this.apiClient.delete(`/projects/${projectId}/data-tables/${dataTableId}`);
	}

	async createDataTable(projectId: string, dataTable: DataTable): Promise<DataTable> {
		const response = await this.apiClient.post<{ data: DataTable }>(
			`/projects/${projectId}/data-tables`,
			{
				...dataTable,
			},
		);

		return response.data.data;
	}
}
