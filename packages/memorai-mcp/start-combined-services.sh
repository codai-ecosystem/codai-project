#!/bin/bash
# MemoraiMCP + CBD Startup Script for Docker Container
# This script starts both CBD database and MemoraiMCP services

set -e

echo "🚀 Starting MemoraiMCP + CBD Combined Service..."
echo "📅 Date: $(date)"
echo "🐳 Container: MemoraiMCP Self-Contained"

# Create necessary directories
mkdir -p /app/memorai-cbd-data
mkdir -p /app/cbd-data
mkdir -p /var/log/memorai
mkdir -p /var/log/cbd

# Set proper ownership
chown -R memorai:nodejs /app/memorai-cbd-data
chown -R memorai:nodejs /app/cbd-data
chown -R memorai:nodejs /var/log/memorai
chown -R memorai:nodejs /var/log/cbd

echo "📂 Directories created and permissions set"

# Function to handle shutdown gracefully
shutdown_handler() {
    echo "🛑 Shutting down services gracefully..."
    
    if [ -n "$MEMORAI_PID" ] && kill -0 $MEMORAI_PID 2>/dev/null; then
        echo "🔄 Stopping MemoraiMCP service..."
        kill -TERM $MEMORAI_PID
        wait $MEMORAI_PID 2>/dev/null || true
    fi
    
    if [ -n "$CBD_PID" ] && kill -0 $CBD_PID 2>/dev/null; then
        echo "🔄 Stopping CBD service..."
        kill -TERM $CBD_PID
        wait $CBD_PID 2>/dev/null || true
    fi
    
    echo "✅ Services shut down gracefully"
    exit 0
}

# Set up signal handlers
trap shutdown_handler SIGTERM SIGINT

echo "🗃️ Starting CBD Database Service..."

# Start CBD Database Service in background
cd /app/cbd && npm start > /var/log/cbd/cbd.log 2>&1 &
CBD_PID=$!

# Wait for CBD to be ready
echo "⏳ Waiting for CBD Database to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:4180/health > /dev/null 2>&1; then
        echo "✅ CBD Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ CBD Database failed to start within 30 seconds"
        cat /var/log/cbd/cbd.log
        exit 1
    fi
    echo "⏳ Waiting for CBD... ($i/30)"
    sleep 1
done

echo "🧠 Starting MemoraiMCP Service..."

# Start MemoraiMCP Service in background
cd /app && node memorai-mcp-server.cjs > /var/log/memorai/memorai.log 2>&1 &
MEMORAI_PID=$!

# Wait for MemoraiMCP to be ready
echo "⏳ Waiting for MemoraiMCP to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:4950/health > /dev/null 2>&1; then
        echo "✅ MemoraiMCP is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MemoraiMCP failed to start within 30 seconds"
        cat /var/log/memorai/memorai.log
        exit 1
    fi
    echo "⏳ Waiting for MemoraiMCP... ($i/30)"
    sleep 1
done

echo ""
echo "🎯 MemoraiMCP + CBD Combined Service is running!"
echo "📡 MemoraiMCP: http://localhost:4950"
echo "🗃️ CBD Database: http://localhost:4180"
echo "🔑 API Key: memorai-dev-key-2025"
echo ""
echo "📋 Service Status:"

# Show service status
if kill -0 $CBD_PID 2>/dev/null; then
    echo "   ✅ CBD Database: Running (PID: $CBD_PID)"
else
    echo "   ❌ CBD Database: Stopped"
fi

if kill -0 $MEMORAI_PID 2>/dev/null; then
    echo "   ✅ MemoraiMCP: Running (PID: $MEMORAI_PID)"
else
    echo "   ❌ MemoraiMCP: Stopped"
fi

echo ""
echo "💡 Services are ready. Container will keep running..."

# Keep the container alive and monitor services
while true; do
    # Check if either service died
    if ! kill -0 $CBD_PID 2>/dev/null; then
        echo "❌ CBD Database service died unexpectedly"
        cat /var/log/cbd/cbd.log | tail -20
        exit 1
    fi
    
    if ! kill -0 $MEMORAI_PID 2>/dev/null; then
        echo "❌ MemoraiMCP service died unexpectedly" 
        cat /var/log/memorai/memorai.log | tail -20
        exit 1
    fi
    
    sleep 10
done