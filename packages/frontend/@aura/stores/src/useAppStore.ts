import { create } from 'zustand';

interface AppState {
	theme: 'light' | 'dark' | 'system';
	setTheme: (theme: 'light' | 'dark' | 'system') => void;
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
	theme: 'system',
	setTheme: (theme) => set({ theme }),
	sidebarOpen: true,
	setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
