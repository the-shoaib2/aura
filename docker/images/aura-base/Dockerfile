ARG NODE_VERSION=22.16.0

# ==============================================================================
# STAGE 1: Builder for Base Dependencies
# ==============================================================================
FROM node:${NODE_VERSION}-alpine AS builder

# Install essential OS dependencies
RUN apk update && \
    apk add --no-cache \
        git \
        openssh \
        openssl \
        tini \
        tzdata \
        ca-certificates \
        libc6-compat \
        jq \
        curl \
        bash

# Install pnpm globally (matches AURA package.json requirement)
RUN corepack enable && \
    corepack prepare pnpm@10.18.3 --activate

# Clean up
RUN rm -rf /tmp/* /var/cache/apk/* /root/.npm /root/.cache

# ==============================================================================
# STAGE 2: Final Base Runtime Image
# ==============================================================================
FROM node:${NODE_VERSION}-alpine

# Copy system dependencies from builder
COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder /usr/local/bin/corepack /usr/local/bin/corepack
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules

# Install runtime dependencies
RUN apk add --no-cache \
        tini \
        tzdata \
        ca-certificates \
        libc6-compat \
        curl \
        bash && \
    corepack enable && \
    corepack prepare pnpm@10.18.3 --activate

# Create non-root user for security
RUN addgroup -g 1000 -S aura && \
    adduser -u 1000 -S -G aura -h /home/aura -D aura

WORKDIR /home/aura
ENV NODE_ENV=production
ENV PNPM_HOME=/usr/local/bin
ENV PATH="$PNPM_HOME:$PATH"

USER aura
EXPOSE 3000

# Default entrypoint (can be overridden)
ENTRYPOINT ["tini", "--"]

LABEL org.opencontainers.image.title="AURA Base" \
      org.opencontainers.image.description="Base image for AURA services" \
      org.opencontainers.image.source="https://github.com/aura-io/aura" \
      org.opencontainers.image.vendor="AURA"

