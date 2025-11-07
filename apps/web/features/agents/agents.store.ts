import { create } from 'zustand';
import { agentsApi, type Agent } from '@aura/api-client';

interface AgentsState {
	agents: Agent[];
	loading: boolean;
	error: string | null;
	fetchAgents: () => Promise<void>;
	createAgent: (data: Partial<Agent>) => Promise<void>;
	updateAgent: (id: string, data: Partial<Agent>) => Promise<void>;
	deleteAgent: (id: string) => Promise<void>;
	startAgent: (id: string) => Promise<void>;
	stopAgent: (id: string) => Promise<void>;
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
	agents: [],
	loading: false,
	error: null,

	fetchAgents: async () => {
		set({ loading: true, error: null });
		try {
			const response = await agentsApi.getAll();
			set({ agents: response.data.agents || [], loading: false });
		} catch (error) {
			set({ error: (error as Error).message, loading: false });
		}
	},

	createAgent: async (data) => {
		try {
			await agentsApi.create(data);
			await get().fetchAgents();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},

	updateAgent: async (id, data) => {
		try {
			await agentsApi.update(id, data);
			await get().fetchAgents();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},

	deleteAgent: async (id) => {
		try {
			await agentsApi.delete(id);
			await get().fetchAgents();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},

	startAgent: async (id) => {
		try {
			await agentsApi.start(id);
			await get().fetchAgents();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},

	stopAgent: async (id) => {
		try {
			await agentsApi.stop(id);
			await get().fetchAgents();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},
}));
