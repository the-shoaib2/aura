#!/bin/bash
# AURA Simple Run Script
# Starts all AURA services using Docker Compose

set -e

# Detect docker-compose command (newer Docker uses 'docker compose', older uses 'docker-compose')
DOCKER_COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}❌ Docker Compose is not available${NC}"
    echo ""
    echo "Please install Docker Desktop which includes Docker Compose"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 Starting AURA Platform"
echo "========================="
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo ""
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo ""
    echo "Running install.sh to create .env file..."
    ./scripts/install.sh
    echo ""
fi

# Check if docker-compose.yml exists
if [ ! -f docker-compose.yml ]; then
    echo -e "${RED}❌ docker-compose.yml not found${NC}"
    echo ""
    echo "Please run ./scripts/install.sh first"
    exit 1
fi

# Build images if needed (first run)
echo "🔨 Building Docker images (if needed)..."
echo "   This may take a few minutes on first run..."
$DOCKER_COMPOSE_CMD build --parallel 2>&1 | grep -E "(Step|Building|Successfully|Tagged)" || true
echo ""

# Start infrastructure first (Redis, PostgreSQL)
echo "📦 Starting infrastructure services..."
$DOCKER_COMPOSE_CMD up -d redis postgres

# Wait for infrastructure to be ready
echo ""
echo "⏳ Waiting for infrastructure to be ready..."
sleep 5

# Check Redis health
echo "   Checking Redis..."
for i in {1..30}; do
    if $DOCKER_COMPOSE_CMD exec -T redis redis-cli ping &> /dev/null; then
        echo -e "   ${GREEN}✅ Redis is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "   ${RED}❌ Redis failed to start${NC}"
        exit 1
    fi
    sleep 1
done

# Check PostgreSQL health
echo "   Checking PostgreSQL..."
for i in {1..30}; do
    if $DOCKER_COMPOSE_CMD exec -T postgres pg_isready -U aura &> /dev/null; then
        echo -e "   ${GREEN}✅ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "   ${RED}❌ PostgreSQL failed to start${NC}"
        exit 1
    fi
    sleep 1
done

echo ""
echo "🚀 Starting AURA services..."
$DOCKER_COMPOSE_CMD up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "========================="
echo -e "${GREEN}✅ AURA Platform is starting!${NC}"
echo ""
echo "Services:"
echo -e "  ${BLUE}Gateway:${NC}           http://localhost:3000"
echo -e "  ${BLUE}Workflow Engine:${NC}    http://localhost:3001"
echo -e "  ${BLUE}Webhook Handler:${NC}    http://localhost:3002"
echo -e "  ${BLUE}Scheduler:${NC}          http://localhost:3003"
echo -e "  ${BLUE}Notification:${NC}       http://localhost:3004"
echo -e "  ${BLUE}Collaboration:${NC}      http://localhost:3005"
echo -e "  ${BLUE}Agent Service:${NC}      http://localhost:3006"
echo -e "  ${BLUE}Plugin Service:${NC}     http://localhost:3007"
echo -e "  ${BLUE}Registry:${NC}           http://localhost:3008"
echo -e "  ${BLUE}Messaging:${NC}          http://localhost:3009"
echo -e "  ${BLUE}Analytics:${NC}          http://localhost:3010"
echo -e "  ${BLUE}RAG Service:${NC}        http://localhost:3011"
echo -e "  ${BLUE}Vector Service:${NC}     http://localhost:3012"
echo -e "  ${BLUE}Auth Service:${NC}       http://localhost:3013"
echo ""
echo "Useful commands:"
echo "  View logs:        $DOCKER_COMPOSE_CMD logs -f"
echo "  Stop services:    $DOCKER_COMPOSE_CMD down"
echo "  Restart service:  $DOCKER_COMPOSE_CMD restart <service-name>"
echo "  Check status:     $DOCKER_COMPOSE_CMD ps"
echo ""
echo "To view logs for a specific service:"
echo "  $DOCKER_COMPOSE_CMD logs -f gateway"
echo "  $DOCKER_COMPOSE_CMD logs -f agent"
echo ""

# Show running services
echo "Service Status:"
$DOCKER_COMPOSE_CMD ps

echo ""
echo -e "${YELLOW}💡 Tip: Services may take a minute to fully start up${NC}"
echo ""

