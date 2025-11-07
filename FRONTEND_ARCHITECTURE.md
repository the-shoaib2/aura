# AURA Frontend Architecture

This document describes the frontend architecture of AURA, inspired by n8n's scalable monorepo structure.

## Overview

AURA's frontend is built as a scalable monorepo with separate packages for different concerns, following the same architectural patterns as n8n but adapted for React/Next.js instead of Vue.

## Package Structure

### `packages/frontend/@aura/design-system`

Design system component library built with:
- **React** + **TypeScript**
- **Tailwind CSS** for styling
- **Radix UI** for accessible primitives
- **shadcn/ui** component patterns

**Key Features:**
- Reusable UI components (Button, Card, Input, Select, etc.)
- Design tokens and CSS variables for theming
- Dark mode support
- Fully typed with TypeScript

**Usage:**
```tsx
import { Button, Card, Input } from '@aura/design-system';
import '@aura/design-system/css';
```

### `packages/frontend/@aura/hooks`

Shared React hooks package (equivalent to Vue composables).

**Available Hooks:**
- `useDeviceSupport` - Detect touch devices and mobile screens
- `useDebounce` - Debounce values
- `useThrottle` - Throttle values

**Usage:**
```tsx
import { useDebounce, useDeviceSupport } from '@aura/hooks';
```

### `packages/frontend/@aura/stores`

State management using **Zustand** (React equivalent of Pinia).

**Available Stores:**
- `useRootStore` - Root application state
- `useAppStore` - App-level state (theme, sidebar, etc.)

**Usage:**
```tsx
import { useAppStore } from '@aura/stores';

const { theme, setTheme } = useAppStore();
```

### `packages/frontend/@aura/api-client`

REST API client built with **Axios**.

**Features:**
- Automatic authentication token handling
- Request/response interceptors
- Type-safe API methods
- Error handling

**Usage:**
```tsx
import { workflowsApi, agentsApi, pluginsApi } from '@aura/api-client';

// Fetch workflows
const { data } = await workflowsApi.getAll();

// Create workflow
await workflowsApi.create({ name: 'My Workflow' });
```

### `packages/frontend/@aura/i18n`

Internationalization support using **i18next** and **react-i18next**.

**Features:**
- Multi-language support
- React hooks for translations
- JSON-based translation files

**Usage:**
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
const title = t('workflows.title');
```

## Application Structure

### `apps/web`

Next.js application using the design system and packages.

**Directory Structure:**
```
apps/web/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard
│   ├── workflows/         # Workflows feature
│   ├── agents/            # Agents feature
│   ├── plugins/           # Plugins feature
│   └── settings/          # Settings feature
├── src/
│   ├── components/        # App-specific components
│   ├── features/          # Feature-based modules
│   │   ├── workflows/     # Workflow feature
│   │   ├── agents/        # Agent feature
│   │   └── plugins/       # Plugin feature
│   ├── hooks/             # App-specific hooks
│   └── lib/               # Utilities
└── package.json
```

## Feature-Based Architecture

Following n8n's pattern, features are organized as self-contained modules:

```
src/features/
├── workflows/
│   ├── components/        # Workflow-specific components
│   ├── hooks/            # Workflow-specific hooks
│   ├── stores/           # Workflow stores (if needed)
│   ├── api/              # Workflow API calls
│   └── types/            # Workflow types
├── agents/
│   └── ...               # Similar structure
└── plugins/
    └── ...               # Similar structure
```

## Technology Stack

### Core
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety

### Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component patterns
- **Radix UI** - Accessible primitives

### State Management
- **Zustand** - Lightweight state management

### API
- **Axios** - HTTP client

### Internationalization
- **i18next** - i18n framework
- **react-i18next** - React bindings

### Build Tools
- **Vite** - Build tool for packages
- **TurboRepo** - Monorepo build system
- **pnpm** - Package manager

## Development Workflow

### Installing Dependencies

```bash
pnpm install
```

### Building Packages

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @aura/design-system build
```

### Development

```bash
# Start all dev servers
pnpm dev

# Start only frontend
pnpm dev:fe

# Start only backend
pnpm dev:be
```

### Adding a New Component

1. Create component in `packages/frontend/@aura/design-system/src/components/`
2. Export from `packages/frontend/@aura/design-system/src/components/index.ts`
3. Build the package: `pnpm --filter @aura/design-system build`
4. Use in app: `import { MyComponent } from '@aura/design-system'`

## Comparison with n8n

| Aspect | n8n | AURA |
|--------|-----|------|
| Framework | Vue 3 | React 19 |
| UI Library | Element Plus | Radix UI + shadcn/ui |
| State Management | Pinia | Zustand |
| Styling | SCSS | Tailwind CSS |
| Build Tool | Vite | Vite (packages) + Next.js (app) |
| Component Library | @n8n/design-system | @aura/design-system |
| Composables | @n8n/composables | @aura/hooks |
| Stores | @n8n/stores | @aura/stores |
| API Client | @n8n/rest-api-client | @aura/api-client |
| i18n | @n8n/i18n | @aura/i18n |

## Best Practices

1. **Component Reusability**: Use `@aura/design-system` for shared components
2. **Feature Isolation**: Keep features self-contained in `src/features/`
3. **Type Safety**: Use TypeScript for all code
4. **State Management**: Use Zustand stores for global state, local state for component-specific state
5. **API Calls**: Use `@aura/api-client` for all API interactions
6. **Styling**: Use Tailwind CSS utility classes, avoid custom CSS when possible
7. **Internationalization**: Use `@aura/i18n` for all user-facing text

## Next Steps

1. ✅ Create design system package
2. ✅ Create hooks package
3. ✅ Create stores package
4. ✅ Create API client package
5. ✅ Create i18n package
6. ⏳ Reorganize web app to feature-based architecture
7. ⏳ Migrate existing components to use design system
8. ⏳ Add more components to design system
9. ⏳ Add Storybook for component documentation
10. ⏳ Add comprehensive tests

## License

See LICENSE.md file in the root of the repository

