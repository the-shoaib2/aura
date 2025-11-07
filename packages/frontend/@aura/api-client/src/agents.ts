import { apiClient } from './client';

export interface Agent {
	id: string;
	name?: string;
	status: string;
	tasksCompleted?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface AgentsResponse {
	agents: Agent[];
	total: number;
}

export const agentsApi = {
	getAll: () => apiClient.get<AgentsResponse>('/api/v1/agents'),
	getById: (id: string) => apiClient.get<Agent>(`/api/v1/agents/${id}`),
	create: (data: Partial<Agent>) => apiClient.post<Agent>('/api/v1/agents', data),
	update: (id: string, data: Partial<Agent>) => apiClient.put<Agent>(`/api/v1/agents/${id}`, data),
	delete: (id: string) => apiClient.delete(`/api/v1/agents/${id}`),
	start: (id: string) => apiClient.post(`/api/v1/agents/${id}/start`),
	stop: (id: string) => apiClient.post(`/api/v1/agents/${id}/stop`),
};
