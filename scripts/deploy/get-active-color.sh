#!/bin/bash

###############################################################################
# Get Active Deployment Color
#
# Determines which deployment stack (blue or green) is currently active
# by checking the Nginx symlink or environment variable
#
# Output: "blue" or "green"
# Exit codes:
#   0 - Successfully determined active color
#   1 - Unable to determine active color
###############################################################################

set -e

# Check for active color in multiple ways

# Method 1: Check Nginx symlink (preferred for Docker deployments)
if [ -L "/etc/nginx/sites-enabled/active" ]; then
    NGINX_TARGET=$(readlink -f /etc/nginx/sites-enabled/active)
    if [[ "$NGINX_TARGET" == *"blue"* ]]; then
        echo "blue"
        exit 0
    elif [[ "$NGINX_TARGET" == *"green"* ]]; then
        echo "green"
        exit 0
    fi
fi

# Method 2: Check environment variable
if [ -n "$ACTIVE_DEPLOYMENT_COLOR" ]; then
    echo "$ACTIVE_DEPLOYMENT_COLOR"
    exit 0
fi

# Method 3: Check a marker file
if [ -f "/tmp/active-deployment-color" ]; then
    ACTIVE_COLOR=$(cat /tmp/active-deployment-color)
    echo "$ACTIVE_COLOR"
    exit 0
fi

# Method 4: Check which containers are running
if docker ps --format '{{.Names}}' | grep -q "frontend-blue"; then
    if docker ps --format '{{.Names}}' | grep -q "frontend-green"; then
        # Both running, check ports (blue should be on 3000, green on 3001)
        if docker ps --format '{{.Ports}}' | grep -q "0.0.0.0:3000"; then
            echo "blue"
            exit 0
        else
            echo "green"
            exit 0
        fi
    else
        echo "blue"
        exit 0
    fi
elif docker ps --format '{{.Names}}' | grep -q "frontend-green"; then
    echo "green"
    exit 0
fi

# Default to blue if unable to determine
echo "blue"
exit 0
