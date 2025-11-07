# Quick Start Guide

## Prerequisites
- Redis must be running (see below)

## Start Redis

### Option 1: Using Docker (Recommended)
```bash
docker run -d --name aura-redis -p 6379:6379 redis:7-alpine
```

### Option 2: Using Homebrew (macOS)
```bash
brew install redis
brew services start redis
```

### Option 3: Check if already running
```bash
redis-cli ping
# Should return: PONG
```

## Run the Project

```bash
# Install dependencies (if not done)
pnpm install

# Start all services in development mode
pnpm dev
```

## Access Services

- Gateway: http://localhost:3000
- Workflow Engine: http://localhost:3001
- Agent Service: http://localhost:3006
- Registry: http://localhost:3008
- Auth Service: http://localhost:3013
- Web App: http://localhost:3000 (via gateway)

## Troubleshooting

### If services fail to start:
1. Make sure Redis is running: `redis-cli ping`
2. Check if ports are already in use
3. Review service logs in terminal

### Common Issues:
- **Redis connection errors**: Start Redis first
- **Port already in use**: Stop other services using those ports
- **TypeScript errors**: Run `pnpm build` first
