#!/bin/bash
# CBD-MemoraiMCP Enterprise Migration Script
# Migrates existing SQLite MemoraiMCP data to CBD Engine

set -euo pipefail

# Configuration
CBD_HOST="${CBD_HOST:-localhost}"
CBD_PORT="${CBD_PORT:-8080}"
CBD_DATABASE="${CBD_DATABASE:-memorai_enterprise}"
SQLITE_DB_PATH="${SQLITE_DB_PATH:-$HOME/.memorai-mcp-v7/memories.db}"
BACKUP_DIR="${BACKUP_DIR:-./migration-backup-$(date +%Y%m%d_%H%M%S)}"
LOG_FILE="${LOG_FILE:-./migration.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if SQLite database exists
    if [[ ! -f "$SQLITE_DB_PATH" ]]; then
        error "SQLite database not found at: $SQLITE_DB_PATH"
    fi
    
    # Check if CBD Engine is running
    if ! curl -sf "http://$CBD_HOST:$CBD_PORT/health" > /dev/null; then
        error "CBD Engine is not running at http://$CBD_HOST:$CBD_PORT"
    fi
    
    # Check required tools
    for tool in sqlite3 curl jq; do
        if ! command -v "$tool" &> /dev/null; then
            error "Required tool '$tool' is not installed"
        fi
    done
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup of SQLite database..."
    mkdir -p "$BACKUP_DIR"
    cp "$SQLITE_DB_PATH" "$BACKUP_DIR/memories.db.backup"
    success "Backup created at: $BACKUP_DIR/memories.db.backup"
}

# Export SQLite data
export_sqlite_data() {
    log "Exporting data from SQLite database..."
    
    # Export memories table
    sqlite3 "$SQLITE_DB_PATH" -header -csv "SELECT * FROM memories;" > "$BACKUP_DIR/memories.csv"
    
    # Export memory_embeddings table
    sqlite3 "$SQLITE_DB_PATH" -header -csv "SELECT * FROM memory_embeddings;" > "$BACKUP_DIR/memory_embeddings.csv"
    
    # Export semantic_search_cache table
    sqlite3 "$SQLITE_DB_PATH" -header -csv "SELECT * FROM semantic_search_cache;" > "$BACKUP_DIR/semantic_search_cache.csv"
    
    # Export database_info table
    sqlite3 "$SQLITE_DB_PATH" -header -csv "SELECT * FROM database_info;" > "$BACKUP_DIR/database_info.csv"
    
    # Get record counts
    local memories_count=$(sqlite3 "$SQLITE_DB_PATH" "SELECT COUNT(*) FROM memories;")
    local embeddings_count=$(sqlite3 "$SQLITE_DB_PATH" "SELECT COUNT(*) FROM memory_embeddings;")
    local cache_count=$(sqlite3 "$SQLITE_DB_PATH" "SELECT COUNT(*) FROM semantic_search_cache;")
    
    log "Exported $memories_count memories, $embeddings_count embeddings, $cache_count cache entries"
}

# Initialize CBD Engine database
init_cbd_database() {
    log "Initializing CBD Engine database..."
    
    curl -sf -X POST "http://$CBD_HOST:$CBD_PORT/api/admin/database" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$CBD_DATABASE\", \"config\": {\"engine\": \"cbd-enterprise\"}}" || true
    
    success "CBD Engine database initialized"
}

# Import data to CBD Engine
import_to_cbd() {
    log "Importing data to CBD Engine..."
    
    # Import memories
    local memories_imported=0
    while IFS=',' read -r line; do
        if [[ $memories_imported -eq 0 ]]; then
            # Skip header
            memories_imported=1
            continue
        fi
        
        # Parse CSV line and convert to JSON
        IFS=',' read -ra ADDR <<< "$line"
        
        local json_data=$(cat <<EOF
{
    "records": [{
        "structured_key": "${ADDR[1]}",
        "project_name": "${ADDR[2]}",
        "session_name": "${ADDR[3]}",
        "sequence_number": ${ADDR[4]},
        "agent_id": "${ADDR[5]}",
        "content": "${ADDR[6]}",
        "content_hash": "${ADDR[7]}",
        "metadata": ${ADDR[8]:-'{}'},
        "embedding_summary": "${ADDR[9]:-}",
        "timestamp": "${ADDR[10]}",
        "last_accessed": "${ADDR[11]}",
        "access_count": ${ADDR[12]:-0},
        "importance_score": ${ADDR[13]:-0.5},
        "created_at": "${ADDR[14]}",
        "updated_at": "${ADDR[15]}"
    }]
}
EOF
        )
        
        curl -sf -X POST "http://$CBD_HOST:$CBD_PORT/api/data/memories" \
            -H "Content-Type: application/json" \
            -H "X-Database: $CBD_DATABASE" \
            -d "$json_data" > /dev/null
        
        memories_imported=$((memories_imported + 1))
        
        if [[ $((memories_imported % 100)) -eq 0 ]]; then
            log "Imported $memories_imported memories..."
        fi
        
    done < "$BACKUP_DIR/memories.csv"
    
    success "Imported $((memories_imported - 1)) memories to CBD Engine"
}

# Validate migration
validate_migration() {
    log "Validating migration..."
    
    # Get counts from SQLite
    local sqlite_memories=$(sqlite3 "$SQLITE_DB_PATH" "SELECT COUNT(*) FROM memories;")
    local sqlite_embeddings=$(sqlite3 "$SQLITE_DB_PATH" "SELECT COUNT(*) FROM memory_embeddings;")
    
    # Get counts from CBD Engine
    local cbd_response=$(curl -sf "http://$CBD_HOST:$CBD_PORT/api/admin/statistics" -H "X-Database: $CBD_DATABASE")
    local cbd_memories=$(echo "$cbd_response" | jq -r '.tables.memories.record_count // 0')
    
    log "SQLite memories: $sqlite_memories"
    log "CBD memories: $cbd_memories"
    
    if [[ "$sqlite_memories" -eq "$cbd_memories" ]]; then
        success "Migration validation passed: record counts match"
    else
        error "Migration validation failed: record count mismatch"
    fi
}

# Update MemoraiMCP configuration
update_memorai_config() {
    log "Creating MemoraiMCP configuration for CBD Engine..."
    
    cat > "$BACKUP_DIR/memorai-mcp-env" <<EOF
# MemoraiMCP Environment Configuration for CBD Engine
CBD_HOST=$CBD_HOST
CBD_PORT=$CBD_PORT
CBD_DATABASE=$CBD_DATABASE
CBD_API_KEY=\${CBD_API_KEY}
MEMORAI_BACKEND=cbd-engine
MEMORAI_MODE=enterprise
NODE_ENV=production
EOF
    
    success "Configuration file created at: $BACKUP_DIR/memorai-mcp-env"
}

# Main migration process
main() {
    log "Starting CBD-MemoraiMCP migration..."
    log "SQLite DB: $SQLITE_DB_PATH"
    log "CBD Engine: http://$CBD_HOST:$CBD_PORT"
    log "Target Database: $CBD_DATABASE"
    log "Backup Directory: $BACKUP_DIR"
    
    check_prerequisites
    create_backup
    export_sqlite_data
    init_cbd_database
    import_to_cbd
    validate_migration
    update_memorai_config
    
    success "🎉 Migration completed successfully!"
    log "Next steps:"
    log "1. Update MemoraiMCP to use CBD Engine backend"
    log "2. Set environment variables from: $BACKUP_DIR/memorai-mcp-env"
    log "3. Start MemoraiMCP with new configuration"
    log "4. Test the integration"
    log "5. Archive SQLite backup: $BACKUP_DIR"
}

# Run migration
main "$@"
