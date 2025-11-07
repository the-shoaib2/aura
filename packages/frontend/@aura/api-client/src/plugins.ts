import { apiClient } from './client';

export interface Plugin {
	id: string;
	name?: string;
	enabled: boolean;
	version?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface PluginsResponse {
	plugins: Plugin[];
	total: number;
}

export const pluginsApi = {
	getAll: () => apiClient.get<PluginsResponse>('/api/v1/plugins'),
	getById: (id: string) => apiClient.get<Plugin>(`/api/v1/plugins/${id}`),
	install: (data: Partial<Plugin>) => apiClient.post<Plugin>('/api/v1/plugins', data),
	enable: (id: string) => apiClient.post(`/api/v1/plugins/${id}/enable`),
	disable: (id: string) => apiClient.post(`/api/v1/plugins/${id}/disable`),
	uninstall: (id: string) => apiClient.delete(`/api/v1/plugins/${id}`),
};
