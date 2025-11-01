#!/bin/bash
################################################################################
# Strapi Backup Script
#
# Creates timestamped backups of:
# - PostgreSQL/MySQL database
# - Uploaded files (public/uploads)
# - Configuration files
#
# Usage:
#   ./strapi-backup.sh [backup_dir]
#
# Environment variables required:
#   DATABASE_CLIENT - postgres, mysql, or sqlite
#   DATABASE_HOST - database host
#   DATABASE_PORT - database port
#   DATABASE_NAME - database name
#   DATABASE_USERNAME - database user
#   DATABASE_PASSWORD - database password
#
# Optional:
#   BACKUP_DIR - backup destination directory (default: ./backups)
#   BACKUP_RETENTION_DAYS - days to keep backups (default: 30)
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKUP_DIR="${1:-${BACKUP_DIR:-${PROJECT_ROOT}/backups}}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="strapi_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Load environment variables from .env file if exists
if [ -f "${PROJECT_ROOT}/apps/cms/.env" ]; then
    log_info "Loading environment from ${PROJECT_ROOT}/apps/cms/.env"
    set -a
    source "${PROJECT_ROOT}/apps/cms/.env"
    set +a
fi

# Validate required environment variables
validate_env() {
    local required_vars=(
        "DATABASE_CLIENT"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable ${var} is not set"
            exit 1
        fi
    done
    
    # Additional validation for non-SQLite databases
    if [ "${DATABASE_CLIENT}" != "sqlite" ]; then
        local db_vars=("DATABASE_HOST" "DATABASE_PORT" "DATABASE_NAME" "DATABASE_USERNAME" "DATABASE_PASSWORD")
        for var in "${db_vars[@]}"; do
            if [ -z "${!var:-}" ]; then
                log_error "Required environment variable ${var} is not set for ${DATABASE_CLIENT}"
                exit 1
            fi
        done
    fi
}

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory: ${BACKUP_PATH}"
    mkdir -p "${BACKUP_PATH}"
}

# Backup PostgreSQL database
backup_postgres() {
    log_info "Backing up PostgreSQL database: ${DATABASE_NAME}"
    
    local dump_file="${BACKUP_PATH}/database.sql"
    
    PGPASSWORD="${DATABASE_PASSWORD}" pg_dump \
        -h "${DATABASE_HOST}" \
        -p "${DATABASE_PORT}" \
        -U "${DATABASE_USERNAME}" \
        -d "${DATABASE_NAME}" \
        --no-owner \
        --no-acl \
        --format=plain \
        --file="${dump_file}"
    
    if [ $? -eq 0 ]; then
        log_success "Database backup completed: ${dump_file}"
        
        # Compress the dump
        gzip "${dump_file}"
        log_success "Database compressed: ${dump_file}.gz"
    else
        log_error "Database backup failed"
        return 1
    fi
}

# Backup MySQL database
backup_mysql() {
    log_info "Backing up MySQL database: ${DATABASE_NAME}"
    
    local dump_file="${BACKUP_PATH}/database.sql"
    
    mysqldump \
        -h "${DATABASE_HOST}" \
        -P "${DATABASE_PORT}" \
        -u "${DATABASE_USERNAME}" \
        -p"${DATABASE_PASSWORD}" \
        --single-transaction \
        --routines \
        --triggers \
        "${DATABASE_NAME}" > "${dump_file}"
    
    if [ $? -eq 0 ]; then
        log_success "Database backup completed: ${dump_file}"
        
        # Compress the dump
        gzip "${dump_file}"
        log_success "Database compressed: ${dump_file}.gz"
    else
        log_error "Database backup failed"
        return 1
    fi
}

# Backup SQLite database
backup_sqlite() {
    log_info "Backing up SQLite database"
    
    local db_file="${PROJECT_ROOT}/apps/cms/${DATABASE_FILENAME:-.tmp/data.db}"
    local backup_file="${BACKUP_PATH}/database.db"
    
    if [ -f "${db_file}" ]; then
        cp "${db_file}" "${backup_file}"
        log_success "Database backup completed: ${backup_file}"
        
        # Compress the database
        gzip "${backup_file}"
        log_success "Database compressed: ${backup_file}.gz"
    else
        log_error "SQLite database file not found: ${db_file}"
        return 1
    fi
}

# Backup uploaded files
backup_uploads() {
    log_info "Backing up uploaded files"
    
    local uploads_dir="${PROJECT_ROOT}/apps/cms/public/uploads"
    local backup_file="${BACKUP_PATH}/uploads.tar.gz"
    
    if [ -d "${uploads_dir}" ]; then
        tar -czf "${backup_file}" -C "${PROJECT_ROOT}/apps/cms/public" uploads
        
        if [ $? -eq 0 ]; then
            log_success "Uploads backup completed: ${backup_file}"
        else
            log_error "Uploads backup failed"
            return 1
        fi
    else
        log_warn "Uploads directory not found: ${uploads_dir}"
    fi
}

# Backup configuration files
backup_config() {
    log_info "Backing up configuration files"
    
    local config_dir="${PROJECT_ROOT}/apps/cms/config"
    local backup_file="${BACKUP_PATH}/config.tar.gz"
    
    if [ -d "${config_dir}" ]; then
        tar -czf "${backup_file}" -C "${PROJECT_ROOT}/apps/cms" config
        
        if [ $? -eq 0 ]; then
            log_success "Configuration backup completed: ${backup_file}"
        else
            log_error "Configuration backup failed"
            return 1
        fi
    else
        log_warn "Configuration directory not found: ${config_dir}"
    fi
}

# Create backup metadata
create_metadata() {
    log_info "Creating backup metadata"
    
    local metadata_file="${BACKUP_PATH}/metadata.json"
    
    cat > "${metadata_file}" <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "date": "$(date -Iseconds)",
  "database_client": "${DATABASE_CLIENT}",
  "database_name": "${DATABASE_NAME:-N/A}",
  "hostname": "$(hostname)",
  "user": "$(whoami)",
  "backup_path": "${BACKUP_PATH}",
  "files": [
$(ls -1 "${BACKUP_PATH}" | grep -v metadata.json | sed 's/^/    "/; s/$/",/')
    ""
  ]
}
EOF
    
    # Remove trailing comma
    sed -i '$ s/,$//' "${metadata_file}"
    
    log_success "Metadata created: ${metadata_file}"
}

# Verify backup integrity
verify_backup() {
    log_info "Verifying backup integrity"
    
    local all_ok=true
    
    # Check if backup directory exists and has files
    if [ ! -d "${BACKUP_PATH}" ] || [ -z "$(ls -A ${BACKUP_PATH})" ]; then
        log_error "Backup directory is empty or does not exist"
        all_ok=false
    fi
    
    # Verify database backup exists
    if [ ! -f "${BACKUP_PATH}/database.sql.gz" ] && [ ! -f "${BACKUP_PATH}/database.db.gz" ]; then
        log_error "Database backup file not found"
        all_ok=false
    fi
    
    # Test gzip integrity
    for file in "${BACKUP_PATH}"/*.gz; do
        if [ -f "$file" ]; then
            if ! gzip -t "$file" 2>/dev/null; then
                log_error "Corrupted archive: $file"
                all_ok=false
            fi
        fi
    done
    
    if [ "$all_ok" = true ]; then
        log_success "Backup integrity verification passed"
    else
        log_error "Backup integrity verification failed"
        return 1
    fi
}

# Calculate backup size
calculate_size() {
    local size=$(du -sh "${BACKUP_PATH}" | cut -f1)
    log_info "Backup size: ${size}"
}

# Clean old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than ${BACKUP_RETENTION_DAYS} days"
    
    find "${BACKUP_DIR}" -maxdepth 1 -type d -name "strapi_backup_*" -mtime +${BACKUP_RETENTION_DAYS} -exec rm -rf {} \;
    
    log_success "Old backups cleaned up"
}

# Main execution
main() {
    log_info "Starting Strapi backup process"
    log_info "Timestamp: ${TIMESTAMP}"
    
    # Validate environment
    validate_env
    
    # Create backup directory
    create_backup_dir
    
    # Backup database based on client type
    case "${DATABASE_CLIENT}" in
        postgres)
            backup_postgres
            ;;
        mysql)
            backup_mysql
            ;;
        sqlite)
            backup_sqlite
            ;;
        *)
            log_error "Unsupported database client: ${DATABASE_CLIENT}"
            exit 1
            ;;
    esac
    
    # Backup uploads and configuration
    backup_uploads
    backup_config
    
    # Create metadata
    create_metadata
    
    # Verify backup
    verify_backup
    
    # Calculate size
    calculate_size
    
    # Cleanup old backups
    cleanup_old_backups
    
    log_success "Backup completed successfully!"
    log_info "Backup location: ${BACKUP_PATH}"
}

# Run main function
main "$@"
