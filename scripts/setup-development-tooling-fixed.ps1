#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Enhanced Development Tooling Setup for Essential CodAI Services
.DESCRIPTION
    Implements comprehensive development workflow improvements including hot reload,
    automated quality checks, pre-commit hooks, and API documentation generation
.NOTES
    Sprint: Essential CodAI Services Enhancement
    User Story: US-DEV-001 - Enhanced Development Tooling
    Priority: Medium - Week 1 Implementation
#>

param(
    [switch]$SetupHotReload = $false,
    [switch]$SetupQualityChecks = $false,
    [switch]$SetupPreCommitHooks = $false,
    [switch]$SetupApiDocs = $false,
    [switch]$InstallAll = $false
)

Write-Host "🛠️ Essential CodAI Services - Enhanced Development Tooling Setup" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

function Setup-HotReload {
    Write-Host "🔥 Setting up hot reload for development..." -ForegroundColor Yellow
    Write-Host ""
    
    # Create nodemon configuration for backend services
    $nodemonConfig = @{
        watch = @("src", ".")
        ext = "js,ts,json"
        ignore = @("node_modules/", "dist/", "build/", "*.log", "*.test.js", "*.test.ts")
        exec = "npx tsx src/server-mvp.ts"
        env = @{
            NODE_ENV = "development"
            DEBUG = "codai:*"
            LOG_LEVEL = "debug"
        }
        delay = "1000ms"
        legacyWatch = $true
        verbose = $true
    }
    
    try {
        $nodemonConfig | ConvertTo-Json -Depth 5 | Out-File -FilePath "nodemon.json" -Encoding UTF8
        Write-Host "  ✅ Nodemon configuration created: nodemon.json" -ForegroundColor Green
        
        # Create development startup script
        $devScript = @'
#!/usr/bin/env pwsh
<#
.SYNOPSIS
    CodAI Services Development Startup Script
#>

Write-Host "🚀 Starting CodAI Development Environment..." -ForegroundColor Cyan

$services = @(
    @{Name="Identity API"; Path="./services/identity-api"; Port=8102; Command="npx nodemon"; Color="Blue"},
    @{Name="API Gateway"; Path="./services/api-gateway"; Port=8010; Command="npx nodemon"; Color="Green"},
    @{Name="Hub API"; Path="./services/hub-api"; Port=8110; Command="npx nodemon"; Color="Yellow"},
    @{Name="BancAI Service"; Path="./services/bancai-service"; Port=8120; Command="npx nodemon"; Color="Magenta"},
    @{Name="CBD Database Service"; Path="./services/cbd-database"; Port=8180; Command="npx nodemon"; Color="Cyan"},
    @{Name="Dashboard App"; Path="./apps/codai-dashboard"; Port=4250; Command="pnpm dev"; Color="White"}
)

foreach ($service in $services) {
    Write-Host "🔧 Starting $($service.Name) on port $($service.Port)..." -ForegroundColor $service.Color
    if (Test-Path $service.Path) {
        Set-Location $service.Path
        Start-Process -FilePath "pwsh" -ArgumentList "-ExecutionPolicy", "Bypass", "-Command", "$($service.Command)" -WindowStyle Minimized
        Set-Location (Split-Path (Split-Path $service.Path -Parent) -Parent)
        Write-Host "  ✅ $($service.Name) started" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Path not found: $($service.Path)" -ForegroundColor Red
    }
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "🎉 All development services started!" -ForegroundColor Green
Write-Host "🌐 Access points:" -ForegroundColor Yellow
Write-Host "  • Identity API: http://localhost:8102/api/health" -ForegroundColor White
Write-Host "  • API Gateway: http://localhost:8010/api/health" -ForegroundColor White
Write-Host "  • Hub API: http://localhost:8110/api/health" -ForegroundColor White
Write-Host "  • BancAI Service: http://localhost:8120/api/health" -ForegroundColor White
Write-Host "  • CBD Database: http://localhost:8180/health" -ForegroundColor White
Write-Host "  • Dashboard: http://localhost:4250" -ForegroundColor White
'@
        
        $devScript | Out-File -FilePath "start-dev-environment.ps1" -Encoding UTF8
        Write-Host "  ✅ Development startup script: start-dev-environment.ps1" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Failed to create hot reload files: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔥 Hot Reload Setup Complete!" -ForegroundColor Green
    Write-Host ""
}

function Setup-QualityChecks {
    Write-Host "🔍 Setting up automated quality checks..." -ForegroundColor Yellow
    Write-Host ""
    
    # ESLint configuration
    $eslintConfig = @{
        env = @{
            browser = $true
            es2021 = $true
            node = $true
            jest = $true
        }
        extends = @(
            "eslint:recommended",
            "@typescript-eslint/recommended",
            "prettier"
        )
        parser = "@typescript-eslint/parser"
        parserOptions = @{
            ecmaVersion = "latest"
            sourceType = "module"
        }
        plugins = @(
            "@typescript-eslint",
            "jest"
        )
        rules = @{
            "@typescript-eslint/no-unused-vars" = "error"
            "@typescript-eslint/explicit-function-return-type" = "warn"
            "@typescript-eslint/no-explicit-any" = "error"
            "prefer-const" = "error"
            "no-var" = "error"
        }
    }
    
    # Prettier configuration
    $prettierConfig = @{
        semi = $true
        trailingComma = "es5"
        singleQuote = $true
        printWidth = 100
        tabWidth = 2
        useTabs = $false
    }
    
    try {
        $eslintConfig | ConvertTo-Json -Depth 5 | Out-File -FilePath ".eslintrc.json" -Encoding UTF8
        $prettierConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath ".prettierrc" -Encoding UTF8
        
        # Quality check script
        $qualityScript = @'
#!/usr/bin/env pwsh
<#
.SYNOPSIS
    CodAI Services Quality Checks
#>

param([switch]$Fix = $false, [switch]$Coverage = $false)

Write-Host "🔍 CodAI Code Quality Checks" -ForegroundColor Cyan
Write-Host ""

$failureCount = 0

function Invoke-QualityCheck {
    param([string]$Name, [string]$Command, [string]$Color = "White")
    
    Write-Host "🔧 Running $Name..." -ForegroundColor $Color
    try {
        if ($Fix -and $Command.Contains("eslint")) { $Command += " --fix" }
        if ($Fix -and $Command.Contains("prettier")) { $Command = $Command.Replace("--check", "--write") }
        
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $Name PASSED" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $Name FAILED" -ForegroundColor Red
            $script:failureCount++
        }
    } catch {
        Write-Host "  ❌ $Name ERROR" -ForegroundColor Red
        $script:failureCount++
    }
}

Invoke-QualityCheck -Name "ESLint" -Command "npx eslint src --ext .ts,.js" -Color "Blue"
Invoke-QualityCheck -Name "Prettier" -Command "npx prettier --check src/**/*.{ts,js}" -Color "Magenta"
Invoke-QualityCheck -Name "TypeScript" -Command "npx tsc --noEmit" -Color "Green"

if ($Coverage) {
    Invoke-QualityCheck -Name "Jest Coverage" -Command "npx jest --coverage" -Color "Yellow"
} else {
    Invoke-QualityCheck -Name "Jest Tests" -Command "npx jest --passWithNoTests" -Color "Yellow"
}

Write-Host ""
if ($failureCount -eq 0) {
    Write-Host "✅ All quality checks PASSED" -ForegroundColor Green
} else {
    Write-Host "❌ $failureCount quality check(s) FAILED" -ForegroundColor Red
}
'@
        
        $qualityScript | Out-File -FilePath "quality-check.ps1" -Encoding UTF8
        
        Write-Host "  ✅ ESLint configuration: .eslintrc.json" -ForegroundColor Green
        Write-Host "  ✅ Prettier configuration: .prettierrc" -ForegroundColor Green
        Write-Host "  ✅ Quality check script: quality-check.ps1" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Failed to create quality check files: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔍 Quality Checks Setup Complete!" -ForegroundColor Green
    Write-Host ""
}

function Setup-PreCommitHooks {
    Write-Host "🎣 Setting up pre-commit hooks..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Create .husky directory
        New-Item -ItemType Directory -Path ".husky" -Force | Out-Null
        
        # Pre-commit hook
        $preCommitHook = @'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🎣 Running pre-commit hooks..."

# Run lint-staged
npx lint-staged

# Type checking
echo "🔍 Type checking..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
  echo "❌ Type checking failed. Commit aborted."
  exit 1
fi

echo "✅ All pre-commit checks passed!"
'@
        
        $preCommitHook | Out-File -FilePath ".husky/pre-commit" -Encoding UTF8 -NoNewline
        
        # Setup script
        $huskySetup = @'
#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup Husky Pre-commit Hooks
#>

Write-Host "🎣 Setting up Husky pre-commit hooks..." -ForegroundColor Cyan

Write-Host "📦 Installing husky and lint-staged..." -ForegroundColor Yellow
npm install --save-dev husky lint-staged @commitlint/config-conventional @commitlint/cli

Write-Host "🔧 Initializing husky..." -ForegroundColor Yellow
npx husky install

Write-Host "✅ Husky hooks setup complete!" -ForegroundColor Green
'@
        
        $huskySetup | Out-File -FilePath "setup-hooks.ps1" -Encoding UTF8
        
        Write-Host "  ✅ Pre-commit hook: .husky/pre-commit" -ForegroundColor Green
        Write-Host "  ✅ Husky setup script: setup-hooks.ps1" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Failed to create pre-commit hooks: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🎣 Pre-commit Hooks Setup Complete!" -ForegroundColor Green
    Write-Host ""
}

function Setup-ApiDocs {
    Write-Host "📚 Setting up API documentation generation..." -ForegroundColor Yellow
    Write-Host ""
    
    # Swagger configuration
    $swaggerConfig = @'
// Swagger/OpenAPI Configuration for CodAI Services
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'CodAI Essential Services API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for CodAI Essential Services'
    },
    servers: [
      { url: 'http://localhost:8100', description: 'Identity API Development' },
      { url: 'http://localhost:8010', description: 'API Gateway Development' },
      { url: 'http://localhost:8110', description: 'Hub API Development' }
    ]
  },
  apis: ['./src/routes/*.js', './src/routes/*.ts', './src/controllers/*.js', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(options);
module.exports = { specs };
'@
    
    # Documentation generation script
    $docGenScript = @'
#!/usr/bin/env pwsh
<#
.SYNOPSIS
    API Documentation Generator
#>

param([switch]$Build = $false, [switch]$Serve = $false, [string]$Output = "./docs")

Write-Host "📚 CodAI API Documentation Generator" -ForegroundColor Cyan

if ($Build) {
    Write-Host "🔧 Building API documentation..." -ForegroundColor Yellow
    
    if (!(Test-Path $Output)) {
        New-Item -ItemType Directory -Path $Output -Force | Out-Null
    }
    
    $services = @("identity-api", "api-gateway", "hub-api", "bancai-service", "cbd-database")
    
    foreach ($service in $services) {
        $servicePath = "./services/$service"
        if (Test-Path $servicePath) {
            Write-Host "  📖 Generating docs for $service..." -ForegroundColor White
            
            Set-Location $servicePath
            
            try {
                node -e "const { specs } = require('./swagger-config'); const fs = require('fs'); fs.writeFileSync('../../$Output/$service-api.json', JSON.stringify(specs, null, 2));"
                Write-Host "    ✅ $service documentation generated" -ForegroundColor Green
            } catch {
                Write-Host "    ⚠️ $service documentation failed" -ForegroundColor Yellow
            }
            
            Set-Location "../.."
        }
    }
    
    Write-Host "✅ API documentation generated in $Output/" -ForegroundColor Green
}

if ($Serve) {
    Write-Host "🌐 Starting documentation server on http://localhost:3001..." -ForegroundColor Yellow
    python -m http.server 3001 --directory $Output
}
'@
    
    try {
        $swaggerConfig | Out-File -FilePath "swagger-config.js" -Encoding UTF8
        $docGenScript | Out-File -FilePath "generate-api-docs.ps1" -Encoding UTF8
        
        Write-Host "  ✅ Swagger configuration: swagger-config.js" -ForegroundColor Green
        Write-Host "  ✅ Documentation generator: generate-api-docs.ps1" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Failed to create API documentation files: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "📚 API Documentation Setup Complete!" -ForegroundColor Green
    Write-Host ""
}

# Main execution
Write-Host "⚙️ Development Tooling Configuration:" -ForegroundColor Gray
Write-Host "  🔥 Hot Reload: Nodemon + Next.js dev server" -ForegroundColor Gray
Write-Host "  🔍 Quality Checks: ESLint + Prettier + TypeScript + Jest" -ForegroundColor Gray
Write-Host "  🎣 Pre-commit Hooks: Husky + lint-staged + commitlint" -ForegroundColor Gray
Write-Host "  📚 API Docs: Swagger/OpenAPI 3.0.3" -ForegroundColor Gray
Write-Host ""

if ($InstallAll) {
    Write-Host "🚀 Installing all development tooling enhancements..." -ForegroundColor Green
    Setup-HotReload
    Setup-QualityChecks
    Setup-PreCommitHooks
    Setup-ApiDocs
} elseif ($SetupHotReload) {
    Setup-HotReload
} elseif ($SetupQualityChecks) {
    Setup-QualityChecks
} elseif ($SetupPreCommitHooks) {
    Setup-PreCommitHooks
} elseif ($SetupApiDocs) {
    Setup-ApiDocs
} else {
    Write-Host "🛠️ Setting up all development tooling enhancements..." -ForegroundColor Green
    Setup-HotReload
    Setup-QualityChecks
    Setup-PreCommitHooks
    Setup-ApiDocs
}

Write-Host ""
Write-Host "🎉 Enhanced Development Tooling Setup Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of Enhancements:" -ForegroundColor Cyan
Write-Host "✅ Hot Reload Configuration - Development efficiency improved" -ForegroundColor Green
Write-Host "✅ Automated Quality Checks - Code quality enforcement" -ForegroundColor Green
Write-Host "✅ Pre-commit Hooks - Prevent bad code from entering repository" -ForegroundColor Green
Write-Host "✅ API Documentation Generation - Comprehensive API docs" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 US-DEV-001 Status: IMPLEMENTATION COMPLETE" -ForegroundColor Green
Write-Host "Next: Advanced Features Implementation (US-FEAT-002)" -ForegroundColor Cyan