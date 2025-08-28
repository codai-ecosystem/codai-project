#!/bin/bash
# MemorAI MCP Server - Enterprise Health Check Script
# Comprehensive health monitoring for production deployment

set -euo pipefail

# Configuration
HEALTH_ENDPOINT="http://localhost:${PORT:-4950}/health"
TIMEOUT=10
RETRIES=3
RETRY_DELAY=2

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] HEALTH_CHECK: $1" >&2
}

# Check if the server is responsive
check_server_health() {
    local attempt=1
    
    while [ $attempt -le $RETRIES ]; do
        log "Attempt $attempt/$RETRIES - Checking server health at $HEALTH_ENDPOINT"
        
        if curl -f -s -m $TIMEOUT "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
            log "Server health check passed"
            return 0
        fi
        
        log "Health check failed, attempt $attempt/$RETRIES"
        
        if [ $attempt -lt $RETRIES ]; then
            sleep $RETRY_DELAY
        fi
        
        ((attempt++))
    done
    
    log "All health check attempts failed"
    return 1
}

# Check memory usage
check_memory_usage() {
    local memory_limit_mb=${MEMORY_LIMIT_MB:-4096}
    local memory_usage
    
    # Get memory usage in MB for the current process
    memory_usage=$(ps -o pid,vsz --no-headers -p $$ | awk '{print int($2/1024)}')
    
    if [ "$memory_usage" -gt "$memory_limit_mb" ]; then
        log "Memory usage ($memory_usage MB) exceeds limit ($memory_limit_mb MB)"
        return 1
    fi
    
    log "Memory usage: $memory_usage MB (limit: $memory_limit_mb MB)"
    return 0
}

# Check disk space
check_disk_space() {
    local disk_usage
    local disk_limit=90
    
    disk_usage=$(df /app | awk 'NR==2 {print int($5)}')
    
    if [ "$disk_usage" -gt "$disk_limit" ]; then
        log "Disk usage ($disk_usage%) exceeds limit ($disk_limit%)"
        return 1
    fi
    
    log "Disk usage: $disk_usage% (limit: $disk_limit%)"
    return 0
}

# Check if required directories are writable
check_directory_permissions() {
    local dirs=("/app/data" "/app/logs" "/app/tmp")
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            log "Required directory $dir does not exist"
            return 1
        fi
        
        if [ ! -w "$dir" ]; then
            log "Required directory $dir is not writable"
            return 1
        fi
    done
    
    log "All required directories are accessible"
    return 0
}

# Main health check function
main() {
    log "Starting comprehensive health check"
    
    # Check server responsiveness
    if ! check_server_health; then
        log "Server health check failed"
        exit 1
    fi
    
    # Check memory usage
    if ! check_memory_usage; then
        log "Memory usage check failed"
        exit 1
    fi
    
    # Check disk space
    if ! check_disk_space; then
        log "Disk space check failed"
        exit 1
    fi
    
    # Check directory permissions
    if ! check_directory_permissions; then
        log "Directory permissions check failed"
        exit 1
    fi
    
    log "All health checks passed successfully"
    return 0
}

# Run the health check
main "$@"