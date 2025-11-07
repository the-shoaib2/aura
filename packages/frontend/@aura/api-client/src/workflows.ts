import { apiClient } from './client';

export interface Workflow {
	id: string;
	name: string;
	status: string;
	lastRun?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface WorkflowsResponse {
	workflows: Workflow[];
	total: number;
}

export const workflowsApi = {
	getAll: () => apiClient.get<WorkflowsResponse>('/api/v1/workflows'),
	getById: (id: string) => apiClient.get<Workflow>(`/api/v1/workflows/${id}`),
	create: (data: Partial<Workflow>) => apiClient.post<Workflow>('/api/v1/workflows', data),
	update: (id: string, data: Partial<Workflow>) =>
		apiClient.put<Workflow>(`/api/v1/workflows/${id}`, data),
	delete: (id: string) => apiClient.delete(`/api/v1/workflows/${id}`),
	run: (id: string) => apiClient.post(`/api/v1/workflows/${id}/run`),
};
