# @aura/create-node

A powerful scaffolding tool to quickly create custom aura community nodes with best practices built-in.

## 🚀 Quick Start

Create a new aura node in seconds:

```bash
npm create @aura/node@latest # or pnpm/yarn/...
```

Follow the interactive prompts to configure your node, or specify options directly:

```bash
npm create @aura/node my-awesome-node --template declarative/custom
```

## 📋 Command Line Options

```bash
npm create @aura/node [NAME] [OPTIONS]
```

### Options

| Flag | Description |
|------|-------------|
| `-f, --force` | Overwrite destination folder if it already exists |
| `--skip-install` | Skip automatic dependency installation |
| `--template <template>` | Specify which template to use |

### Available Templates

- **`declarative/custom`** - Start with a minimal declarative node structure
- **`declarative/github-issues`** - GitHub Issues integration example
- **`programmatic/example`** - Full programmatic node with advanced features

## 🎯 Interactive Setup

The CLI will guide you through setting up your node:

```
$ npm create @aura/node
┌ @aura/create-node
│
◇ What is your node called?
│ my-awesome-api-node
│
◇ What kind of node are you building?
│ HTTP API
│
◇ What template do you want to use?
│ Start from scratch
│
◇ What's the base URL of the API?
│ https://api.example.com/v1
│
◇ What type of authentication does your API use?
│ API Key
│
◇ Files copied ✓
│
◇ Dependencies installed ✓
│
◇ Next Steps ─────────────────────────────────────────────────────────────────────╮
│                                                                                  │
│  cd ./my-awesome-api-node && npm run dev                                       │
│                                                                                  │
│  📚 Documentation: https://docs.aura.io/integrations/creating-nodes/            │
│  💬 Community: https://community.aura.io                                        │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────╯
│
└ Created ./my-awesome-api-node ✨
```

## 🛠️ Development Workflow

### 1. Navigate to your project

```bash
cd ./my-awesome-api-node
```

### 2. Start development server

```bash
npm run dev
```

This command:
- Starts aura in development mode on `http://localhost:5678`
- Enables hot reload for your node changes
- Automatically includes your node in the aura instance
- Links your node to `~/.aura-node-cli/.aura/custom` for development
- Watches for file changes and rebuilds automatically

### 3. Test your node

- Open aura at `http://localhost:5678`
- Create a new workflow
- Find your node in the node panel
- Test parameters and functionality in real-time

## 📦 Generated Project Commands

Your generated project comes with these convenient npm scripts:

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

## 📦 Build & Deploy

### Build for production

```bash
npm run build
```

Generates:
- Compiled TypeScript code
- Bundled node package
- Optimized assets and icons
- Ready-to-publish package

### Quality checks

```bash
npm run lint
```

Validates:
- Code style and formatting
- aura node conventions
- Common integration issues
- Cloud publication readiness

### Cloud support

```bash
npx aura-node cloud-support
```

Manage aura Cloud publication eligibility. In strict mode, your node must use the default ESLint config and pass all community node rules to be eligible for aura Cloud publication.

Fix issues automatically:

```bash
npm run lint:fix
```

### Publish your node

```bash
npm run release
```

Runs [release-it](https://github.com/release-it/release-it) to handle the complete release process:
- Ensures working directory is clean
- Verifies you're on the main git branch
- Increments your package version
- Runs build and lint checks
- Updates changelog
- Creates git tag with version bump
- Creates GitHub release with changelog
- Publishes to npm

## 📁 Project Structure

Your generated project includes:

```
my-awesome-api-node/
├── src/
│   ├── nodes/
│   │   └── MyAwesomeApi/
│   │       ├── MyAwesomeApi.node.ts    # Main node logic
│   │       └── MyAwesomeApi.node.json  # Node metadata
│   └── credentials/
│       └── MyAwesomeApiAuth.credentials.ts
├── package.json
├── tsconfig.json
└── README.md
```

The CLI expects your project to follow this structure for proper building and development.

## ⚙️ Configuration

The CLI reads configuration from your `package.json`:

```json
{
  "name": "aura-nodes-my-awesome-node",
  "aura": {
    "auraNodesApiVersion": 1,
    "nodes": [
      "dist/nodes/MyAwesomeApi/MyAwesomeApi.node.js"
    ],
    "credentials": [
      "dist/credentials/MyAwesomeApiAuth.credentials.js"
    ]
  }
}
```

## 🎨 Node Types

Choose the right template for your use case:

| Template | Best For | Features |
|----------|----------|----------|
| **Declarative** | REST APIs, simple integrations | JSON-based configuration, automatic UI generation |
| **Programmatic** | Complex logic, custom operations | Full TypeScript control, advanced error handling |

## 🐛 Troubleshooting

### Common Issues

**Node not appearing in aura:**
```bash
# Clear aura node cli cache and restart
rm -rf ~/.aura-node-cli/.aura/custom
npm run dev
```

**TypeScript errors:**
```bash
# Reinstall dependencies
rm -rf node_modules npm-lock.yaml
npm install
```

**Build failures:**
```bash
# Check for linting issues first
npm run lint --fix
npm run build
```

**Development server issues:**
```bash
# Clear cache and restart development server
rm -rf ~/.aura-node-cli/.aura/custom
npm run dev
```

## 🔧 Advanced Usage

### Using External aura Instance

If you prefer to use your own aura installation:

```bash
npm run dev --external-aura
```

### Custom User Folder

Specify a custom location for aura user data:

```bash
npm run dev --custom-user-folder /path/to/custom/folder
```

## 📚 Resources

- **[Node Development Guide](https://docs.aura.io/integrations/creating-nodes/)** - Complete documentation
- **[API Reference](https://docs.aura.io/integrations/creating-nodes/build/reference/)** - Technical specifications
- **[Community Forum](https://community.aura.io)** - Get help and share your nodes
- **[Node Examples](https://github.com/aura/tree/master/packages/nodes-base/nodes)** - Official node implementations
- **[@aura/node-cli](https://www.npmjs.com/package/@aura/node-cli)** - The underlying CLI tool

## 🤝 Contributing

Found a bug or want to contribute? Check out the [aura repository](https://github.com/aura) and join our community!

---

**Happy node building! 🎉**
