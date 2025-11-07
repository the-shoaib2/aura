// Type definitions for Electron API exposed via preload script
export interface ElectronAPI {
	toggleVisibility: () => Promise<void>;
	getWindowPosition: () => Promise<{ x: number; y: number }>;
	setWindowPosition: (x: number, y: number) => Promise<void>;
	minimizeWindow: () => Promise<void>;
	platform: string;
}

declare global {
	interface Window {
		electronAPI?: ElectronAPI;
	}
}
