import { create } from 'zustand';

interface RootState {
	initialized: boolean;
	setInitialized: (value: boolean) => void;
}

export const useRootStore = create<RootState>((set) => ({
	initialized: false,
	setInitialized: (value: boolean) => set({ initialized: value }),
}));
