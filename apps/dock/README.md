# AURA Dock

A floating dock application built with Electron and Next.js. Features a transparent, always-on-top dock with customizable positioning.

## Features

- 🪟 Always on top of all windows
- 🎨 Transparent + rounded dock UI
- 🎯 Positioned at top center (customizable/movable)
- ⌨️ Alt+D (Cmd+D on Mac) toggles visibility
- 🎭 Beautiful animations with Framer Motion
- 🎨 Uses Tailwind CSS + shadcn/ui
- 🖱️ Draggable dock window
- 🌍 Cross-platform (macOS, Windows, Linux)

## Requirements

- Node.js >= 22.16
- pnpm >= 10.18.3

## Installation

```bash
# Install dependencies (from root)
pnpm install

# Or install in this directory
cd apps/dock
pnpm install
```

## Development

```bash
# Start development server
pnpm dev
```

This will:
1. Start Next.js dev server on port 3001
2. Launch Electron app when server is ready

## Building

### Build for development
```bash
pnpm build
```

### Build distributables

```bash
# Build for current platform
pnpm dist

# Build for specific platform
pnpm dist:mac    # macOS
pnpm dist:win    # Windows
pnpm dist:linux  # Linux
```

Built files will be in the `dist/` directory.

## Usage

### Keyboard Shortcuts

- **Alt+D** (Windows/Linux) or **Cmd+D** (macOS): Toggle dock visibility

### Dock Buttons

- **Agent**: Opens agent functionality
- **Workflow**: Opens workflow functionality
- **Settings**: Opens settings

### Moving the Dock

The dock can be moved by dragging it to any position on the screen. The position will be remembered.

## Platform-Specific Notes

### macOS
- Uses vibrancy effect for native look
- Command+D shortcut

### Windows
- Transparent background with proper DWM composition
- Alt+D shortcut

### Linux
- Uses dock window type
- Alt+D shortcut

## Project Structure

```
apps/dock/
├── electron/          # Electron main process
│   ├── main.ts       # Main process entry point
│   └── preload.ts    # Preload script
├── app/              # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/       # React components
│   └── Dock.tsx     # Main dock component
├── lib/             # Utilities
└── package.json
```

## Technologies

- **Electron**: Desktop app framework
- **Next.js**: React framework
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **shadcn/ui**: UI components
- **lucide-react**: Icons
- **electron-builder**: Packaging

## License

See LICENSE.md in the root of the repository.
