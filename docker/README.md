# AURA Docker Setup

This directory contains the Docker configuration for building and running AURA services.

## Directory Structure

```
docker/
├── images/
│   ├── aura-base/           # Base Docker image for all services
│   │   ├── Dockerfile       # Base image definition
│   │   └── README.md        # Base image documentation
│   └── services/            # Service-specific Dockerfiles
│       ├── docker-entrypoint.sh    # Shared entrypoint script
│       ├── Dockerfile.gateway
│       ├── Dockerfile.workflow-engine
│       ├── Dockerfile.webhook-handler
│       ├── Dockerfile.scheduler
│       ├── Dockerfile.notification
│       ├── Dockerfile.collaboration
│       ├── Dockerfile.agent
│       ├── Dockerfile.plugin
│       ├── Dockerfile.registry
│       ├── Dockerfile.messaging
│       ├── Dockerfile.analytics
│       ├── Dockerfile.rag
│       ├── Dockerfile.vector
│       └── Dockerfile.auth
└── README.md                # This file
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 22.16.0+ (for local development)
- pnpm 10.18.3+ (for local development)

## Building Images

### Build Base Image

First, build the base image that all services depend on:

```bash
docker build -t aura-base:latest -f docker/images/aura-base/Dockerfile .
```

### Build Individual Services

You can build individual service images:

```bash
# Build a specific service
docker build -t aura-gateway:latest \
  --build-arg BASE_IMAGE=aura-base:latest \
  -f docker/images/services/Dockerfile.gateway .

# Or build all services using docker-compose
docker-compose build
```

### Build Arguments

All service Dockerfiles support the following build arguments:

- `NODE_VERSION`: Node.js version (default: `22.16.0`)
- `AURA_VERSION`: AURA version tag (default: `latest`)
- `BASE_IMAGE`: Base image name (default: `aura-base:latest`)

Example:

```bash
docker build -t aura-gateway:v1.0.0 \
  --build-arg NODE_VERSION=22.16.0 \
  --build-arg AURA_VERSION=v1.0.0 \
  --build-arg BASE_IMAGE=aura-base:latest \
  -f docker/images/services/Dockerfile.gateway .
```

## Multi-Stage Builds

All service Dockerfiles use a multi-stage build process:

1. **Dependencies Stage**: Installs production dependencies only
2. **Builder Stage**: Installs all dependencies (including dev) and builds TypeScript
3. **Runtime Stage**: Creates the final image with only production dependencies and built artifacts

This approach results in smaller, more secure images by:
- Excluding development dependencies from the final image
- Including only compiled JavaScript files
- Using layer caching for faster rebuilds

## Entrypoint Script

All services use a shared entrypoint script (`docker-entrypoint.sh`) that:

- Handles custom SSL certificates if provided
- Waits for dependency services to be ready (if `WAIT_FOR_HOSTS` is set)
- Executes the service with proper error handling

### Custom Certificates

To use custom SSL certificates, mount them to `/opt/custom-certificates`:

```yaml
volumes:
  - ./certs:/opt/custom-certificates:ro
```

### Waiting for Dependencies

Set the `WAIT_FOR_HOSTS` environment variable to wait for services:

```yaml
environment:
  WAIT_FOR_HOSTS: "redis:6379,postgres:5432"
```

## Running Services

### Using Docker Compose

The easiest way to run all services is using docker-compose:

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d gateway registry

# View logs
docker-compose logs -f gateway

# Stop all services
docker-compose down
```

### Using Docker Run

You can also run individual services:

```bash
docker run -d \
  --name aura-gateway \
  -p 3000:3000 \
  -e PORT=3000 \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  --network aura-network \
  aura-gateway:latest
```

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Gateway | 3000 | API Gateway |
| Workflow Engine | 3001 | Workflow execution |
| Webhook Handler | 3002 | Webhook processing |
| Scheduler | 3003 | Task scheduling |
| Notification | 3004 | Notifications |
| Collaboration | 3005 | Real-time collaboration |
| Agent | 3006 | Agent service |
| Plugin | 3007 | Plugin system |
| Registry | 3008 | Service registry |
| Messaging | 3009 | Messaging service |
| Analytics | 3010 | Analytics service |
| RAG | 3011 | RAG service |
| Vector | 3012 | Vector service |
| Auth | 3013 | Authentication service |

## Environment Variables

Each service requires specific environment variables. See `docker-compose.yml` for the complete list.

Common variables:
- `NODE_ENV`: Environment (production, development)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `PORT`: Service port
- `REDIS_HOST`: Redis hostname
- `REDIS_PORT`: Redis port
- `DB_HOST`: Database hostname
- `DB_PORT`: Database port
- `DB_USER`: Database user
- `DB_PASS`: Database password
- `DB_NAME`: Database name
- `REGISTRY_URL`: Registry service URL

## Development

### Local Development with Docker

For local development, you may want to mount your source code:

```yaml
services:
  gateway:
    volumes:
      - ./services/gateway:/app/services/gateway
      - ./packages:/app/packages
```

### Hot Reload

For hot reload during development, use volume mounts and a file watcher like `nodemon` or `tsx`.

### Debugging

To debug a service, you can:

1. Override the entrypoint:
```bash
docker run -it --entrypoint /bin/sh aura-gateway:latest
```

2. Enable debug logging:
```bash
docker run -e LOG_LEVEL=debug aura-gateway:latest
```

## Image Optimization

### Layer Caching

The Dockerfiles are optimized for layer caching:
- Package files are copied first
- Dependencies are installed before source code
- Source code is copied last

### Image Size

To reduce image size:
- Use multi-stage builds (already implemented)
- Remove unnecessary packages
- Use Alpine-based images (base image uses Alpine)
- Exclude test files and development dependencies

## Security

### Non-Root User

All services run as a non-root user (`aura`) for security.

### Security Scanning

Regularly scan images for vulnerabilities:

```bash
docker scan aura-gateway:latest
```

### Secrets Management

Never commit secrets to the repository. Use:
- Environment variables
- Docker secrets
- External secret management services

## Troubleshooting

### Build Failures

1. **Base image not found**: Build the base image first
2. **Dependencies not found**: Ensure `pnpm-lock.yaml` is up to date
3. **Build timeout**: Increase Docker build timeout or check network connectivity

### Runtime Issues

1. **Service won't start**: Check logs with `docker-compose logs <service>`
2. **Connection refused**: Verify service dependencies are running
3. **Permission denied**: Check file permissions and user settings

### Common Commands

```bash
# Check running containers
docker-compose ps

# View service logs
docker-compose logs -f <service>

# Restart a service
docker-compose restart <service>

# Rebuild and restart
docker-compose up -d --build <service>

# Remove all containers and volumes
docker-compose down -v

# Clean up unused images
docker image prune -a
```

## CI/CD Integration

### Building for Production

```bash
# Build all services
docker-compose build

# Tag images
docker tag aura-gateway:latest registry.example.com/aura-gateway:v1.0.0

# Push to registry
docker push registry.example.com/aura-gateway:v1.0.0
```

### Multi-Architecture Builds

For multi-architecture builds (ARM64, AMD64), use Docker Buildx:

```bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t aura-gateway:latest .
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AURA Architecture Documentation](../ARCHITECTURE.md)
- [AURA Development Guide](../DEVELOPMENT.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review service logs
3. Consult the AURA documentation
4. Open an issue on GitHub

