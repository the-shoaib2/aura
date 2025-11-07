FROM node:22-alpine

# Install system dependencies
RUN apk add --no-cache --update openssh sudo shadow bash git

# Setup sudo for node user
RUN echo node ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/node && chmod 0440 /etc/sudoers.d/node

# Create workspace directory
RUN mkdir /workspace && chown node:node /workspace

# Install pnpm
RUN npm install -g pnpm@10.0.0

# Switch to node user
USER node

# Setup pnpm store
RUN mkdir -p ~/.pnpm-store && pnpm config set store-dir ~/.pnpm-store --global

# Set working directory
WORKDIR /workspace

# Default command
CMD ["sleep", "infinity"]

