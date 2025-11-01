#!/bin/bash
################################################################################
# Strapi Restore Script
#
# Restores Strapi backup including:
# - Database (PostgreSQL/MySQL/SQLite)
# - Uploaded files
# - Configuration files
#
# Usage:
#   ./restore.sh <backup_path> [--dry-run]
#
# Options:
#   --dry-run    Show what would be restored without actually restoring
#
# Example:
#   ./restore.sh ./backups/strapi_backup_20241101_120000
#   ./restore.sh ./backups/strapi_backup_20241101_120000 --dry-run
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

# Parse arguments
BACKUP_PATH=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            BACKUP_PATH="$1"
            shift
            ;;
    esac
done

# Validate backup path
if [ -z "${BACKUP_PATH}" ]; then
    log_error "Usage: $0 <backup_path> [--dry-run]"
    exit 1
fi

if [ ! -d "${BACKUP_PATH}" ]; then
    log_error "Backup directory does not exist: ${BACKUP_PATH}"
    exit 1
fi

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Load environment variables
if [ -f "${PROJECT_ROOT}/apps/cms/.env" ]; then
    log_info "Loading environment from ${PROJECT_ROOT}/apps/cms/.env"
    set -a
    source "${PROJECT_ROOT}/apps/cms/.env"
    set +a
fi

# Display backup information
display_backup_info() {
    log_info "Backup Information"
    log_info "=================="
    
    if [ -f "${BACKUP_PATH}/metadata.json" ]; then
        log_info "Metadata:"
        cat "${BACKUP_PATH}/metadata.json" | jq . || cat "${BACKUP_PATH}/metadata.json"
    else
        log_warn "No metadata file found"
    fi
    
    log_info ""
    log_info "Backup contents:"
    ls -lh "${BACKUP_PATH}"
}

# Confirm restore operation
confirm_restore() {
    if [ "$DRY_RUN" = true ]; then
        log_info "DRY RUN MODE - No changes will be made"
        return 0
    fi
    
    log_warn "This will overwrite the current database and files!"
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
}

# Create pre-restore backup
create_pre_restore_backup() {
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would create pre-restore backup"
        return 0
    fi
    
    log_info "Creating pre-restore backup as safety measure"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local pre_restore_backup="${PROJECT_ROOT}/backups/pre_restore_${timestamp}"
    
    if [ -x "${SCRIPT_DIR}/strapi-backup.sh" ]; then
        "${SCRIPT_DIR}/strapi-backup.sh" "${pre_restore_backup%/*}"
        log_success "Pre-restore backup created: ${pre_restore_backup}"
    else
        log_warn "Backup script not found, skipping pre-restore backup"
    fi
}

# Restore PostgreSQL database
restore_postgres() {
    log_info "Restoring PostgreSQL database: ${DATABASE_NAME}"
    
    local dump_file="${BACKUP_PATH}/database.sql.gz"
    
    if [ ! -f "${dump_file}" ]; then
        log_error "Database dump file not found: ${dump_file}"
        return 1
    fi
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would restore PostgreSQL from: ${dump_file}"
        return 0
    fi
    
    # Drop and recreate database (careful!)
    log_warn "Dropping and recreating database: ${DATABASE_NAME}"
    
    PGPASSWORD="${DATABASE_PASSWORD}" psql \
        -h "${DATABASE_HOST}" \
        -p "${DATABASE_PORT}" \
        -U "${DATABASE_USERNAME}" \
        -d postgres \
        -c "DROP DATABASE IF EXISTS ${DATABASE_NAME};"
    
    PGPASSWORD="${DATABASE_PASSWORD}" psql \
        -h "${DATABASE_HOST}" \
        -p "${DATABASE_PORT}" \
        -U "${DATABASE_USERNAME}" \
        -d postgres \
        -c "CREATE DATABASE ${DATABASE_NAME};"
    
    # Restore from dump
    gunzip -c "${dump_file}" | PGPASSWORD="${DATABASE_PASSWORD}" psql \
        -h "${DATABASE_HOST}" \
        -p "${DATABASE_PORT}" \
        -U "${DATABASE_USERNAME}" \
        -d "${DATABASE_NAME}"
    
    if [ $? -eq 0 ]; then
        log_success "Database restored successfully"
    else
        log_error "Database restore failed"
        return 1
    fi
}

# Restore MySQL database
restore_mysql() {
    log_info "Restoring MySQL database: ${DATABASE_NAME}"
    
    local dump_file="${BACKUP_PATH}/database.sql.gz"
    
    if [ ! -f "${dump_file}" ]; then
        log_error "Database dump file not found: ${dump_file}"
        return 1
    fi
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would restore MySQL from: ${dump_file}"
        return 0
    fi
    
    # Drop and recreate database
    log_warn "Dropping and recreating database: ${DATABASE_NAME}"
    
    mysql \
        -h "${DATABASE_HOST}" \
        -P "${DATABASE_PORT}" \
        -u "${DATABASE_USERNAME}" \
        -p"${DATABASE_PASSWORD}" \
        -e "DROP DATABASE IF EXISTS ${DATABASE_NAME}; CREATE DATABASE ${DATABASE_NAME};"
    
    # Restore from dump
    gunzip -c "${dump_file}" | mysql \
        -h "${DATABASE_HOST}" \
        -P "${DATABASE_PORT}" \
        -u "${DATABASE_USERNAME}" \
        -p"${DATABASE_PASSWORD}" \
        "${DATABASE_NAME}"
    
    if [ $? -eq 0 ]; then
        log_success "Database restored successfully"
    else
        log_error "Database restore failed"
        return 1
    fi
}

# Restore SQLite database
restore_sqlite() {
    log_info "Restoring SQLite database"
    
    local backup_file="${BACKUP_PATH}/database.db.gz"
    local db_file="${PROJECT_ROOT}/apps/cms/${DATABASE_FILENAME:-.tmp/data.db}"
    
    if [ ! -f "${backup_file}" ]; then
        log_error "Database backup file not found: ${backup_file}"
        return 1
    fi
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would restore SQLite to: ${db_file}"
        return 0
    fi
    
    # Create directory if needed
    mkdir -p "$(dirname "${db_file}")"
    
    # Restore database
    gunzip -c "${backup_file}" > "${db_file}"
    
    if [ $? -eq 0 ]; then
        log_success "Database restored successfully: ${db_file}"
    else
        log_error "Database restore failed"
        return 1
    fi
}

# Restore uploaded files
restore_uploads() {
    log_info "Restoring uploaded files"
    
    local backup_file="${BACKUP_PATH}/uploads.tar.gz"
    local uploads_dir="${PROJECT_ROOT}/apps/cms/public"
    
    if [ ! -f "${backup_file}" ]; then
        log_warn "Uploads backup file not found: ${backup_file}"
        return 0
    fi
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would restore uploads to: ${uploads_dir}"
        return 0
    fi
    
    # Create directory if needed
    mkdir -p "${uploads_dir}"
    
    # Remove existing uploads
    if [ -d "${uploads_dir}/uploads" ]; then
        log_warn "Removing existing uploads directory"
        rm -rf "${uploads_dir}/uploads"
    fi
    
    # Extract uploads
    tar -xzf "${backup_file}" -C "${uploads_dir}"
    
    if [ $? -eq 0 ]; then
        log_success "Uploads restored successfully"
    else
        log_error "Uploads restore failed"
        return 1
    fi
}

# Restore configuration (optional, be careful!)
restore_config() {
    log_info "Checking configuration backup"
    
    local backup_file="${BACKUP_PATH}/config.tar.gz"
    local config_dir="${PROJECT_ROOT}/apps/cms"
    
    if [ ! -f "${backup_file}" ]; then
        log_warn "Configuration backup file not found: ${backup_file}"
        return 0
    fi
    
    log_warn "Configuration restore is disabled by default for safety"
    log_info "To restore configuration manually, run:"
    log_info "  tar -xzf ${backup_file} -C ${config_dir}"
    
    # Uncomment to enable automatic config restore (use with caution!)
    # if [ "$DRY_RUN" = false ]; then
    #     tar -xzf "${backup_file}" -C "${config_dir}"
    #     log_success "Configuration restored"
    # fi
}

# Verify restore
verify_restore() {
    log_info "Verifying restore"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would verify restore"
        return 0
    fi
    
    local all_ok=true
    
    # Check database
    case "${DATABASE_CLIENT}" in
        postgres)
            if ! PGPASSWORD="${DATABASE_PASSWORD}" psql -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -U "${DATABASE_USERNAME}" -d "${DATABASE_NAME}" -c "SELECT 1;" >/dev/null 2>&1; then
                log_error "Cannot connect to restored PostgreSQL database"
                all_ok=false
            fi
            ;;
        mysql)
            if ! mysql -h "${DATABASE_HOST}" -P "${DATABASE_PORT}" -u "${DATABASE_USERNAME}" -p"${DATABASE_PASSWORD}" "${DATABASE_NAME}" -e "SELECT 1;" >/dev/null 2>&1; then
                log_error "Cannot connect to restored MySQL database"
                all_ok=false
            fi
            ;;
        sqlite)
            local db_file="${PROJECT_ROOT}/apps/cms/${DATABASE_FILENAME:-.tmp/data.db}"
            if [ ! -f "${db_file}" ]; then
                log_error "SQLite database file not found: ${db_file}"
                all_ok=false
            fi
            ;;
    esac
    
    # Check uploads directory
    if [ ! -d "${PROJECT_ROOT}/apps/cms/public/uploads" ]; then
        log_warn "Uploads directory not found (may be empty backup)"
    fi
    
    if [ "$all_ok" = true ]; then
        log_success "Restore verification passed"
    else
        log_error "Restore verification failed"
        return 1
    fi
}

# Main execution
main() {
    log_info "Strapi Restore Process"
    log_info "======================"
    
    # Display backup info
    display_backup_info
    
    # Confirm restore
    confirm_restore
    
    # Create pre-restore backup
    create_pre_restore_backup
    
    # Restore database based on client type
    case "${DATABASE_CLIENT}" in
        postgres)
            restore_postgres
            ;;
        mysql)
            restore_mysql
            ;;
        sqlite)
            restore_sqlite
            ;;
        *)
            log_error "Unsupported database client: ${DATABASE_CLIENT}"
            exit 1
            ;;
    esac
    
    # Restore uploads
    restore_uploads
    
    # Restore configuration (manual for safety)
    restore_config
    
    # Verify restore
    verify_restore
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Complete - no changes were made"
    else
        log_success "Restore completed successfully!"
        log_info "Please restart Strapi to apply changes"
    fi
}

# Run main function
main "$@"
