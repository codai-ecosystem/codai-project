#!/bin/bash
# 🚀 CBD & MemorAI MCP Startup Script (Linux/Mac Version)
# Portable script to start CBD database and MemorAI MCP server from any location
# Version: 1.0.0
# Date: August 5, 2025

set -e

# Configuration
SCRIPT_NAME="CBD & MemorAI MCP Startup Script"
VERSION="1.0.0"
CBD_PORT=8080
MEMORAI_PORT=4950
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_info() { echo -e "${CYAN}ℹ️ $1${NC}"; }
log_debug() { if [[ "$VERBOSE" == "true" ]]; then echo -e "[DEBUG] $1"; fi; }

# Show help
show_help() {
    echo -e "${CYAN}🚀 $SCRIPT_NAME v$VERSION${NC}"
    echo -e "${CYAN}=================================================${NC}"
    echo ""
    echo "USAGE:"
    echo "  ./start-cbd-memorai.sh [OPTIONS] [CODAI_PROJECT_PATH]"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help           Show this help"
    echo "  -v, --verbose        Enable verbose logging"
    echo "  -s, --status         Check service status"
    echo "  --stop               Stop all services"
    echo "  --restart            Restart all services"
    echo "  --cbd-port PORT      CBD port (default: 8080)"
    echo "  --memorai-port PORT  MemorAI port (default: 4950)"
    echo ""
    echo "EXAMPLES:"
    echo "  ./start-cbd-memorai.sh"
    echo "  ./start-cbd-memorai.sh /path/to/codai-project"
    echo "  ./start-cbd-memorai.sh --status"
    echo "  ./start-cbd-memorai.sh --stop"
    echo ""
    exit 0
}

# Parse arguments
CODAI_PATH=""
ACTION="start"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -s|--status)
            ACTION="status"
            shift
            ;;
        --stop)
            ACTION="stop"
            shift
            ;;
        --restart)
            ACTION="restart"
            shift
            ;;
        --cbd-port)
            CBD_PORT="$2"
            shift 2
            ;;
        --memorai-port)
            MEMORAI_PORT="$2"
            shift 2
            ;;
        -*)
            log_error "Unknown option $1"
            show_help
            ;;
        *)
            CODAI_PATH="$1"
            shift
            ;;
    esac
done

# Header
echo -e "${CYAN}🚀 $SCRIPT_NAME v$VERSION${NC}"
echo -e "${CYAN}=================================================${NC}"

# Auto-detect codai-project path if not provided
if [[ -z "$CODAI_PATH" ]]; then
    log_info "🔍 Auto-detecting codai-project path..."
    
    # Common locations to check
    possible_paths=(
        "/home/$USER/codai-project"
        "/home/$USER/GitHub/codai-project"
        "/home/$USER/Projects/codai-project"
        "$HOME/codai-project"
        "$HOME/GitHub/codai-project"
        "$HOME/Projects/codai-project"
        "./codai-project"
        "../codai-project"
        "../../codai-project"
    )
    
    for path in "${possible_paths[@]}"; do
        if [[ -d "$path" && -d "$path/packages/cbd" && -d "$path/packages/memorai-mcp" ]]; then
            CODAI_PATH="$path"
            log_success "Found codai-project at: $CODAI_PATH"
            break
        fi
    done
    
    if [[ -z "$CODAI_PATH" ]]; then
        log_error "Could not auto-detect codai-project path!"
        log_warning "Please specify the path as a parameter"
        echo "Example: ./start-cbd-memorai.sh /path/to/codai-project"
        exit 1
    fi
fi

# Validate paths
if [[ ! -d "$CODAI_PATH" ]]; then
    log_error "Path not found: $CODAI_PATH"
    exit 1
fi

CBD_PATH="$CODAI_PATH/packages/cbd"
MEMORAI_PATH="$CODAI_PATH/packages/memorai-mcp"

if [[ ! -d "$CBD_PATH" ]]; then
    log_error "CBD package not found at: $CBD_PATH"
    exit 1
fi

if [[ ! -d "$MEMORAI_PATH" ]]; then
    log_error "MemorAI MCP package not found at: $MEMORAI_PATH"
    exit 1
fi

log_success "Project paths validated"
log_debug "CBD Path: $CBD_PATH"
log_debug "MemorAI Path: $MEMORAI_PATH"

# Service management functions
test_service_health() {
    local url="$1"
    local service_name="$2"
    
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        log_success "$service_name is healthy"
        return 0
    else
        log_warning "$service_name is not responding"
        return 1
    fi
}

stop_service_on_port() {
    local port="$1"
    local service_name="$2"
    
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
        echo "$pids" | xargs kill -9 2>/dev/null || true
        log_success "Stopped $service_name on port $port"
    else
        log_info "$service_name is not running on port $port"
    fi
}

start_cbd_database() {
    log_info "🗃️ Starting CBD Database..."
    
    cd "$CBD_PATH"
    
    # Set environment variables
    export CBD_PORT=$CBD_PORT
    export CBD_LOG_LEVEL=$(if [[ "$VERBOSE" == "true" ]]; then echo "debug"; else echo "info"; fi)
    export NODE_ENV=development
    
    # Start CBD in background
    nohup tsx src/start.ts > cbd.log 2>&1 &
    local cbd_pid=$!
    
    log_success "CBD Database started (PID: $cbd_pid)"
    
    # Wait for startup
    sleep 3
    
    return 0
}

start_memorai_mcp() {
    log_info "🧠 Starting MemorAI MCP Server..."
    
    cd "$MEMORAI_PATH"
    
    # Set environment variables
    export MEMORAI_API_KEY="memorai-dev-key-2025"
    export MEMORAI_MCP_PORT=$MEMORAI_PORT
    export PORT=$MEMORAI_PORT
    export NODE_ENV=development
    export DEBUG=$(if [[ "$VERBOSE" == "true" ]]; then echo "memorai:*"; else echo ""; fi)
    export MEMORAI_DEBUG=$(if [[ "$VERBOSE" == "true" ]]; then echo "true"; else echo "false"; fi)
    export MEMORAI_LOG_LEVEL=$(if [[ "$VERBOSE" == "true" ]]; then echo "debug"; else echo "info"; fi)
    export MEMORAI_CBD_PATH="./memorai-cbd-data"
    
    # Start MemorAI in background
    nohup node memorai-mcp-vscode.cjs > memorai.log 2>&1 &
    local memorai_pid=$!
    
    log_success "MemorAI MCP Server started (PID: $memorai_pid)"
    
    # Wait for startup
    sleep 5
    
    return 0
}

# Handle different actions
case $ACTION in
    "status")
        log_info "🔍 Checking service status..."
        
        cbd_healthy=false
        memorai_healthy=false
        
        if test_service_health "http://localhost:$CBD_PORT/health" "CBD Database"; then
            cbd_healthy=true
        fi
        
        if test_service_health "http://localhost:$MEMORAI_PORT/health" "MemorAI MCP Server"; then
            memorai_healthy=true
        fi
        
        echo ""
        echo -e "${CYAN}📊 Service Status Summary:${NC}"
        echo "  CBD Database (port $CBD_PORT): $(if [[ "$cbd_healthy" == "true" ]]; then echo -e "${GREEN}✅ HEALTHY${NC}"; else echo -e "${RED}❌ DOWN${NC}"; fi)"
        echo "  MemorAI MCP (port $MEMORAI_PORT): $(if [[ "$memorai_healthy" == "true" ]]; then echo -e "${GREEN}✅ HEALTHY${NC}"; else echo -e "${RED}❌ DOWN${NC}"; fi)"
        echo ""
        exit 0
        ;;
        
    "stop")
        log_info "🛑 Stopping services..."
        
        stop_service_on_port $CBD_PORT "CBD Database"
        stop_service_on_port $MEMORAI_PORT "MemorAI MCP Server"
        
        log_success "All services stopped"
        exit 0
        ;;
        
    "restart")
        log_info "🔄 Restarting services..."
        
        # Stop first
        stop_service_on_port $CBD_PORT "CBD Database"
        stop_service_on_port $MEMORAI_PORT "MemorAI MCP Server"
        
        sleep 2
        # Continue to start logic
        ;;
esac

# Main startup logic
log_info "🚀 Starting CBD Database and MemorAI MCP Server..."

# Clean up ports
log_debug "Cleaning up ports before starting..."
stop_service_on_port $CBD_PORT "CBD Database"
stop_service_on_port $MEMORAI_PORT "MemorAI MCP Server"

sleep 1

# Start CBD Database first
if ! start_cbd_database; then
    log_error "Failed to start CBD Database - aborting"
    exit 1
fi

# Wait for CBD to initialize
log_info "⏳ Waiting for CBD Database to initialize..."
sleep 5

# Start MemorAI MCP Server  
if ! start_memorai_mcp; then
    log_error "Failed to start MemorAI MCP Server"
    log_warning "Stopping CBD Database due to MemorAI failure..."
    stop_service_on_port $CBD_PORT "CBD Database"
    exit 1
fi

# Final health check
log_info "🔍 Performing final health check..."
sleep 3

cbd_healthy=false
memorai_healthy=false

if test_service_health "http://localhost:$CBD_PORT/health" "CBD Database"; then
    cbd_healthy=true
fi

if test_service_health "http://localhost:$MEMORAI_PORT/health" "MemorAI MCP Server"; then
    memorai_healthy=true
fi

# Summary
echo ""
echo -e "${GREEN}🎉 Startup Complete!${NC}"
echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}📊 Service Status:${NC}"
echo "  🗃️ CBD Database:"
echo "    - Port: $CBD_PORT"
echo "    - Health: $(if [[ "$cbd_healthy" == "true" ]]; then echo -e "${GREEN}✅ HEALTHY${NC}"; else echo -e "${RED}❌ DOWN${NC}"; fi)"
echo "    - URL: http://localhost:$CBD_PORT"
echo ""
echo "  🧠 MemorAI MCP Server:"
echo "    - Port: $MEMORAI_PORT"
echo "    - Health: $(if [[ "$memorai_healthy" == "true" ]]; then echo -e "${GREEN}✅ HEALTHY${NC}"; else echo -e "${RED}❌ DOWN${NC}"; fi)"
echo "    - URL: http://localhost:$MEMORAI_PORT"
echo ""
echo -e "${CYAN}🔧 Management Commands:${NC}"
echo "  Check Status: ./start-cbd-memorai.sh --status"
echo "  Stop Services: ./start-cbd-memorai.sh --stop"  
echo "  Restart Services: ./start-cbd-memorai.sh --restart"
echo ""

if [[ "$cbd_healthy" == "true" && "$memorai_healthy" == "true" ]]; then
    log_success "🎯 All services are running successfully!"
    log_info "💡 Services are running in the background"
    log_info "💡 Use --stop to stop them or check logs: cbd.log, memorai.log"
else
    log_warning "⚠️ Some services may not be fully operational"
    log_info "💡 Check the service logs for more details"
fi

echo -e "${CYAN}=================================================${NC}"
