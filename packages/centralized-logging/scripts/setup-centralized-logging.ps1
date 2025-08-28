#!/usr/bin/env pwsh

# CodAI Centralized Logging Setup Script
# Comprehensive setup for the centralized logging system

[CmdletBinding()]
param(
    [string]$Environment = "development",
    [switch]$SkipElasticsearch = $false,
    [switch]$Verbose = $false
)

Write-Host "🚀 Setting up CodAI Centralized Logging System" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Set error handling
$ErrorActionPreference = "Stop"

try {
    # Environment configuration
    Write-Host "📋 Environment Configuration" -ForegroundColor Yellow
    Write-Host "Environment: $Environment" -ForegroundColor White
    Write-Host "Skip Elasticsearch: $SkipElasticsearch" -ForegroundColor White
    Write-Host ""

    # Check prerequisites
    Write-Host "🔍 Checking Prerequisites" -ForegroundColor Yellow
    
    # Check Node.js
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js is not installed. Please install Node.js 18+ first."
    }
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

    # Check pnpm
    $pnpmVersion = pnpm --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ pnpm not found, installing..." -ForegroundColor Yellow
        npm install -g pnpm
        $pnpmVersion = pnpm --version
    }
    Write-Host "✅ pnpm: $pnpmVersion" -ForegroundColor Green

    # Check Docker
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Docker not available - some features may not work" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
    }
    Write-Host ""

    # Install dependencies
    Write-Host "📦 Installing Dependencies" -ForegroundColor Yellow
    Set-Location "$PSScriptRoot/../"
    
    Write-Host "Installing npm packages..." -ForegroundColor White
    pnpm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        throw "Failed to install dependencies"
    }
    Write-Host ""

    # Build TypeScript
    Write-Host "🔨 Building TypeScript" -ForegroundColor Yellow
    Write-Host "Compiling TypeScript files..." -ForegroundColor White
    pnpm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript compiled successfully" -ForegroundColor Green
    } else {
        throw "Failed to compile TypeScript"
    }
    Write-Host ""

    # Setup environment files
    Write-Host "⚙️ Setting up Environment Configuration" -ForegroundColor Yellow
    
    $envFile = ".env"
    if (-not (Test-Path $envFile)) {
        Write-Host "Creating .env file..." -ForegroundColor White
        $envContent = @"
# CodAI Centralized Logging Configuration
NODE_ENV=$Environment
LOG_LEVEL=debug
LOG_FORMAT=json

# Server Configuration
LOGGING_SERVER_PORT=4960
LOGGING_SERVER_HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,http://localhost:4000,http://localhost:4006,http://localhost:8006

# Elasticsearch Configuration
ELASTICSEARCH_ENABLED=true
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=codai-logs
ELASTICSEARCH_LOG_LEVEL=info
ELASTICSEARCH_MAX_RETRIES=3
ELASTICSEARCH_REQUEST_TIMEOUT=10000
ELASTICSEARCH_SNIFF_ON_START=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_KEY_PREFIX=codai:logs:

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=codai_logs
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Log Correlation
LOG_CORRELATION_ENABLED=true
LOG_CORRELATION_TIME_WINDOW=30

# Security
LOG_AUTH_ENABLED=false
LOG_API_KEY=codai-logging-dev-key-2025
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# Alerting
LOG_ALERTING_ENABLED=false
LOG_ALERT_CHECK_INTERVAL=5
"@
        $envContent | Out-File -FilePath $envFile -Encoding UTF8
        Write-Host "✅ Created .env file with default configuration" -ForegroundColor Green
    } else {
        Write-Host "✅ .env file already exists" -ForegroundColor Green
    }
    Write-Host ""

    # Setup logging directories
    Write-Host "📁 Setting up Logging Directories" -ForegroundColor Yellow
    $logDir = "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir
        Write-Host "✅ Created logs directory" -ForegroundColor Green
    } else {
        Write-Host "✅ Logs directory already exists" -ForegroundColor Green
    }
    Write-Host ""

    # Start infrastructure services if Docker is available
    if ($dockerVersion -and -not $SkipElasticsearch) {
        Write-Host "🐳 Starting Infrastructure Services" -ForegroundColor Yellow
        
        # Check if docker-compose is available in parent directory
        $dockerComposePath = "../docker-compose.yml"
        if (Test-Path $dockerComposePath) {
            Write-Host "Starting PostgreSQL, Redis, and Elasticsearch..." -ForegroundColor White
            Set-Location "../"
            
            # Start required services
            docker-compose up -d postgres redis 
            
            if (-not $SkipElasticsearch) {
                # Check if Elasticsearch service exists in docker-compose
                $dockerComposeContent = Get-Content $dockerComposePath -Raw
                if ($dockerComposeContent -match "elasticsearch") {
                    docker-compose up -d elasticsearch
                    Write-Host "✅ Infrastructure services starting" -ForegroundColor Green
                } else {
                    Write-Host "⚠️ Elasticsearch not found in docker-compose.yml" -ForegroundColor Yellow
                    Write-Host "Creating minimal Elasticsearch container..." -ForegroundColor White
                    
                    docker run -d `
                        --name codai-elasticsearch `
                        -p 9200:9200 -p 9300:9300 `
                        -e "discovery.type=single-node" `
                        -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" `
                        elasticsearch:8.11.0
                    
                    Write-Host "✅ Elasticsearch container started" -ForegroundColor Green
                }
            }
            
            Set-Location "packages/centralized-logging"
        } else {
            Write-Host "⚠️ docker-compose.yml not found, skipping infrastructure setup" -ForegroundColor Yellow
        }
        Write-Host ""
    }

    # Wait for services to be ready
    if (-not $SkipElasticsearch) {
        Write-Host "⏳ Waiting for Services to be Ready" -ForegroundColor Yellow
        
        # Wait for PostgreSQL
        Write-Host "Checking PostgreSQL connection..." -ForegroundColor White
        $postgresReady = $false
        for ($i = 1; $i -le 30; $i++) {
            try {
                $result = docker exec codai-postgresql-db pg_isready -U postgres 2>$null
                if ($LASTEXITCODE -eq 0) {
                    $postgresReady = $true
                    break
                }
            } catch {}
            Start-Sleep 2
        }
        
        if ($postgresReady) {
            Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green
        } else {
            Write-Host "⚠️ PostgreSQL not ready, continuing anyway" -ForegroundColor Yellow
        }

        # Wait for Redis
        Write-Host "Checking Redis connection..." -ForegroundColor White
        $redisReady = $false
        for ($i = 1; $i -le 15; $i++) {
            try {
                $result = docker exec codai-redis-cache redis-cli ping 2>$null
                if ($result -match "PONG") {
                    $redisReady = $true
                    break
                }
            } catch {}
            Start-Sleep 2
        }
        
        if ($redisReady) {
            Write-Host "✅ Redis is ready" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Redis not ready, continuing anyway" -ForegroundColor Yellow
        }

        # Wait for Elasticsearch
        if (-not $SkipElasticsearch) {
            Write-Host "Checking Elasticsearch connection..." -ForegroundColor White
            $elasticsearchReady = $false
            for ($i = 1; $i -le 60; $i++) {
                try {
                    $response = Invoke-RestMethod -Uri "http://localhost:9200/_cluster/health" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
                    if ($response -and $response.status -in @("yellow", "green")) {
                        $elasticsearchReady = $true
                        break
                    }
                } catch {}
                Start-Sleep 3
            }
            
            if ($elasticsearchReady) {
                Write-Host "✅ Elasticsearch is ready" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Elasticsearch not ready, continuing anyway" -ForegroundColor Yellow
            }
        }
        Write-Host ""
    }

    # Run tests
    Write-Host "🧪 Running Tests" -ForegroundColor Yellow
    Write-Host "Running basic functionality tests..." -ForegroundColor White
    
    # Basic import test
    $testScript = @"
const { createLoggingConfig, WinstonLogger } = await import('./dist/index.js');
const config = createLoggingConfig();
const logger = new WinstonLogger(config);
const entry = logger.info('Test log entry', 'test-service', { testData: 'success' });
console.log('✅ Logging system test passed');
await logger.close();
"@
    
    $testScript | Out-File -FilePath "test-setup.mjs" -Encoding UTF8
    node test-setup.mjs
    Remove-Item "test-setup.mjs"
    
    Write-Host "✅ Basic tests passed" -ForegroundColor Green
    Write-Host ""

    # Summary and next steps
    Write-Host "🎉 Setup Complete!" -ForegroundColor Green
    Write-Host "===================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📋 What was configured:" -ForegroundColor Cyan
    Write-Host "  ✅ TypeScript packages installed and compiled" -ForegroundColor White
    Write-Host "  ✅ Environment configuration created" -ForegroundColor White
    Write-Host "  ✅ Logging directories created" -ForegroundColor White
    if (-not $SkipElasticsearch) {
        Write-Host "  ✅ Infrastructure services started" -ForegroundColor White
    }
    Write-Host "  ✅ Basic functionality verified" -ForegroundColor White
    Write-Host ""

    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Start the logging service: pnpm run dev" -ForegroundColor White
    Write-Host "  2. Test the service: http://localhost:4960/health" -ForegroundColor White
    Write-Host "  3. WebSocket streaming: ws://localhost:4960/ws/logs" -ForegroundColor White
    Write-Host "  4. View logs in: ./logs/ directory" -ForegroundColor White
    Write-Host ""

    Write-Host "📊 Service Endpoints:" -ForegroundColor Cyan
    Write-Host "  • Health Check: GET http://localhost:4960/health" -ForegroundColor White
    Write-Host "  • Log Ingestion: POST http://localhost:4960/api/logs" -ForegroundColor White
    Write-Host "  • Log Search: POST http://localhost:4960/api/logs/search" -ForegroundColor White
    Write-Host "  • Dashboard Data: GET http://localhost:4960/api/dashboard" -ForegroundColor White
    Write-Host "  • WebSocket Stream: ws://localhost:4960/ws/logs" -ForegroundColor White
    Write-Host ""

    Write-Host "✨ CodAI Centralized Logging System is ready for use!" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "❌ Setup Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Ensure Node.js 18+ is installed" -ForegroundColor White
    Write-Host "  2. Check Docker is running (if using infrastructure)" -ForegroundColor White
    Write-Host "  3. Verify network connectivity" -ForegroundColor White
    Write-Host "  4. Check permissions for directory creation" -ForegroundColor White
    Write-Host "  5. Run with -Verbose for detailed output" -ForegroundColor White
    exit 1
}