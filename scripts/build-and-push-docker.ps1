# 🐋 Docker Build and Push Script for CODAI Ecosystem
# This script builds and pushes all Docker images to AWS ECR

param(
    [Parameter(Mandatory=$true)]
    [string]$AWSAccountId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "eu-west-1",
    
    [Parameter(Mandatory=$false)]
    [string]$Tag = "latest"
)

# Color coding for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green @args }
function Write-Warning { Write-ColorOutput Yellow @args }
function Write-Error { Write-ColorOutput Red @args }
function Write-Info { Write-ColorOutput Cyan @args }

Write-Info "🐋 CODAI Ecosystem Docker Build & Push"
Write-Info "======================================"

$ECR_REGISTRY = "$AWSAccountId.dkr.ecr.$Region.amazonaws.com"

# Service definitions with their build contexts
$services = @(
    @{
        name = "gateway"
        path = "apps/gateway"
        dockerfile = "Dockerfile"
        registry = "$ECR_REGISTRY/codai/gateway"
    },
    @{
        name = "id-service"
        path = "apps/id"
        dockerfile = "Dockerfile"
        registry = "$ECR_REGISTRY/codai/id-service"
    },
    @{
        name = "memorai"
        path = "apps/memorai"
        dockerfile = "Dockerfile"
        registry = "$ECR_REGISTRY/codai/memorai"
    },
    @{
        name = "controlai"
        path = "apps/controlai-dashboard"
        dockerfile = "Dockerfile"
        registry = "$ECR_REGISTRY/codai/controlai"
    },
    @{
        name = "romai"
        path = "apps/romai"
        dockerfile = "Dockerfile"
        registry = "$ECR_REGISTRY/codai/romai"
    },
    @{
        name = "admin"
        path = "apps/admin"
        dockerfile = "Dockerfile"
        registry = "$ECR_REGISTRY/codai/admin"
    },
    @{
        name = "hub"
        path = "apps/hub"
        dockerfile = "Dockerfile"
        registry = "$ECR_REGISTRY/codai/hub"
    },
    @{
        name = "bancai"
        path = "apps/bancai"
        dockerfile = "Dockerfile"
        registry = "$ECR_REGISTRY/codai/bancai"
    },
    @{
        name = "cbd"
        path = "packages/cbd"
        dockerfile = "Dockerfile"
        registry = "$ECR_REGISTRY/codai/cbd"
    }
)

# Login to ECR
Write-Info "🔐 Logging into ECR..."
try {
    aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $ECR_REGISTRY
    Write-Success "✅ Successfully logged into ECR"
} catch {
    Write-Error "❌ Failed to login to ECR. Please check your AWS credentials."
    exit 1
}

# Function to create Dockerfile if it doesn't exist
function Create-DefaultDockerfile {
    param($servicePath, $serviceName)
    
    $dockerfilePath = Join-Path $servicePath "Dockerfile"
    
    if (-not (Test-Path $dockerfilePath)) {
        Write-Warning "⚠️ Dockerfile not found for $serviceName, creating default..."
        
        $defaultDockerfile = @"
# Multi-stage build for $serviceName
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build ./build
COPY --from=builder /app/.next ./.next

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["pnpm", "start"]
"@
        
        Set-Content -Path $dockerfilePath -Value $defaultDockerfile
        Write-Success "✅ Created default Dockerfile for $serviceName"
    }
}

# Function to create .dockerignore if it doesn't exist
function Create-DefaultDockerignore {
    param($servicePath)
    
    $dockerignorePath = Join-Path $servicePath ".dockerignore"
    
    if (-not (Test-Path $dockerignorePath)) {
        $defaultDockerignore = @"
node_modules
npm-debug.log
.npm
.nyc_output
.coverage
.eslintcache
.next
.nuxt
dist
build
.env.local
.env.development.local
.env.test.local
.env.production.local
.DS_Store
*.log
.git
.gitignore
README.md
.env
.env.example
*.md
!README.md
"@
        
        Set-Content -Path $dockerignorePath -Value $defaultDockerignore
        Write-Info "📄 Created .dockerignore for $servicePath"
    }
}

# Build and push each service
foreach ($service in $services) {
    $servicePath = $service.path
    $serviceName = $service.name
    $registryUrl = $service.registry
    $fullImageName = "$registryUrl`:$Tag"
    
    Write-Info "🏗️ Building $serviceName..."
    
    # Check if service path exists
    if (-not (Test-Path $servicePath)) {
        Write-Warning "⚠️ Service path not found: $servicePath. Skipping $serviceName"
        continue
    }
    
    # Create Dockerfile and .dockerignore if needed
    Create-DefaultDockerfile -servicePath $servicePath -serviceName $serviceName
    Create-DefaultDockerignore -servicePath $servicePath
    
    # Build the Docker image
    try {
        Write-Info "Building image: $fullImageName"
        docker build -t $fullImageName $servicePath
        Write-Success "✅ Successfully built $serviceName"
    } catch {
        Write-Error "❌ Failed to build $serviceName"
        continue
    }
    
    # Push the image to ECR
    try {
        Write-Info "Pushing image: $fullImageName"
        docker push $fullImageName
        Write-Success "✅ Successfully pushed $serviceName to ECR"
    } catch {
        Write-Error "❌ Failed to push $serviceName to ECR"
        continue
    }
    
    Write-Info ""
}

# Generate Kubernetes deployment manifests
Write-Info "📋 Generating Kubernetes deployment manifests..."

$kubernetesDir = "infrastructure/kubernetes"
if (-not (Test-Path $kubernetesDir)) {
    New-Item -ItemType Directory -Path $kubernetesDir -Force | Out-Null
}

foreach ($service in $services) {
    $serviceName = $service.name
    $registryUrl = $service.registry
    $fullImageName = "$registryUrl`:$Tag"
    
    $deploymentYaml = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $serviceName
  labels:
    app: $serviceName
spec:
  replicas: 2
  selector:
    matchLabels:
      app: $serviceName
  template:
    metadata:
      labels:
        app: $serviceName
    spec:
      containers:
      - name: $serviceName
        image: $fullImageName
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: $serviceName-service
spec:
  selector:
    app: $serviceName
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
"@
    
    $deploymentFile = "$kubernetesDir/$serviceName-deployment.yaml"
    Set-Content -Path $deploymentFile -Value $deploymentYaml
    Write-Info "📄 Created deployment manifest: $deploymentFile"
}

Write-Success "🎉 Docker build and push completed!"
Write-Info "📋 Next steps:"
Write-Info "   1. Deploy to Kubernetes: kubectl apply -f infrastructure/kubernetes/"
Write-Info "   2. Configure ingress for domain routing"
Write-Info "   3. Set up monitoring and logging"
Write-Info ""
Write-Info "📊 All images are now available in ECR:"
foreach ($service in $services) {
    Write-Info "   - $($service.registry):$Tag"
}
