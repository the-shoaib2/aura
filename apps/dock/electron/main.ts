import { app, BrowserWindow, globalShortcut, screen, ipcMain } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = 3001;

let mainWindow: BrowserWindow | null = null;
let isVisible = true;

const createWindow = () => {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;
	const dockWidth = 240;
	const dockHeight = 80;
	const dockX = Math.floor((width - dockWidth) / 2);
	const dockY = 20; // Top center

	mainWindow = new BrowserWindow({
		width: dockWidth,
		height: dockHeight,
		x: dockX,
		y: dockY,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		skipTaskbar: true,
		resizable: false,
		movable: true,
		focusable: true,
		hasShadow: false,
		webPreferences: {
			preload: join(__dirname, 'preload.js'),
			nodeIntegration: false,
			contextIsolation: true,
			sandbox: false,
		},
		// Platform-specific transparency settings
		...(process.platform === 'darwin' && {
			vibrancy: 'under-window',
			visualEffectState: 'active',
		}),
		...(process.platform === 'win32' && {
			backgroundColor: '#00000000',
		}),
		...(process.platform === 'linux' && {
			type: 'dock',
		}),
	});

	// Load the app
	// In dev mode, Next.js dev server runs separately
	// In production, we expect Next.js to be running on localhost:3001
	// or you can use Next.js standalone/server mode
	const url = isDev ? `http://localhost:${PORT}` : `http://localhost:${PORT}`;

	mainWindow.loadURL(url).catch((err) => {
		console.error('Failed to load URL:', err);
		// Retry after a short delay if in production
		if (!isDev) {
			setTimeout(() => {
				mainWindow?.loadURL(url).catch(console.error);
			}, 2000);
		}
	});

	// Handle window closed
	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	// Make window draggable
	mainWindow.setIgnoreMouseEvents(false);

	// Handle blur to maintain always on top
	mainWindow.on('blur', () => {
		if (mainWindow && isVisible) {
			mainWindow.setAlwaysOnTop(true);
		}
	});
};

// Register global shortcut (Alt+D or Cmd+D on Mac)
const registerShortcut = () => {
	const shortcut = process.platform === 'darwin' ? 'Command+D' : 'Alt+D';
	globalShortcut.register(shortcut, () => {
		toggleVisibility();
	});
};

const toggleVisibility = () => {
	if (!mainWindow) return;

	isVisible = !isVisible;
	if (isVisible) {
		mainWindow.show();
		mainWindow.setAlwaysOnTop(true);
		mainWindow.focus();
	} else {
		mainWindow.hide();
	}
};

// IPC handlers
ipcMain.handle('toggle-visibility', () => {
	toggleVisibility();
});

ipcMain.handle('get-window-position', () => {
	if (!mainWindow) return { x: 0, y: 0 };
	const bounds = mainWindow.getBounds();
	return { x: bounds.x, y: bounds.y };
});

ipcMain.handle('set-window-position', (_event, x: number, y: number) => {
	if (mainWindow) {
		mainWindow.setPosition(x, y);
	}
});

ipcMain.handle('minimize-window', () => {
	if (mainWindow) {
		mainWindow.minimize();
	}
});

// App event handlers
app.whenReady().then(() => {
	createWindow();
	registerShortcut();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('will-quit', () => {
	globalShortcut.unregisterAll();
});

// Handle transparency on Windows
// Note: For Windows transparency, ensure DWM composition is enabled
// The window background color is set to transparent in the BrowserWindow options
