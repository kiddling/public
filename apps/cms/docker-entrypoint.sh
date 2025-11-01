#!/bin/sh
set -e

# Set default values for environment variables
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-1337}"
export NODE_ENV="${NODE_ENV:-production}"

# Set Node.js memory options if not already set
if [ -z "$NODE_OPTIONS" ]; then
  export NODE_OPTIONS="--max-old-space-size=2048"
fi

# Set timezone (default to Asia/Shanghai for China)
export TZ="${TZ:-Asia/Shanghai}"

echo "Starting Strapi CMS..."
echo "Environment: $NODE_ENV"
echo "Host: $HOST"
echo "Port: $PORT"
echo "Timezone: $TZ"

# Execute the main command
exec "$@"
