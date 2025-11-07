#!/bin/bash
# AURA Simple Stop Script
# Stops all AURA services

set -e

# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detect docker-compose command (newer Docker uses 'docker compose', older uses 'docker-compose')
DOCKER_COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}❌ Docker Compose is not available${NC}"
    exit 1
fi

echo "🛑 Stopping AURA Platform"
echo "========================"
echo ""

# Check if docker-compose.yml exists
if [ ! -f docker-compose.yml ]; then
    echo -e "${RED}❌ docker-compose.yml not found${NC}"
    echo ""
    echo "Are you in the AURA project directory?"
    exit 1
fi

# Check if services are running
if ! $DOCKER_COMPOSE_CMD ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  No services are currently running${NC}"
    exit 0
fi

# Stop services
echo "Stopping all services..."
$DOCKER_COMPOSE_CMD down

echo ""
echo "========================"
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
echo "To start again, run:"
echo "  ./scripts/run.sh"
echo ""
echo "To remove all data (⚠️  this deletes everything):"
echo "  $DOCKER_COMPOSE_CMD down -v"
echo ""

