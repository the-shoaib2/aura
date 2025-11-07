# AURA Dev Container

Development container setup for AURA, similar to n8n's dev container approach.

## Features

- **VS Code Dev Container** support
- **GitHub Codespaces** ready
- **Pre-configured environment** with all dependencies
- **Hot reload** support
- **Database and Redis** included

## Prerequisites

- Docker Desktop
- VS Code with [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Or use GitHub Codespaces

## Usage

### VS Code

1. Open VS Code in the AURA directory
2. Press `F1` or `Cmd/Ctrl + Shift + P`
3. Select "Dev Containers: Reopen in Container"
4. Wait for container to build and start
5. VS Code will automatically install dependencies and build packages

### GitHub Codespaces

1. Click "Code" button in GitHub
2. Select "Codespaces" tab
3. Click "Create codespace on main"
4. Wait for environment to set up

## What's Included

- **Node.js 22** with pnpm
- **PostgreSQL 16** (port 5432)
- **Redis 7** (port 6379)
- **All AURA dependencies** pre-installed
- **Environment variables** pre-configured

## Ports

- **3000**: Gateway (main access point)
- **3008**: Registry
- **5432**: PostgreSQL
- **6379**: Redis

All services are accessible through the gateway on port 3000 (like n8n).

## Environment Variables

Environment variables are configured in `devcontainer.json`:

```json
{
  "remoteEnv": {
    "DB_TYPE": "postgres",
    "DB_HOST": "postgres",
    "DB_USER": "aura",
    "DB_PASS": "aura_dev_password",
    "REDIS_HOST": "redis",
    "JWT_SECRET": "aura-dev-jwt-secret-key-min-32-characters"
  }
}
```

## Commands

Once inside the container:

```bash
# Install dependencies (automatic on first open)
pnpm install

# Build packages (automatic on attach)
pnpm build

# Start development
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint
```

## Troubleshooting

### Container won't start

1. Ensure Docker Desktop is running
2. Check Docker has enough resources (4GB RAM, 2 CPUs recommended)
3. Try rebuilding: `Dev Containers: Rebuild Container`

### Port conflicts

If ports are already in use, change them in `devcontainer.json`:

```json
{
  "forwardPorts": [3000, 3008, 5432, 6379],
  "portsAttributes": {
    "3000": {
      "onAutoForward": "notify"
    }
  }
}
```

### Database connection issues

Ensure PostgreSQL container is healthy:

```bash
docker-compose -f .devcontainer/docker-compose.yml ps
```

### Permissions issues

The container runs as `node` user. If you need root access:

```bash
sudo <command>
```

## Customization

### Add VS Code Extensions

Edit `devcontainer.json`:

```json
{
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "your-extension-id"
      ]
    }
  }
}
```

### Change Node Version

Edit `.devcontainer/Dockerfile`:

```dockerfile
FROM node:20-alpine  # Change version here
```

### Add Services

Edit `.devcontainer/docker-compose.yml` to add more services.

## References

- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [GitHub Codespaces](https://github.com/features/codespaces)
- [n8n Dev Container](https://github.com/n8n-io/n8n/tree/master/.devcontainer)

