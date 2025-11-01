#!/bin/bash

# PM2 Log Directory Setup Script
# 
# This script creates the necessary log directories for PM2 processes.
# Run this script before starting PM2 for the first time.

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Default log directory
LOG_DIR="${PM2_LOG_DIR:-/var/log/pm2}"

log_info "Setting up PM2 log directory: $LOG_DIR"

# Check if running with sudo for system-wide installation
if [ "$LOG_DIR" = "/var/log/pm2" ]; then
  if [ "$EUID" -ne 0 ]; then
    log_warn "System-wide log directory requires sudo privileges."
    log_warn "Please run: sudo $0"
    log_warn "Or use a user-specific directory: PM2_LOG_DIR=~/.pm2/logs $0"
    exit 1
  fi
fi

# Create log directory
if [ ! -d "$LOG_DIR" ]; then
  log_info "Creating log directory: $LOG_DIR"
  mkdir -p "$LOG_DIR"
  
  # Set appropriate permissions
  if [ "$LOG_DIR" = "/var/log/pm2" ]; then
    # For system-wide, set ownership to current user or deploy user
    CURRENT_USER="${SUDO_USER:-$USER}"
    chown -R "$CURRENT_USER:$CURRENT_USER" "$LOG_DIR"
    chmod 755 "$LOG_DIR"
    log_info "Set ownership to $CURRENT_USER"
  fi
else
  log_info "Log directory already exists: $LOG_DIR"
fi

# Verify write permissions
if [ -w "$LOG_DIR" ]; then
  log_info "✓ Write permission verified"
else
  log_error "✗ No write permission for $LOG_DIR"
  exit 1
fi

# Create test log file
TEST_FILE="$LOG_DIR/pm2-setup-test.log"
if echo "PM2 log directory test" > "$TEST_FILE" 2>/dev/null; then
  log_info "✓ Test write successful"
  rm "$TEST_FILE"
else
  log_error "✗ Failed to write test file"
  exit 1
fi

log_info "Setup completed successfully!"
log_info ""
log_info "You can now start PM2 with:"
log_info "  pm2 start pm2.config.cjs --env prod"
log_info ""
log_info "View logs with:"
log_info "  pm2 logs"
log_info "  tail -f $LOG_DIR/*.log"
