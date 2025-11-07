#!/bin/sh
set -e

# Handle custom certificates if provided
if [ -d /opt/custom-certificates ]; then
  echo "Trusting custom certificates from /opt/custom-certificates."
  export NODE_OPTIONS="--use-openssl-ca $NODE_OPTIONS"
  export SSL_CERT_DIR=/opt/custom-certificates
  if command -v c_rehash >/dev/null 2>&1; then
    c_rehash /opt/custom-certificates
  fi
fi

# Wait for dependencies if needed
if [ -n "$WAIT_FOR_HOSTS" ]; then
  echo "Waiting for dependencies: $WAIT_FOR_HOSTS"
  for host in $(echo $WAIT_FOR_HOSTS | tr ',' ' '); do
    hostname=$(echo $host | cut -d: -f1)
    port=$(echo $host | cut -d: -f2)
    echo "Waiting for $hostname:$port..."
    while ! nc -z "$hostname" "$port" 2>/dev/null; do
      sleep 1
    done
    echo "$hostname:$port is ready"
  done
fi

# Execute the service
if [ "$#" -gt 0 ]; then
  # Got started with arguments
  exec node "$@"
else
  # Got started without arguments - use default service entrypoint
  exec node /app/dist/index.js
fi

