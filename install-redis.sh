#!/bin/bash
# Redis Installation Script for macOS

echo "🚀 AURA Redis Installation Helper"
echo "=================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Homebrew is not installed. Installing Homebrew..."
    echo ""
    echo "This will install Homebrew (package manager for macOS)"
    echo "Run this command to install Homebrew:"
    echo ""
    echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    echo ""
    echo "After Homebrew is installed, run this script again, or run:"
    echo "  brew install redis"
    echo "  brew services start redis"
    echo ""
    exit 1
fi

echo "✅ Homebrew is installed"
echo ""

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "📦 Installing Redis..."
    brew install redis
    echo ""
fi

echo "✅ Redis is installed"
echo ""

# Start Redis
echo "🚀 Starting Redis..."
brew services start redis

# Wait a moment for Redis to start
sleep 2

# Verify Redis is running
if redis-cli ping &> /dev/null; then
    echo "✅ Redis is running!"
    echo ""
    echo "You can now run: pnpm dev"
else
    echo "⚠️  Redis might not be running. Try manually:"
    echo "  redis-server"
    echo ""
fi


