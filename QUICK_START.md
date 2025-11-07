# Quick Start Guide

## Step 1: Install Redis

You need Redis running for AURA services. Choose one option:

### Option A: Install Homebrew + Redis (Recommended)

1. **Install Homebrew** (if not installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install and start Redis**:
   ```bash
   brew install redis
   brew services start redis
   ```

3. **Verify Redis is running**:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### Option B: Use the installation script
```bash
./install-redis.sh
```

### Option C: Run Frontend Only (No Redis needed)
```bash
# Start just the web app (no backend services)
pnpm dev:fe
```

## Step 2: Start the Project

Once Redis is running:

```bash
# Start all services
pnpm dev
```

## Step 3: Access the Application

- **Web App**: http://localhost:3000
- **Gateway**: http://localhost:3000
- **Workflow Engine**: http://localhost:3001
- **Registry**: http://localhost:3008

## Troubleshooting

### Redis connection errors?
- Make sure Redis is running: `redis-cli ping`
- Check if port 6379 is in use: `lsof -i :6379`

### Port already in use?
- Stop other services using those ports
- Or change ports in `.env` file

### Still having issues?
See `REDIS_SETUP.md` for more detailed instructions.
