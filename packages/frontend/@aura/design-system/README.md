# @aura/design-system

Design system component library for AURA platform, built with React, TypeScript, Tailwind CSS, and Radix UI.

## Installation

```bash
pnpm add @aura/design-system
```

## Usage

```tsx
import { Button, Card, Input } from '@aura/design-system';
import '@aura/design-system/css';

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Components

- **Button** - Button component with multiple variants
- **Card** - Card container component
- **Input** - Input field component
- **Label** - Form label component
- **Select** - Select dropdown component
- **Badge** - Badge component
- **Switch** - Toggle switch component
- **Dialog** - Modal dialog component
- **Table** - Table component

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck

# Test
pnpm test

# Lint
pnpm lint
```

## License

See LICENSE.md file in the root of the repository

