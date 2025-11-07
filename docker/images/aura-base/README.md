# AURA Base Docker Image

This is the base Docker image for all AURA services. It provides:

- Node.js 22.16.0 (Alpine)
- pnpm 10.18.3 (matching AURA requirements)
- Essential system dependencies
- Non-root user (`aura`) for security
- Tini init system for proper signal handling

## Building

```bash
docker build -f docker/images/aura-base/Dockerfile -t aura-base:latest .
```

## Usage

This image is used as the base for all service-specific Dockerfiles. It should not be used directly.

