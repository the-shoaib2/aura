import { create } from 'zustand';
import { workflowsApi, type Workflow } from '@aura/api-client';

interface WorkflowsState {
	workflows: Workflow[];
	loading: boolean;
	error: string | null;
	fetchWorkflows: () => Promise<void>;
	createWorkflow: (data: Partial<Workflow>) => Promise<void>;
	updateWorkflow: (id: string, data: Partial<Workflow>) => Promise<void>;
	deleteWorkflow: (id: string) => Promise<void>;
	runWorkflow: (id: string) => Promise<void>;
}

export const useWorkflowsStore = create<WorkflowsState>((set, get) => ({
	workflows: [],
	loading: false,
	error: null,

	fetchWorkflows: async () => {
		set({ loading: true, error: null });
		try {
			const response = await workflowsApi.getAll();
			set({ workflows: response.data.workflows || [], loading: false });
		} catch (error) {
			set({ error: (error as Error).message, loading: false });
		}
	},

	createWorkflow: async (data) => {
		try {
			await workflowsApi.create(data);
			await get().fetchWorkflows();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},

	updateWorkflow: async (id, data) => {
		try {
			await workflowsApi.update(id, data);
			await get().fetchWorkflows();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},

	deleteWorkflow: async (id) => {
		try {
			await workflowsApi.delete(id);
			await get().fetchWorkflows();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},

	runWorkflow: async (id) => {
		try {
			await workflowsApi.run(id);
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},
}));
