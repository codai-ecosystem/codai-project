#!/bin/bash
# 🚀 CODAI Ecosystem - Production Deployment Script
# Generated: 2025-08-03 23:30 UTC
# Phase 8: Production Deployment Automation

set -e

echo "🚀 CODAI Ecosystem Production Deployment"
echo "=========================================="

# Configuration
ENVIRONMENT=${1:-production}
DEPLOYMENT_DIR="/opt/codai"
BACKUP_DIR="/opt/codai/backups"
LOG_FILE="/var/log/codai/deployment.log"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Error: Environment must be 'staging' or 'production'"
    exit 1
fi

echo "📋 Environment: $ENVIRONMENT"
echo "📁 Deployment Directory: $DEPLOYMENT_DIR"

# Step 1: Pre-deployment Checks
echo ""
echo "🔍 Step 1: Pre-deployment Checks"
echo "================================="

# Check if services are healthy
echo "📊 Checking service health..."
if curl -f http://localhost:4180/health > /dev/null 2>&1; then
    echo "✅ CBD Database: Healthy"
else
    echo "❌ CBD Database: Unhealthy"
    echo "🛑 Deployment aborted - Fix CBD Database first"
    exit 1
fi

if curl -f http://localhost:4003/health > /dev/null 2>&1; then
    echo "✅ Gateway Service: Healthy"
else
    echo "❌ Gateway Service: Unhealthy"
    echo "🛑 Deployment aborted - Fix Gateway Service first"
    exit 1
fi

# Check disk space
AVAILABLE_SPACE=$(df -h $DEPLOYMENT_DIR | awk 'NR==2 {print $4}' | sed 's/G//')
if [[ $AVAILABLE_SPACE -lt 10 ]]; then
    echo "❌ Insufficient disk space: ${AVAILABLE_SPACE}GB available (minimum 10GB required)"
    exit 1
fi
echo "✅ Disk space: ${AVAILABLE_SPACE}GB available"

# Check memory
AVAILABLE_MEMORY=$(free -g | awk 'NR==2 {print $7}')
if [[ $AVAILABLE_MEMORY -lt 2 ]]; then
    echo "❌ Insufficient memory: ${AVAILABLE_MEMORY}GB available (minimum 2GB required)"
    exit 1
fi
echo "✅ Memory: ${AVAILABLE_MEMORY}GB available"

# Step 2: Create Backup
echo ""
echo "💾 Step 2: Create Backup"
echo "========================"

BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP"

echo "📦 Creating backup at: $BACKUP_PATH"
mkdir -p "$BACKUP_PATH"

# Backup database
echo "📊 Backing up CBD Database..."
curl -s http://localhost:4180/backup > "$BACKUP_PATH/cbd_backup.json"
echo "✅ CBD Database backup completed"

# Backup configuration files
echo "⚙️ Backing up configuration..."
cp -r "$DEPLOYMENT_DIR/config" "$BACKUP_PATH/config" 2>/dev/null || echo "ℹ️ No config directory to backup"
cp "$DEPLOYMENT_DIR/.env" "$BACKUP_PATH/.env" 2>/dev/null || echo "ℹ️ No .env file to backup"
echo "✅ Configuration backup completed"

# Step 3: Build and Deploy Services
echo ""
echo "🏗️ Step 3: Build and Deploy Services"
echo "====================================="

# Set environment variables
export NODE_ENV=$ENVIRONMENT
echo "🔧 Environment set to: $NODE_ENV"

# Build Docker images
echo "🐳 Building Docker images..."
cd "$DEPLOYMENT_DIR"

if docker-compose -f docker-compose.production.yml build; then
    echo "✅ Docker images built successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi

# Deploy services
echo "🚀 Deploying services..."
if docker-compose -f docker-compose.production.yml up -d; then
    echo "✅ Services deployed successfully"
else
    echo "❌ Service deployment failed"
    echo "🔄 Rolling back..."
    docker-compose -f docker-compose.production.yml down
    exit 1
fi

# Step 4: Health Check Validation
echo ""
echo "🩺 Step 4: Health Check Validation"
echo "=================================="

echo "⏳ Waiting for services to initialize..."
sleep 30

# Check each service
SERVICES=("CBD:4180" "Gateway:4003" "CODAI:4001" "Hub:4008" "BancAI:4005" "MemorAI:4006")
HEALTHY_COUNT=0
TOTAL_SERVICES=${#SERVICES[@]}

for service in "${SERVICES[@]}"; do
    NAME=$(echo $service | cut -d':' -f1)
    PORT=$(echo $service | cut -d':' -f2)
    
    if curl -f "http://localhost:$PORT/health" > /dev/null 2>&1; then
        echo "✅ $NAME: Healthy"
        ((HEALTHY_COUNT++))
    else
        echo "❌ $NAME: Unhealthy"
    fi
done

HEALTH_PERCENTAGE=$((HEALTHY_COUNT * 100 / TOTAL_SERVICES))
echo ""
echo "📊 Health Status: $HEALTHY_COUNT/$TOTAL_SERVICES services healthy ($HEALTH_PERCENTAGE%)"

if [[ $HEALTH_PERCENTAGE -ge 80 ]]; then
    echo "✅ Deployment successful - Health threshold met (≥80%)"
else
    echo "❌ Deployment failed - Health threshold not met (<80%)"
    echo "🔄 Rolling back..."
    docker-compose -f docker-compose.production.yml down
    exit 1
fi

# Step 5: Final Validation
echo ""
echo "🎯 Step 5: Final Validation"
echo "==========================="

# Test API endpoints
echo "🧪 Testing API endpoints..."
if curl -f "http://localhost:4180/stats" > /dev/null 2>&1; then
    echo "✅ CBD Stats API: Working"
else
    echo "❌ CBD Stats API: Failed"
fi

if curl -f "http://localhost:4003/api/gateway/services" -H "Authorization: Bearer test" > /dev/null 2>&1; then
    echo "✅ Gateway Services API: Working"
else
    echo "❌ Gateway Services API: Failed"
fi

# Check SSL/TLS (if enabled)
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "🔒 Checking SSL/TLS configuration..."
    if openssl s_client -connect localhost:443 -servername codai.app < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        echo "✅ SSL/TLS: Valid certificate"
    else
        echo "⚠️ SSL/TLS: Certificate validation failed (continuing deployment)"
    fi
fi

# Step 6: Cleanup and Monitoring
echo ""
echo "🧹 Step 6: Cleanup and Monitoring"
echo "================================="

# Clean old Docker images
echo "🧹 Cleaning old Docker images..."
docker image prune -f

# Start monitoring
echo "📊 Starting monitoring services..."
docker-compose -f docker-compose.monitoring.yml up -d 2>/dev/null || echo "ℹ️ No monitoring stack to start"

# Set up log rotation
echo "📝 Configuring log rotation..."
sudo logrotate -f /etc/logrotate.d/codai 2>/dev/null || echo "ℹ️ Logrotate not configured"

echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "====================================="
echo "🌐 Environment: $ENVIRONMENT"
echo "📊 Health Status: $HEALTHY_COUNT/$TOTAL_SERVICES services healthy ($HEALTH_PERCENTAGE%)"
echo "📝 Logs: $LOG_FILE"
echo "💾 Backup: $BACKUP_PATH"
echo "⏰ Deployment Time: $(date)"
echo ""
echo "🔗 Service URLs:"
echo "   CBD Database: http://localhost:4180"
echo "   Gateway: http://localhost:4003"
echo "   CODAI App: http://localhost:4001"
echo "   Hub: http://localhost:4008"
echo ""
echo "📋 Next Steps:"
echo "   1. Monitor service health: docker-compose logs -f"
echo "   2. Check metrics: http://localhost:9090"
echo "   3. Review logs: tail -f $LOG_FILE"
echo ""
echo "✅ Production deployment ready!"
