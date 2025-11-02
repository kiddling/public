#!/bin/bash
#
# restore.sh - Restore script for Postgres and Strapi uploads
#
# Usage: ./restore.sh [OPTIONS]
# Options:
#   -p, --postgres FILE     Postgres backup file to restore
#   -u, --uploads FILE      Uploads tar archive to restore
#   -l, --list              List available backups
#   -h, --help              Show this help message
#

set -euo pipefail

# Default configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
POSTGRES_FILE=""
UPLOADS_FILE=""
LIST_MODE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

# Show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Restore script for Postgres database and Strapi uploads directory.

Options:
    -p, --postgres FILE     Postgres backup file (.sql.gz) to restore
    -u, --uploads FILE      Uploads tar archive (.tar.gz) to restore
    -l, --list              List available backups
    -h, --help              Show this help message

Environment Variables:
    DATABASE_HOST           Postgres host (default: localhost)
    DATABASE_PORT           Postgres port (default: 5432)
    DATABASE_NAME           Database name (default: strapi)
    DATABASE_USERNAME       Database username (default: strapi)
    DATABASE_PASSWORD       Database password
    UPLOADS_DIR             Strapi uploads directory (default: ./apps/cms/public/uploads)
    BACKUP_DIR              Backup directory (default: ./backups)

Examples:
    # List available backups
    $0 --list

    # Restore database only
    $0 --postgres ./backups/postgres_strapi_20240101_120000.sql.gz

    # Restore uploads only
    $0 --uploads ./backups/uploads_20240101_120000.tar.gz

    # Restore both
    $0 --postgres ./backups/postgres_strapi_20240101_120000.sql.gz \\
       --uploads ./backups/uploads_20240101_120000.tar.gz

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--postgres)
                POSTGRES_FILE="$2"
                shift 2
                ;;
            -u|--uploads)
                UPLOADS_FILE="$2"
                shift 2
                ;;
            -l|--list)
                LIST_MODE=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Load environment variables
load_env() {
    local env_file=".env"
    
    if [ -f "$env_file" ]; then
        log_info "Loading environment from $env_file"
        # shellcheck disable=SC2046
        export $(grep -v '^#' "$env_file" | xargs -d '\n')
    else
        log_warn "No .env file found, using defaults or environment variables"
    fi
}

# List available backups
list_backups() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
    
    echo ""
    echo "=== Available Postgres Backups ==="
    find "$BACKUP_DIR" -name "postgres_*.sql.gz" -type f -exec ls -lh {} \; | \
        awk '{printf "%-50s %10s %s %s %s\n", $9, $5, $6, $7, $8}' || echo "No Postgres backups found"
    
    echo ""
    echo "=== Available Uploads Backups ==="
    find "$BACKUP_DIR" -name "uploads_*.tar.gz" -type f -exec ls -lh {} \; | \
        awk '{printf "%-50s %10s %s %s %s\n", $9, $5, $6, $7, $8}' || echo "No uploads backups found"
    
    echo ""
}

# Validate required tools
validate_tools() {
    local missing_tools=()
    
    if [ -n "$POSTGRES_FILE" ] && ! command -v psql &> /dev/null; then
        missing_tools+=("psql (postgresql-client)")
    fi
    
    if [ -n "$UPLOADS_FILE" ] && ! command -v tar &> /dev/null; then
        missing_tools+=("tar")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_error "Install them with: apt-get install postgresql-client tar"
        exit 1
    fi
}

# Confirm restore operation
confirm_restore() {
    log_warn "WARNING: This will overwrite existing data!"
    
    if [ -n "$POSTGRES_FILE" ]; then
        log_warn "  - Database will be dropped and recreated"
    fi
    
    if [ -n "$UPLOADS_FILE" ]; then
        log_warn "  - Uploads directory will be replaced"
    fi
    
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Restore cancelled by user"
        exit 0
    fi
}

# Restore Postgres database
restore_postgres() {
    local db_host="${DATABASE_HOST:-localhost}"
    local db_port="${DATABASE_PORT:-5432}"
    local db_name="${DATABASE_NAME:-strapi}"
    local db_user="${DATABASE_USERNAME:-strapi}"
    local db_pass="${DATABASE_PASSWORD:-}"
    
    if [ ! -f "$POSTGRES_FILE" ]; then
        log_error "Postgres backup file not found: $POSTGRES_FILE"
        return 1
    fi
    
    log_info "Starting Postgres restore from: $POSTGRES_FILE"
    
    # Set password for psql
    export PGPASSWORD="$db_pass"
    
    # Drop existing database (be careful!)
    log_info "Dropping existing database: $db_name"
    psql -h "$db_host" -p "$db_port" -U "$db_user" -d postgres -c "DROP DATABASE IF EXISTS $db_name;" 2>/dev/null || true
    
    # Create new database
    log_info "Creating database: $db_name"
    if ! psql -h "$db_host" -p "$db_port" -U "$db_user" -d postgres -c "CREATE DATABASE $db_name;"; then
        log_error "Failed to create database"
        return 1
    fi
    
    # Restore from backup
    log_info "Restoring database from backup..."
    if gunzip -c "$POSTGRES_FILE" | psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" > /dev/null 2>&1; then
        log_info "Postgres restore completed successfully"
    else
        log_error "Postgres restore failed"
        return 1
    fi
    
    # Clear password
    unset PGPASSWORD
}

# Restore Strapi uploads
restore_uploads() {
    local uploads_dir="${UPLOADS_DIR:-./apps/cms/public/uploads}"
    local uploads_parent
    uploads_parent=$(dirname "$uploads_dir")
    
    if [ ! -f "$UPLOADS_FILE" ]; then
        log_error "Uploads backup file not found: $UPLOADS_FILE"
        return 1
    fi
    
    log_info "Starting uploads restore from: $UPLOADS_FILE"
    
    # Backup existing uploads if they exist
    if [ -d "$uploads_dir" ]; then
        local backup_name
        backup_name="${uploads_dir}.backup_$(date +%Y%m%d_%H%M%S)"
        log_info "Backing up existing uploads to: $backup_name"
        mv "$uploads_dir" "$backup_name"
    fi
    
    # Ensure parent directory exists
    mkdir -p "$uploads_parent"
    
    # Extract uploads
    log_info "Extracting uploads archive..."
    if tar -xzf "$UPLOADS_FILE" -C "$uploads_parent"; then
        log_info "Uploads restore completed successfully"
    else
        log_error "Uploads restore failed"
        return 1
    fi
}

# Generate restore summary
generate_summary() {
    log_info "=== Restore Summary ==="
    
    if [ -n "$POSTGRES_FILE" ]; then
        log_info "Postgres restored from: $POSTGRES_FILE"
    fi
    
    if [ -n "$UPLOADS_FILE" ]; then
        log_info "Uploads restored from: $UPLOADS_FILE"
        local uploads_dir="${UPLOADS_DIR:-./apps/cms/public/uploads}"
        local uploads_size
        uploads_size=$(du -sh "$uploads_dir" 2>/dev/null | cut -f1 || echo "unknown")
        log_info "Uploads directory size: $uploads_size"
    fi
    
    log_info "Restore completed successfully at $(date)"
}

# Main execution
main() {
    parse_args "$@"
    
    # Handle list mode
    if [ "$LIST_MODE" = true ]; then
        list_backups
        exit 0
    fi
    
    # Check if any restore operation requested
    if [ -z "$POSTGRES_FILE" ] && [ -z "$UPLOADS_FILE" ]; then
        log_error "No restore operation specified"
        show_usage
        exit 1
    fi
    
    load_env
    validate_tools
    confirm_restore
    
    # Perform restores
    local restore_failed=0
    
    if [ -n "$POSTGRES_FILE" ]; then
        if ! restore_postgres; then
            restore_failed=1
        fi
    fi
    
    if [ -n "$UPLOADS_FILE" ]; then
        if ! restore_uploads; then
            restore_failed=1
        fi
    fi
    
    # Generate summary
    if [ $restore_failed -eq 0 ]; then
        generate_summary
    else
        log_error "Some restore operations failed"
        exit 1
    fi
    
    exit 0
}

# Run main function
main "$@"
