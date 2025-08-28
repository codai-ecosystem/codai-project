#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Setup script for CodAI API Documentation package

.DESCRIPTION
    Comprehensive setup script for the API Documentation system.
    Installs dependencies, builds the package, and optionally starts the documentation server.

.PARAMETER SkipBuild
    Skip the TypeScript build process

.PARAMETER StartServer
    Start the documentation server after setup

.PARAMETER Port
    Port for the documentation server (default: 4200)

.PARAMETER GenerateDocs
    Generate initial documentation after setup

.EXAMPLE
    .\setup-api-documentation.ps1 -StartServer -Port 4200 -GenerateDocs
#>

param(
    [switch]$SkipBuild = $false,
    [switch]$StartServer = $false,
    [int]$Port = 4200,
    [switch]$GenerateDocs = $false,
    [switch]$Verbose = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Enable verbose output if requested
if ($Verbose) {
    $VerbosePreference = "Continue"
}

Write-Host "📚 Setting up CodAI API Documentation System..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if we're in the correct directory
$packagePath = "packages/api-documentation"
if (-not (Test-Path $packagePath)) {
    Write-Error "❌ API Documentation package not found at $packagePath. Please run from workspace root."
}

Set-Location $packagePath
Write-Verbose "📁 Working directory: $(Get-Location)"

# Check Node.js and npm
Write-Host "`n🔧 Checking prerequisites..." -ForegroundColor Blue
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Error "❌ Node.js or npm not found. Please install Node.js first."
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Blue
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Error "❌ Failed to install dependencies: $_"
}

# Build TypeScript project
if (-not $SkipBuild) {
    Write-Host "`n🔨 Building TypeScript project..." -ForegroundColor Blue
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "TypeScript build failed"
        }
        Write-Host "✅ TypeScript build completed" -ForegroundColor Green
    } catch {
        Write-Error "❌ Failed to build TypeScript project: $_"
    }
} else {
    Write-Host "⏭️ Skipping TypeScript build" -ForegroundColor Yellow
}

# Verify build output
if (Test-Path "dist") {
    $distFiles = Get-ChildItem "dist" -Recurse -File | Measure-Object
    Write-Host "📄 Generated $($distFiles.Count) files in dist/" -ForegroundColor Gray
} else {
    Write-Warning "⚠️ dist/ directory not found - build may have failed"
}

# Create output directories
Write-Host "`n📁 Creating output directories..." -ForegroundColor Blue
$outputDirs = @("docs/generated", "static", "logs")
foreach ($dir in $outputDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "📁 Directory exists: $dir" -ForegroundColor Gray
    }
}

# Generate initial documentation if requested
if ($GenerateDocs) {
    Write-Host "`n📝 Generating initial documentation..." -ForegroundColor Blue
    try {
        npm run generate
        if ($LASTEXITCODE -ne 0) {
            throw "Documentation generation failed"
        }
        Write-Host "✅ Initial documentation generated" -ForegroundColor Green
    } catch {
        Write-Warning "⚠️ Failed to generate initial documentation: $_"
        Write-Host "You can generate documentation later using: npm run generate" -ForegroundColor Yellow
    }
}

# Test CLI functionality
Write-Host "`n🧪 Testing CLI functionality..." -ForegroundColor Blue
try {
    npm run cli -- --help | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "CLI test failed"
    }
    Write-Host "✅ CLI is functional" -ForegroundColor Green
} catch {
    Write-Warning "⚠️ CLI test failed: $_"
}

# Check Essential CodAI Services health
Write-Host "`n🏥 Checking Essential CodAI Services health..." -ForegroundColor Blue
try {
    # Define service endpoints
    $services = @(
        @{ Name = "Auth API"; Url = "http://localhost:8100/api/v1/health" },
        @{ Name = "Gateway API"; Url = "http://localhost:8010/api/v1/health" },
        @{ Name = "Hub API"; Url = "http://localhost:8110/api/v1/health" },
        @{ Name = "MemorAI MCP"; Url = "http://localhost:4950/health" },
        @{ Name = "CBD Database"; Url = "http://localhost:8180/api/v1/health" },
        @{ Name = "MemorAI Frontend"; Url = "http://localhost:8006/api/health" }
    )
    
    $healthyCount = 0
    $totalCount = $services.Count
    
    foreach ($service in $services) {
        try {
            $response = Invoke-RestMethod -Uri $service.Url -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
            Write-Host "  ✅ $($service.Name): HEALTHY" -ForegroundColor Green
            $healthyCount++
        } catch {
            Write-Host "  ❌ $($service.Name): UNREACHABLE" -ForegroundColor Red
        }
    }
    
    $healthPercent = [math]::Round(($healthyCount / $totalCount) * 100, 1)
    Write-Host "📊 Service Health: $healthyCount/$totalCount ($healthPercent%)" -ForegroundColor $(
        if ($healthPercent -eq 100) { "Green" }
        elseif ($healthPercent -ge 50) { "Yellow" }
        else { "Red" }
    )
    
} catch {
    Write-Warning "⚠️ Health check failed: $_"
}

# Setup completion
Write-Host "`n✅ API Documentation setup completed successfully!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Display usage information
Write-Host "`n📖 Usage Information:" -ForegroundColor Cyan
Write-Host "  Generate docs:     npm run generate" -ForegroundColor White
Write-Host "  Start server:      npm run serve" -ForegroundColor White
Write-Host "  CLI help:          npm run cli -- --help" -ForegroundColor White
Write-Host "  Validate docs:     npm run cli -- validate" -ForegroundColor White
Write-Host "  Check health:      npm run cli -- health" -ForegroundColor White
Write-Host "  List services:     npm run cli -- list" -ForegroundColor White

# Start server if requested
if ($StartServer) {
    Write-Host "`n🚀 Starting documentation server on port $Port..." -ForegroundColor Blue
    $env:DOCS_PORT = $Port
    try {
        Write-Host "📖 Documentation will be available at: http://localhost:$Port" -ForegroundColor Cyan
        Write-Host "🔧 Interactive API docs at: http://localhost:$Port/docs" -ForegroundColor Cyan
        Write-Host "📊 Service health at: http://localhost:$Port/api/services/health" -ForegroundColor Cyan
        Write-Host "`nPress Ctrl+C to stop the server" -ForegroundColor Yellow
        npm run serve
    } catch {
        Write-Error "❌ Failed to start documentation server: $_"
    }
} else {
    Write-Host "`n💡 To start the documentation server, run:" -ForegroundColor Yellow
    Write-Host "   npm run serve" -ForegroundColor White
    Write-Host "   # or with custom port:" -ForegroundColor Gray
    Write-Host "   DOCS_PORT=$Port npm run serve" -ForegroundColor White
}

Write-Host "`n🎉 Setup complete! Ready for API documentation generation and serving." -ForegroundColor Green