import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
	toggleVisibility: () => ipcRenderer.invoke('toggle-visibility'),
	getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
	setWindowPosition: (x: number, y: number) => ipcRenderer.invoke('set-window-position', x, y),
	minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
	platform: process.platform,
});

// Type declarations are in types/electron.d.ts
