#!/bin/bash
#
# healthcheck.sh - Health check script for monitoring endpoints
# Can be used with cron/alerting to verify service availability
#
# Usage: ./healthcheck.sh [OPTIONS]
# Options:
#   -f, --frontend URL      Frontend base URL (default: http://localhost:3000)
#   -c, --cms URL           CMS base URL (default: http://localhost:1337)
#   -t, --timeout SECONDS   Request timeout (default: 10)
#   -v, --verbose           Verbose output
#   -s, --silent            Silent mode (only exit codes)
#   -w, --webhook URL       Webhook URL for alerts (optional)
#   -h, --help              Show this help message
#

set -euo pipefail

# Default configuration
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
CMS_URL="${CMS_URL:-http://localhost:1337}"
TIMEOUT="${TIMEOUT:-10}"
VERBOSE=false
SILENT=false
WEBHOOK_URL="${WEBHOOK_URL:-}"

# Exit codes
EXIT_SUCCESS=0
EXIT_FRONTEND_FAILED=1
EXIT_CMS_FAILED=2
EXIT_BOTH_FAILED=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    if [ "$SILENT" = false ]; then
        echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    fi
}

log_warn() {
    if [ "$SILENT" = false ]; then
        echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    fi
}

log_error() {
    if [ "$SILENT" = false ]; then
        echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
    fi
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "[DEBUG] $(date '+%Y-%m-%d %H:%M:%S') - $1"
    fi
}

# Show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Health check script for monitoring Frontend and CMS endpoints.

Options:
    -f, --frontend URL      Frontend base URL (default: http://localhost:3000)
    -c, --cms URL           CMS base URL (default: http://localhost:1337)
    -t, --timeout SECONDS   Request timeout in seconds (default: 10)
    -v, --verbose           Enable verbose output
    -s, --silent            Silent mode (only exit codes, no output)
    -w, --webhook URL       Webhook URL for sending alerts
    -h, --help              Show this help message

Environment Variables:
    FRONTEND_URL            Frontend base URL
    CMS_URL                 CMS base URL
    TIMEOUT                 Request timeout in seconds
    WEBHOOK_URL             Webhook URL for alerts

Exit Codes:
    0                       All health checks passed
    1                       Frontend health check failed
    2                       CMS health check failed
    3                       Both health checks failed

Examples:
    # Check default endpoints
    $0

    # Check custom endpoints
    $0 --frontend http://example.com --cms http://cms.example.com

    # Check with webhook alert
    $0 --webhook https://hooks.example.com/alert

    # Silent mode for cron
    $0 --silent || echo "Health check failed"

    # Cron example (every 5 minutes):
    */5 * * * * /path/to/healthcheck.sh --silent || /path/to/alert.sh

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--frontend)
                FRONTEND_URL="$2"
                shift 2
                ;;
            -c|--cms)
                CMS_URL="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -s|--silent)
                SILENT=true
                shift
                ;;
            -w|--webhook)
                WEBHOOK_URL="$2"
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
        log_verbose "Loading environment from $env_file"
        # shellcheck disable=SC2046
        export $(grep -v '^#' "$env_file" | xargs -d '\n') 2>/dev/null || true
    fi
}

# Validate required tools
validate_tools() {
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        log_error "Install with: apt-get install curl"
        exit 1
    fi
}

# Check endpoint health
check_endpoint() {
    local name="$1"
    local url="$2"
    local start_time
    start_time=$(date +%s%3N)
    
    log_verbose "Checking $name endpoint: $url"
    
    # Perform health check
    local http_code
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout "$TIMEOUT" \
        --max-time "$TIMEOUT" \
        "$url" 2>/dev/null) || http_code="000"
    
    local end_time
    end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    log_verbose "$name response: HTTP $http_code (${duration}ms)"
    
    # Check if successful
    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
        log_info "✓ $name health check passed (${duration}ms)"
        return 0
    else
        log_error "✗ $name health check failed (HTTP $http_code)"
        return 1
    fi
}

# Send webhook alert
send_webhook_alert() {
    local service="$1"
    local status="$2"
    local message="$3"
    
    if [ -z "$WEBHOOK_URL" ]; then
        return 0
    fi
    
    log_verbose "Sending webhook alert to: $WEBHOOK_URL"
    
    local timestamp
    timestamp=$(date -Iseconds)
    local hostname
    hostname=$(hostname)
    
    # Prepare JSON payload
    local payload
    payload=$(cat <<EOF
{
  "timestamp": "$timestamp",
  "hostname": "$hostname",
  "service": "$service",
  "status": "$status",
  "message": "$message"
}
EOF
)
    
    # Send webhook
    if curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        --connect-timeout 5 \
        --max-time 10 \
        > /dev/null 2>&1; then
        log_verbose "Webhook alert sent successfully"
    else
        log_warn "Failed to send webhook alert"
    fi
}

# Check frontend health
check_frontend() {
    local endpoint="${FRONTEND_URL}/api/health"
    
    if check_endpoint "Frontend" "$endpoint"; then
        return 0
    else
        send_webhook_alert "Frontend" "failed" "Frontend health check failed at $endpoint"
        return 1
    fi
}

# Check CMS health
check_cms() {
    local endpoint="${CMS_URL}/_health"
    
    if check_endpoint "CMS" "$endpoint"; then
        return 0
    else
        send_webhook_alert "CMS" "failed" "CMS health check failed at $endpoint"
        return 1
    fi
}

# Generate health check summary
generate_summary() {
    local frontend_status="$1"
    local cms_status="$2"
    
    if [ "$SILENT" = false ]; then
        echo ""
        echo "=== Health Check Summary ==="
        echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
        
        if [ "$frontend_status" -eq 0 ]; then
            echo -e "Frontend: ${GREEN}✓ HEALTHY${NC}"
        else
            echo -e "Frontend: ${RED}✗ UNHEALTHY${NC}"
        fi
        
        if [ "$cms_status" -eq 0 ]; then
            echo -e "CMS:      ${GREEN}✓ HEALTHY${NC}"
        else
            echo -e "CMS:      ${RED}✗ UNHEALTHY${NC}"
        fi
        
        echo ""
    fi
}

# Main execution
main() {
    parse_args "$@"
    load_env
    validate_tools
    
    log_info "Starting health checks..."
    
    # Perform health checks
    local frontend_status=0
    local cms_status=0
    
    check_frontend || frontend_status=1
    check_cms || cms_status=1
    
    # Generate summary
    generate_summary $frontend_status $cms_status
    
    # Determine exit code
    if [ $frontend_status -eq 0 ] && [ $cms_status -eq 0 ]; then
        log_info "All health checks passed"
        exit $EXIT_SUCCESS
    elif [ $frontend_status -ne 0 ] && [ $cms_status -eq 0 ]; then
        log_error "Frontend health check failed"
        exit $EXIT_FRONTEND_FAILED
    elif [ $frontend_status -eq 0 ] && [ $cms_status -ne 0 ]; then
        log_error "CMS health check failed"
        exit $EXIT_CMS_FAILED
    else
        log_error "All health checks failed"
        exit $EXIT_BOTH_FAILED
    fi
}

# Run main function
main "$@"
