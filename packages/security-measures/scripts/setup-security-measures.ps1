#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Setup script for CodAI Security Measures package
.DESCRIPTION
    This script sets up the security measures package for Essential CodAI Services
    including dependency installation, configuration, and initial security setup.
#>

param(
    [switch]$SkipInstall = $false,
    [switch]$Production = $false,
    [switch]$Verbose = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Success = "Green"
    Warning = "Yellow" 
    Error = "Red"
    Info = "Cyan"
    Debug = "Gray"
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Checking prerequisites..." "Info"
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-ColorOutput "  ✅ Node.js: $nodeVersion" "Success"
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-ColorOutput "  ❌ Node.js is required but not found" "Error"
        return $false
    }
    
    # Check npm/pnpm
    try {
        $npmVersion = npm --version 2>$null
        Write-ColorOutput "  ✅ npm: v$npmVersion" "Success"
    } catch {
        Write-ColorOutput "  ❌ npm is required but not found" "Error"
        return $false
    }
    
    # Check Docker (optional)
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-ColorOutput "  ✅ Docker: $dockerVersion" "Success"
        }
    } catch {
        Write-ColorOutput "  ⚠️ Docker not found (optional for some features)" "Warning"
    }
    
    return $true
}

function Install-Dependencies {
    if ($SkipInstall) {
        Write-ColorOutput "⏭️ Skipping dependency installation" "Info"
        return
    }
    
    Write-ColorOutput "📦 Installing dependencies..." "Info"
    
    try {
        if ($Production) {
            Write-ColorOutput "  Installing production dependencies only..." "Info"
            npm install --production --silent
        } else {
            Write-ColorOutput "  Installing all dependencies..." "Info"
            npm install --silent
        }
        Write-ColorOutput "  ✅ Dependencies installed successfully" "Success"
    } catch {
        Write-ColorOutput "  ❌ Failed to install dependencies: $_" "Error"
        throw
    }
}

function Build-Package {
    Write-ColorOutput "🔨 Building security measures package..." "Info"
    
    try {
        npm run build 2>$null
        if (Test-Path "./dist") {
            Write-ColorOutput "  ✅ Package built successfully" "Success"
        } else {
            throw "Build output not found"
        }
    } catch {
        Write-ColorOutput "  ❌ Failed to build package: $_" "Error"
        throw
    }
}

function Setup-Directories {
    Write-ColorOutput "📁 Creating required directories..." "Info"
    
    $directories = @(
        "./logs",
        "./logs/security",
        "./security-scans",
        "./config"
    )
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-ColorOutput "  ✅ Created directory: $dir" "Success"
        } else {
            Write-ColorOutput "  ✅ Directory exists: $dir" "Debug"
        }
    }
}

function Setup-Configuration {
    Write-ColorOutput "⚙️ Setting up security configuration..." "Info"
    
    # Create .env.example if it doesn't exist
    $envExample = @"
# CodAI Security Measures Configuration

# Rate Limiting
SECURITY_RATE_LIMIT_ENABLED=true
SECURITY_RATE_LIMIT_WINDOW_MS=60000
SECURITY_RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
SECURITY_CORS_ENABLED=true
SECURITY_CORS_ORIGIN=http://localhost:3000,http://localhost:4000,https://codai.ro

# Security Headers
SECURITY_HEADERS_ENABLED=true
SECURITY_CSP_ENABLED=true
SECURITY_HSTS_ENABLED=true

# Monitoring
SECURITY_MONITORING_ENABLED=true
SECURITY_THREAT_DETECTION_ENABLED=true
SECURITY_BRUTE_FORCE_DETECTION_ENABLED=true

# Vulnerability Scanning
SECURITY_VULNERABILITY_SCANNING_ENABLED=true
SNYK_TOKEN=your-snyk-token-here

# Alerting
SECURITY_ALERTING_ENABLED=true
SECURITY_ALERT_EMAIL=security@codai.ro
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password

# Elasticsearch (optional)
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-password

# Redis (optional for rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_RATE_LIMIT_ENABLED=true
REDIS_RATE_LIMIT_PREFIX=codai:security:rate-limit:
"@

    if (!(Test-Path "./.env.example")) {
        $envExample | Out-File -FilePath "./.env.example" -Encoding UTF8
        Write-ColorOutput "  ✅ Created .env.example file" "Success"
    }
    
    # Check if .env exists, if not, copy from example
    if (!(Test-Path "./.env")) {
        Copy-Item "./.env.example" "./.env"
        Write-ColorOutput "  ✅ Created .env file from example" "Success"
        Write-ColorOutput "  ⚠️ Please review and update .env file with your configuration" "Warning"
    }
}

function Test-Installation {
    Write-ColorOutput "🧪 Testing installation..." "Info"
    
    try {
        # Test TypeScript compilation
        if (Test-Path "./dist/index.js") {
            Write-ColorOutput "  ✅ TypeScript compilation successful" "Success"
        }
        
        # Test CLI functionality
        try {
            $cliTest = node ./dist/cli.js --help 2>$null
            if ($cliTest) {
                Write-ColorOutput "  ✅ CLI tool functional" "Success"
            }
        } catch {
            Write-ColorOutput "  ⚠️ CLI tool may have issues" "Warning"
        }
        
        # Test import
        $testScript = @"
try {
    const { SecurityManager } = require('./dist/index.js');
    console.log('✅ Package import successful');
} catch (error) {
    console.error('❌ Package import failed:', error.message);
    process.exit(1);
}
"@
        
        $testScript | Out-File -FilePath "./test-import.js" -Encoding UTF8
        node ./test-import.js
        Remove-Item "./test-import.js" -Force
        
        Write-ColorOutput "  ✅ Installation test passed" "Success"
    } catch {
        Write-ColorOutput "  ❌ Installation test failed: $_" "Error"
        throw
    }
}

function Show-Summary {
    Write-ColorOutput "`n🎉 CodAI Security Measures Setup Complete!" "Success"
    Write-ColorOutput "=" * 50 "Info"
    
    Write-ColorOutput "`n📋 What was installed:" "Info"
    Write-ColorOutput "  • Security middleware for Fastify applications" "Debug"
    Write-ColorOutput "  • Vulnerability scanning tools" "Debug"
    Write-ColorOutput "  • Security monitoring dashboard" "Debug"
    Write-ColorOutput "  • Threat detection engine" "Debug"
    Write-ColorOutput "  • CLI management tools" "Debug"
    
    Write-ColorOutput "`n🚀 Next steps:" "Info"
    Write-ColorOutput "  1. Review and update the .env file with your configuration" "Warning"
    Write-ColorOutput "  2. Integrate with your Essential CodAI Services:" "Debug"
    Write-ColorOutput "     • Import { SecurityManager } from '@codai/security-measures'" "Debug"
    Write-ColorOutput "     • Initialize security in your Fastify applications" "Debug"
    Write-ColorOutput "  3. Start security monitoring:" "Debug"
    Write-ColorOutput "     • npm run security:monitor" "Debug"
    Write-ColorOutput "  4. Run vulnerability scan:" "Debug"
    Write-ColorOutput "     • npm run security:scan" "Debug"
    
    Write-ColorOutput "`n📚 Documentation:" "Info"
    Write-ColorOutput "  • CLI Help: npx codai-security --help" "Debug"
    Write-ColorOutput "  • Security Dashboard: http://localhost:8080/security/dashboard" "Debug"
    Write-ColorOutput "  • Configuration Guide: see .env.example" "Debug"
    
    Write-ColorOutput "`n🛡️ Essential CodAI Services Security Profiles:" "Info"
    Write-ColorOutput "  • codai-auth-api (Port 8100) - Enhanced authentication security" "Debug"
    Write-ColorOutput "  • codai-gateway-api (Port 8010) - API gateway protection" "Debug"
    Write-ColorOutput "  • codai-hub-api (Port 8110) - Hub service security" "Debug"
    Write-ColorOutput "  • codai-memorai-mcp (Port 4950) - MCP server protection" "Debug"
    Write-ColorOutput "  • codai-cbd-database (Port 8180) - Database security" "Debug"
    Write-ColorOutput "  • codai-memorai-frontend (Port 8006) - Frontend security headers" "Debug"
}

function Main {
    try {
        Write-ColorOutput "🛡️ CodAI Security Measures Setup Script" "Info"
        Write-ColorOutput "=" * 50 "Info"
        
        if ($Verbose) {
            Write-ColorOutput "Running in verbose mode" "Debug"
            $VerbosePreference = "Continue"
        }
        
        # Check prerequisites
        if (!(Test-Prerequisites)) {
            throw "Prerequisites check failed"
        }
        
        # Install dependencies
        Install-Dependencies
        
        # Build package
        Build-Package
        
        # Setup directories
        Setup-Directories
        
        # Setup configuration
        Setup-Configuration
        
        # Test installation
        Test-Installation
        
        # Show summary
        Show-Summary
        
        Write-ColorOutput "`n✨ Setup completed successfully!" "Success"
        
    } catch {
        Write-ColorOutput "`n❌ Setup failed: $_" "Error"
        Write-ColorOutput "Please check the error messages above and try again." "Error"
        exit 1
    }
}

# Run main function
Main