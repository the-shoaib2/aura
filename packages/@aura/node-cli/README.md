# @aura/node-cli

Official CLI for developing community nodes for aura.

## 🚀 Getting Started

**To create a new node**, run:

```bash
npm create @aura/node@latest # or pnpm/yarn/...
```

This will generate a project with `npm` scripts that use this CLI under the hood.

## 📦 Generated Project Commands

After creating your node with `npm create @aura/node`, you'll use these commands in your project:

### Development
```bash
npm run dev
# Runs: aura-node dev
```

### Building
```bash
npm run build
# Runs: aura-node build
```

### Linting
```bash
npm run lint
# Runs: aura-node lint

npm run lint:fix
# Runs: aura-node lint --fix
```

### Publishing
```bash
npm run release
# Runs: aura-node release
```

## 🛠️ CLI Reference

> **Note:** These commands are typically wrapped by `npm` scripts in generated projects.

```bash
aura-node [COMMAND] [OPTIONS]
```

### Commands

#### `aura-node new`

Create a new node project.

```bash
aura-node new [NAME] [OPTIONS]
```

**Flags:**
| Flag | Description |
|------|-------------|
| `-f, --force` | Overwrite destination folder if it already exists |
| `--skip-install` | Skip installing dependencies |
| `--template <template>` | Choose template: `declarative/custom`, `declarative/github-issues`, `programmatic/example` |

**Examples:**
```bash
aura-node new
aura-node new aura-nodes-my-app --skip-install
aura-node new aura-nodes-my-app --force
aura-node new aura-nodes-my-app --template declarative/custom
```

> **Note:** This command is used internally by `npm create @aura/node` to provide the interactive scaffolding experience.

#### `aura-node dev`

Run aura with your node in development mode with hot reload.

```bash
aura-node dev [--external-aura] [--custom-user-folder <value>]
```

**Flags:**
| Flag | Description |
|------|-------------|
| `--external-aura` | Run aura externally instead of in a subprocess |
| `--custom-user-folder <path>` | Folder to use to store user-specific aura data (default: `~/.aura-node-cli`) |

This command:
- Starts aura on `http://localhost:5678` (unless using `--external-aura`)
- Links your node to aura's custom nodes directory (`~/.aura-node-cli/.aura/custom`)
- Rebuilds on file changes for live preview
- Watches for changes in your `src/` directory

**Examples:**
```bash
# Standard development with built-in aura
aura-node dev

# Use external aura instance
aura-node dev --external-aura

# Custom aura extensions directory
aura-node dev --custom-user-folder /home/user
```

#### `aura-node build`

Compile your node and prepare it for distribution.

```bash
aura-node build
```

**Flags:** None

Generates:
- Compiled TypeScript code
- Bundled node package
- Optimized assets and icons
- Ready-to-publish package in `dist/`

#### `aura-node lint`

Lint the node in the current directory.

```bash
aura-node lint [--fix]
```

**Flags:**
| Flag | Description |
|------|-------------|
| `--fix` | Automatically fix problems |

**Examples:**
```bash
# Check for linting issues
aura-node lint

# Automatically fix fixable issues
aura-node lint --fix
```

#### `aura-node cloud-support`

Manage aura Cloud eligibility.

```bash
aura-node cloud-support [enable|disable]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| _(none)_ | Show current cloud support status |
| `enable` | Enable strict mode + default ESLint config |
| `disable` | Allow custom ESLint config (disables cloud eligibility) |

Strict mode enforces the default ESLint configuration and community node rules required for aura Cloud verification. When disabled, you can customize your ESLint config but your node won't be eligible for aura Cloud verification.

#### `aura-node release`

Publish your community node package to npm.

```bash
aura-node release
```

**Flags:** None

This command handles the complete release process using [release-it](https://github.com/release-it/release-it):
- Builds the node
- Runs linting checks
- Updates changelog
- Creates git tags
- Creates GitHub releases
- Publishes to npm

## 🔄 Development Workflow

The recommended workflow using the scaffolding tool:

1. **Create your node**:
   ```bash
   npm create @aura/node my-awesome-node
   cd my-awesome-node
   ```

2. **Start development**:
   ```bash
   npm run dev
   ```
   - Starts aura on `http://localhost:5678`
   - Links your node automatically
   - Rebuilds on file changes

3. **Test your node** at `http://localhost:5678`

4. **Lint your code**:
   ```bash
   npm run lint
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Publish**:
   ```bash
   npm run release
   ```

## 📁 Project Structure

The CLI expects your project to follow this structure:

```
my-node/
├── src/
│   ├── nodes/
│   │   └── MyNode/
│   │       ├── MyNode.node.ts
│   │       └── MyNode.node.json
│   └── credentials/
├── package.json
└── tsconfig.json
```

## ⚙️ Configuration

The CLI reads configuration from your `package.json`:

```json
{
  "name": "aura-nodes-my-awesome-node",
  "aura": {
    "auraNodesApiVersion": 1,
    "nodes": [
      "dist/nodes/MyNode/MyNode.node.js"
    ],
    "credentials": [
      "dist/credentials/MyNodeAuth.credentials.js"
    ]
  }
}
```

## 🐛 Troubleshooting

### Development server issues
```bash
# Clear aura custom nodes cache
rm -rf ~/.aura-node-cli/.aura/custom

# Restart development server
npm run dev
```

### Build failures
```bash
# Run linting first
npm run lint

# Clean build
npm run build
```

## 📚 Resources

- **[Creating Nodes Guide](https://docs.aura.io/integrations/creating-nodes/)** - Complete documentation
- **[Node Development Reference](https://docs.aura.io/integrations/creating-nodes/build/reference/)** - API specifications
- **[Community Forum](https://community.aura.io)** - Get help and showcase your nodes
- **[@aura/create-node](https://www.npmjs.com/package/@aura/create-node)** - Recommended scaffolding tool

## 🤝 Contributing

Found an issue? Contribute to the [aura repository](https://github.com/aura) on GitHub.

---

**Happy node development! 🎉**
