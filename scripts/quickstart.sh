#!/bin/bash
# AURA Quick Start - Single Command Installation
# Similar to n8n's "npx n8n" or "docker run" approach

set -e

# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 AURA Quick Start${NC}"
echo "===================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is required. Please install Docker Desktop first.${NC}"
    echo ""
    echo "Download: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Detect docker-compose command
DOCKER_COMPOSE_CMD=""
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}❌ Docker Compose is required${NC}"
    exit 1
fi

# Create .env if it doesn't exist (like n8n - simple env vars)
if [ ! -f .env ]; then
    echo "📝 Creating default configuration..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Configuration created from .env.example${NC}"
    else
        cat > .env << 'EOF'
# AURA Quick Start Configuration
DB_TYPE=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USER=aura
DB_PASS=aura_dev_password
DB_NAME=aura
DB_PASSWORD=aura_dev_password

REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=aura-dev-jwt-secret-key-min-32-characters-long-change-in-production

GATEWAY_URL=http://gateway:3000
REGISTRY_URL=http://registry:3008
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
NODE_ENV=development
EOF
        echo -e "${GREEN}✅ Configuration created${NC}"
    fi
    echo ""
fi

# Start services using quickstart compose file
echo "🚀 Starting AURA (minimal setup)..."
echo ""

# Use dev compose for simpler setup (like n8n - single port)
COMPOSE_FILE="docker-compose.dev.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose.quickstart.yml"
    if [ ! -f "$COMPOSE_FILE" ]; then
        COMPOSE_FILE="docker-compose.yml"
        echo -e "${YELLOW}⚠️  Dev compose not found, using full compose${NC}"
    fi
fi

# Pull/build and start
$DOCKER_COMPOSE_CMD -f $COMPOSE_FILE up -d --build

echo ""
echo -e "${GREEN}✅ AURA is starting!${NC}"
echo ""
echo "Services will be available at:"
echo -e "  ${BLUE}Gateway (All Services):${NC}  http://localhost:3000"
echo -e "  ${BLUE}Database:${NC}                localhost:5432"
echo -e "  ${BLUE}Redis:${NC}                   localhost:6379"
echo ""
echo "Like n8n, all services are accessed through the gateway on port 3000"
echo ""
echo "Useful commands:"
echo "  View logs:    $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs -f"
echo "  Stop:         $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE down"
echo "  Status:       $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE ps"
echo ""
echo -e "${YELLOW}💡 Note: Services may take a minute to fully start${NC}"
echo -e "${YELLOW}   For full platform with all services, use: ./scripts/run.sh${NC}"
echo ""

