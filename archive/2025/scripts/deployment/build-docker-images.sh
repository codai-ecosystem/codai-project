#!/bin/bash

# CODAI Ecosystem Docker Build Script
# Phase 7: Container Orchestration Implementation

echo "🐳 Building CODAI Ecosystem Docker Images..."
echo "================================================"

# Set variables
REGISTRY="codai"
VERSION="latest"
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Function to build and tag images
build_image() {
    local SERVICE_NAME=$1
    local DOCKERFILE_PATH=$2
    local CONTEXT_PATH=$3
    
    echo "🔨 Building $SERVICE_NAME..."
    
    docker build \
        --build-arg BUILD_DATE="$BUILD_DATE" \
        --build-arg GIT_COMMIT="$GIT_COMMIT" \
        --build-arg VERSION="$VERSION" \
        -t "$REGISTRY/$SERVICE_NAME:$VERSION" \
        -t "$REGISTRY/$SERVICE_NAME:$GIT_COMMIT" \
        -f "$DOCKERFILE_PATH" \
        "$CONTEXT_PATH"
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully built $SERVICE_NAME"
    else
        echo "❌ Failed to build $SERVICE_NAME"
        exit 1
    fi
}

# Build backend services
echo "🏗️ Building Backend Services..."
build_image "cbd-database" "packages/cbd/Dockerfile" "packages/cbd"
build_image "gateway-service" "apps/gateway/Dockerfile" "apps/gateway"
build_image "websocket-service" "packages/websocket-service/Dockerfile" "packages/websocket-service"

# Build frontend applications
echo "🎨 Building Frontend Applications..."
build_image "codai-app" "apps/codai/Dockerfile" "apps/codai"
build_image "id-service" "apps/id/Dockerfile" "apps/id"
build_image "bancai-app" "apps/bancai/Dockerfile" "apps/bancai"
build_image "memorai-app" "apps/memorai/Dockerfile" "apps/memorai"
build_image "admin-dashboard" "apps/admin/Dockerfile" "apps/admin"
build_image "hub-app" "apps/hub/Dockerfile" "apps/hub"
build_image "controlai-dashboard" "apps/controlai-dashboard/Dockerfile" "apps/controlai-dashboard"
build_image "romai-app" "apps/romai/Dockerfile" "apps/romai"

# List built images
echo ""
echo "📊 Built Images Summary:"
echo "========================"
docker images | grep "$REGISTRY" | head -20

echo ""
echo "✅ Docker Build Complete!"
echo "🎯 Phase 7 Container Orchestration: Images Built Successfully"
echo ""
echo "Next steps:"
echo "1. Deploy to Kubernetes: kubectl apply -f k8s/"
echo "2. Verify deployments: kubectl get pods -n codai-ecosystem"
echo "3. Check services: kubectl get svc -n codai-ecosystem"
echo "4. Monitor ingress: kubectl get ingress -n codai-ecosystem"
