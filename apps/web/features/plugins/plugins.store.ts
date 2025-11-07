import { create } from 'zustand';
import { pluginsApi, type Plugin } from '@aura/api-client';

interface PluginsState {
	plugins: Plugin[];
	loading: boolean;
	error: string | null;
	fetchPlugins: () => Promise<void>;
	installPlugin: (data: Partial<Plugin>) => Promise<void>;
	enablePlugin: (id: string) => Promise<void>;
	disablePlugin: (id: string) => Promise<void>;
	uninstallPlugin: (id: string) => Promise<void>;
}

export const usePluginsStore = create<PluginsState>((set, get) => ({
	plugins: [],
	loading: false,
	error: null,

	fetchPlugins: async () => {
		set({ loading: true, error: null });
		try {
			const response = await pluginsApi.getAll();
			set({ plugins: response.data.plugins || [], loading: false });
		} catch (error) {
			set({ error: (error as Error).message, loading: false });
		}
	},

	installPlugin: async (data) => {
		try {
			await pluginsApi.install(data);
			await get().fetchPlugins();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},

	enablePlugin: async (id) => {
		try {
			await pluginsApi.enable(id);
			await get().fetchPlugins();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},

	disablePlugin: async (id) => {
		try {
			await pluginsApi.disable(id);
			await get().fetchPlugins();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},

	uninstallPlugin: async (id) => {
		try {
			await pluginsApi.uninstall(id);
			await get().fetchPlugins();
		} catch (error) {
			set({ error: (error as Error).message });
		}
	},
}));
