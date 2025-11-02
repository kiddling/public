#!/bin/bash
#
# backup.sh - Backup script for Postgres and Strapi uploads
# Compatible with China cron setups and provides retention controls
#
# Usage: ./backup.sh [OPTIONS]
# Options:
#   -r, --retention DAYS    Number of days to retain backups (default: 7)
#   -d, --backup-dir PATH   Backup directory path (default: ./backups)
#   -h, --help              Show this help message
#

set -euo pipefail

# Default configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    [ -n "$LOG_FILE" ] && echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    [ -n "$LOG_FILE" ] && echo "[WARN] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
    [ -n "$LOG_FILE" ] && echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Backup script for Postgres database and Strapi uploads directory.

Options:
    -r, --retention DAYS    Number of days to retain backups (default: 7)
    -d, --backup-dir PATH   Backup directory path (default: ./backups)
    -h, --help              Show this help message

Environment Variables:
    DATABASE_HOST           Postgres host (default: localhost)
    DATABASE_PORT           Postgres port (default: 5432)
    DATABASE_NAME           Database name (default: strapi)
    DATABASE_USERNAME       Database username (default: strapi)
    DATABASE_PASSWORD       Database password
    UPLOADS_DIR             Strapi uploads directory (default: ./apps/cms/public/uploads)
    BACKUP_DIR              Backup directory (default: ./backups)
    RETENTION_DAYS          Days to retain backups (default: 7)

Examples:
    # Basic backup with defaults
    $0

    # Backup with custom retention
    $0 --retention 30

    # Backup to custom directory
    $0 --backup-dir /var/backups/strapi

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -r|--retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            -d|--backup-dir)
                BACKUP_DIR="$2"
                shift 2
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

# Validate required tools
validate_tools() {
    local missing_tools=()
    
    if ! command -v pg_dump &> /dev/null; then
        missing_tools+=("pg_dump (postgresql-client)")
    fi
    
    if ! command -v tar &> /dev/null; then
        missing_tools+=("tar")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_error "Install them with: apt-get install postgresql-client tar"
        exit 1
    fi
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
    
    # Initialize log file
    LOG_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.log"
    log_info "Backup started at $(date)"
}

# Backup Postgres database
backup_postgres() {
    local db_host="${DATABASE_HOST:-localhost}"
    local db_port="${DATABASE_PORT:-5432}"
    local db_name="${DATABASE_NAME:-strapi}"
    local db_user="${DATABASE_USERNAME:-strapi}"
    local db_pass="${DATABASE_PASSWORD:-}"
    
    local backup_file="$BACKUP_DIR/postgres_${db_name}_${TIMESTAMP}.sql"
    local compressed_file="${backup_file}.gz"
    
    log_info "Starting Postgres backup for database: $db_name"
    
    # Set password for pg_dump
    export PGPASSWORD="$db_pass"
    
    # Perform backup
    if pg_dump -h "$db_host" -p "$db_port" -U "$db_user" "$db_name" > "$backup_file" 2>> "$LOG_FILE"; then
        log_info "Postgres backup completed: $backup_file"
        
        # Compress backup
        log_info "Compressing database backup..."
        if gzip "$backup_file"; then
            log_info "Backup compressed: $compressed_file"
            local size
            size=$(du -h "$compressed_file" | cut -f1)
            log_info "Compressed backup size: $size"
        else
            log_error "Failed to compress backup"
        fi
    else
        log_error "Postgres backup failed"
        return 1
    fi
    
    # Clear password
    unset PGPASSWORD
}

# Backup Strapi uploads
backup_uploads() {
    local uploads_dir="${UPLOADS_DIR:-./apps/cms/public/uploads}"
    local backup_file="$BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz"
    
    if [ ! -d "$uploads_dir" ]; then
        log_warn "Uploads directory not found: $uploads_dir"
        return 0
    fi
    
    log_info "Starting uploads backup from: $uploads_dir"
    
    # Create tar archive
    if tar -czf "$backup_file" -C "$(dirname "$uploads_dir")" "$(basename "$uploads_dir")" 2>> "$LOG_FILE"; then
        log_info "Uploads backup completed: $backup_file"
        local size
        size=$(du -h "$backup_file" | cut -f1)
        log_info "Uploads backup size: $size"
    else
        log_error "Uploads backup failed"
        return 1
    fi
}

# Clean old backups based on retention policy
clean_old_backups() {
    log_info "Cleaning backups older than $RETENTION_DAYS days..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        log_info "Deleting old backup: $(basename "$file")"
        rm -f "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "postgres_*.sql.gz" -mtime +"$RETENTION_DAYS" -print0 2>/dev/null)
    
    while IFS= read -r -d '' file; do
        log_info "Deleting old backup: $(basename "$file")"
        rm -f "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +"$RETENTION_DAYS" -print0 2>/dev/null)
    
    # Clean old log files
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "backup_*.log" -mtime +"$RETENTION_DAYS" -print0 2>/dev/null)
    
    if [ $deleted_count -gt 0 ]; then
        log_info "Deleted $deleted_count old backup file(s)"
    else
        log_info "No old backups to clean"
    fi
}

# Generate backup summary
generate_summary() {
    log_info "=== Backup Summary ==="
    log_info "Backup directory: $BACKUP_DIR"
    log_info "Retention policy: $RETENTION_DAYS days"
    
    local total_size
    total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    log_info "Total backup size: $total_size"
    
    local backup_count
    backup_count=$(find "$BACKUP_DIR" -name "*.gz" -type f 2>/dev/null | wc -l)
    log_info "Total backup files: $backup_count"
    
    log_info "Backup completed successfully at $(date)"
}

# Main execution
main() {
    parse_args "$@"
    load_env
    validate_tools
    create_backup_dir
    
    # Perform backups
    local backup_failed=0
    
    if ! backup_postgres; then
        backup_failed=1
    fi
    
    if ! backup_uploads; then
        backup_failed=1
    fi
    
    # Cleanup old backups
    clean_old_backups
    
    # Generate summary
    generate_summary
    
    if [ $backup_failed -eq 1 ]; then
        log_error "Some backups failed. Check the log file: $LOG_FILE"
        exit 1
    fi
    
    exit 0
}

# Run main function
main "$@"
