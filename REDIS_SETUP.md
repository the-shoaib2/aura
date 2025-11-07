# Redis Setup Guide

## Option 1: Install Homebrew (Recommended for macOS)

Homebrew is the easiest way to install Redis on macOS:

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install and start Redis
brew install redis
brew services start redis

# Verify it's running
redis-cli ping
# Should return: PONG
```

## Option 2: Download Redis Manually

1. Download Redis from: https://redis.io/download
2. Extract and compile:
```bash
wget https://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make
sudo make install
```

3. Start Redis:
```bash
redis-server
```

## Option 3: Use Docker (if Docker Desktop is installed)

```bash
docker run -d --name aura-redis -p 6379:6379 redis:7-alpine

# Verify it's running
docker ps | grep redis
```

## Option 4: Run Redis without Installation (Quick Test)

If you just want to test the project, you can run services that don't require Redis first, or configure services to work without Redis (though some features won't work).

## Verify Redis is Running

After starting Redis, verify it's working:

```bash
redis-cli ping
# Should return: PONG
```

## After Redis is Running

Once Redis is started, run:

```bash
pnpm dev
```

This will start all AURA services.


