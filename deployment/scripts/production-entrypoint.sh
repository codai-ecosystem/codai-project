#!/bin/bash
# RomAI AGI Production Entrypoint Script
# Comprehensive startup orchestration with monitoring and error handling

set -euo pipefail

# Configuration
export ROMAI_LOG_FILE="/app/logs/romai-agi.log"
export HEALTH_CHECK_URL="http://localhost:6101/health"
export METRICS_URL="http://localhost:9090/metrics"
export PID_FILE="/app/romai.pid"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$ROMAI_LOG_FILE"
}

# Error handler
error_exit() {
    log "ERROR: $1"
    cleanup
    exit 1
}

# Cleanup function
cleanup() {
    log "Performing cleanup..."
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            log "Terminating RomAI process (PID: $PID)"
            kill -TERM "$PID"
            sleep 5
            if kill -0 "$PID" 2>/dev/null; then
                log "Force killing RomAI process"
                kill -KILL "$PID"
            fi
        fi
        rm -f "$PID_FILE"
    fi
    log "Cleanup complete"
}

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT

# Pre-flight checks
preflight_checks() {
    log "🔍 Performing pre-flight checks..."
    
    # Check required directories
    for dir in "/app/logs" "/app/cache" "/app/models" "/app/metrics"; do
        if [ ! -d "$dir" ]; then
            log "Creating directory: $dir"
            mkdir -p "$dir"
        fi
    done
    
    # Check Python environment
    if ! command -v python3.10 &> /dev/null; then
        error_exit "Python 3.10 not found"
    fi
    
    # Check Node.js environment
    if ! command -v node &> /dev/null; then
        error_exit "Node.js not found"
    fi
    
    # Check GPU availability (optional)
    if command -v nvidia-smi &> /dev/null; then
        log "🎯 GPU detected:"
        nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader,nounits | while read -r line; do
            log "  GPU: $line"
        done
    else
        log "⚠️ No GPU detected, running in CPU mode"
    fi
    
    # Check Redis connectivity
    if [ -n "${REDIS_HOST:-}" ]; then
        log "🔗 Testing Redis connection..."
        timeout 10 bash -c "</dev/tcp/${REDIS_HOST}/${REDIS_PORT:-6379}" || log "⚠️ Redis not accessible"
    fi
    
    # Check PostgreSQL connectivity
    if [ -n "${DATABASE_URL:-}" ]; then
        log "🗄️ Testing database connection..."
        python3.10 -c "
import os
import psycopg2
try:
    conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
    conn.close()
    print('✅ Database connection successful')
except Exception as e:
    print(f'⚠️ Database connection failed: {e}')
" 2>&1 | tee -a "$ROMAI_LOG_FILE"
    fi
    
    log "✅ Pre-flight checks complete"
}

# Model initialization
initialize_models() {
    log "🧠 Initializing AI models..."
    cd /app/src
    
    # Set model cache directories
    export TRANSFORMERS_CACHE="/app/cache/transformers"
    export HF_HOME="/app/cache/huggingface"
    export TORCH_HOME="/app/cache/torch"
    
    # Create cache directories
    mkdir -p "$TRANSFORMERS_CACHE" "$HF_HOME" "$TORCH_HOME"
    
    # Pre-load critical models with timeout
    timeout 300 python3.10 -c "
import sys
import os
import time
import traceback
from pathlib import Path

sys.path.append('/app/src')

def safe_model_init():
    try:
        # Import core systems
        from ml.serving.model_server import initialize_models
        from infrastructure.orchestration.agi_orchestrator import AGIOrchestrator
        
        print('🔄 Initializing AGI Orchestrator...')
        orchestrator = AGIOrchestrator()
        print('✅ AGI Orchestrator initialized')
        
        print('🔄 Loading core models...')
        models = initialize_models()
        print(f'✅ {len(models)} models loaded successfully')
        
        # Validate critical systems
        print('🔄 Validating multimodal capabilities...')
        from ml.experts.enhanced_multimodal_expert import EnhancedMultimodalExpert
        multimodal = EnhancedMultimodalExpert()
        print('✅ Multimodal expert ready')
        
        print('🔄 Testing reasoning engines...')
        from ml.reasoning.enhanced_chain_of_thought import EnhancedChainOfThought
        reasoning = EnhancedChainOfThought()
        test_result = reasoning.reason('What is 2+2?', context={'domain': 'mathematics'})
        print(f'✅ Reasoning test: {test_result.get(\"result\", \"N/A\")}')
        
        return True
        
    except Exception as e:
        print(f'❌ Model initialization error: {e}')
        traceback.print_exc()
        return False

if safe_model_init():
    print('🚀 All models initialized successfully!')
    sys.exit(0)
else:
    print('💥 Model initialization failed!')
    sys.exit(1)
" || error_exit "Model initialization failed"
    
    log "✅ Models initialized successfully"
}

# Start monitoring services
start_monitoring() {
    log "📊 Starting monitoring services..."
    
    # Start Prometheus metrics exporter
    cd /app/src
    python3.10 -c "
import os
import time
from prometheus_client import start_http_server, Counter, Histogram, Gauge
import threading

# Metrics setup
REQUEST_COUNT = Counter('romai_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('romai_request_duration_seconds', 'Request latency')
MODEL_MEMORY = Gauge('romai_model_memory_bytes', 'Model memory usage')
ACTIVE_CONNECTIONS = Gauge('romai_active_connections', 'Active connections')

def collect_metrics():
    while True:
        try:
            # Collect system metrics
            import psutil
            import torch
            
            # Memory metrics
            if torch.cuda.is_available():
                gpu_memory = torch.cuda.memory_allocated()
                MODEL_MEMORY.set(gpu_memory)
            
            # Connection metrics (placeholder)
            ACTIVE_CONNECTIONS.set(10)  # Would be actual connection count
            
        except Exception as e:
            print(f'Metrics collection error: {e}')
        
        time.sleep(30)

# Start metrics server
start_http_server(9090)
print('📊 Prometheus metrics server started on port 9090')

# Start metrics collection in background
metrics_thread = threading.Thread(target=collect_metrics, daemon=True)
metrics_thread.start()

# Keep the process alive
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print('📊 Metrics server stopping...')
" &
    
    METRICS_PID=$!
    echo "$METRICS_PID" > /app/metrics.pid
    log "📊 Monitoring services started (PID: $METRICS_PID)"
}

# Start main application services
start_application() {
    log "🚀 Starting RomAI AGI application services..."
    
    # Start ML model server
    cd /app/src
    log "🧠 Starting ML model server on port 6101..."
    python3.10 -m uvicorn ml.serving.model_server:app \
        --host 0.0.0.0 \
        --port 6101 \
        --workers "${WORKERS:-4}" \
        --timeout-keep-alive "${TIMEOUT_KEEP_ALIVE:-65}" \
        --max-requests "${MAX_REQUESTS:-10000}" \
        --log-level "${LOG_LEVEL:-info}" \
        --access-log \
        --reload false \
        --no-access-log false &
    
    ML_SERVER_PID=$!
    log "🧠 ML model server started (PID: $ML_SERVER_PID)"
    
    # Wait for ML server to be ready
    log "⏳ Waiting for ML server to be ready..."
    for i in {1..60}; do
        if curl -f "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            log "✅ ML server is ready!"
            break
        fi
        if [ $i -eq 60 ]; then
            error_exit "ML server failed to start within 5 minutes"
        fi
        log "⏳ Waiting... ($i/60)"
        sleep 5
    done
    
    # Start frontend server
    cd /app
    log "🌐 Starting frontend server on port 6100..."
    npm start &
    FRONTEND_PID=$!
    log "🌐 Frontend server started (PID: $FRONTEND_PID)"
    
    # Save main PID
    echo "$ML_SERVER_PID" > "$PID_FILE"
    
    # Wait for frontend to be ready
    log "⏳ Waiting for frontend to be ready..."
    for i in {1..30}; do
        if curl -f "http://localhost:6100/api/health" > /dev/null 2>&1; then
            log "✅ Frontend server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            log "⚠️ Frontend server may not be ready, continuing..."
            break
        fi
        sleep 2
    done
    
    log "🎉 All application services started successfully!"
}

# Health monitoring loop
health_monitor() {
    log "❤️ Starting health monitoring..."
    
    while true; do
        # Check ML server health
        if ! curl -f "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            log "🚨 ML server health check failed!"
        fi
        
        # Check metrics endpoint
        if ! curl -f "$METRICS_URL" > /dev/null 2>&1; then
            log "🚨 Metrics endpoint health check failed!"
        fi
        
        # Check system resources
        MEMORY_USAGE=$(free | grep '^Mem:' | awk '{print ($3/$2) * 100.0}')
        CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
        
        if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
            log "⚠️ High memory usage: ${MEMORY_USAGE}%"
        fi
        
        if (( $(echo "$CPU_USAGE > 90" | bc -l) )); then
            log "⚠️ High CPU usage: ${CPU_USAGE}%"
        fi
        
        sleep 30
    done
}

# Main execution
main() {
    log "🚀 RomAI AGI Production Startup"
    log "🏷️ Version: $(cat /app/VERSION 2>/dev/null || echo 'unknown')"
    log "🌍 Environment: ${ENVIRONMENT:-production}"
    log "🖥️ Hostname: $(hostname)"
    log "👤 User: $(whoami)"
    log "📁 Working Directory: $(pwd)"
    
    # Execute startup sequence
    preflight_checks
    initialize_models
    start_monitoring
    start_application
    
    log "✅ RomAI AGI startup sequence completed successfully!"
    log "🌐 Frontend: http://localhost:6100"
    log "🧠 ML API: http://localhost:6101"
    log "📊 Metrics: http://localhost:9090"
    
    # Start health monitoring in background
    health_monitor &
    
    # Keep main process alive and wait for signals
    wait
}

# Execute main function
main "$@"