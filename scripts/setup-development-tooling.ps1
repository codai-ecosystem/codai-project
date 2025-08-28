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

# Development tooling configuration
$toolingConfig = @{
    HotReload = @{
        Frontend = @{
            Framework = "Next.js"
            Command = "pnpm dev"
            Port = 4250
            WatchPatterns = @("src/**/*", "components/**/*", "pages/**/*", "app/**/*")
        }
        Backend = @{
            Framework = "Node.js + Fastify"
            Tool = "nodemon"
            WatchPatterns = @("src/**/*.js", "src/**/*.ts", "*.js", "*.ts")
            IgnorePatterns = @("node_modules", "dist", "build", "*.log")
        }
    }
    QualityChecks = @{
        Linting = @{
            Tool = "ESLint"
            Config = ".eslintrc.json"
            Extensions = @(".js", ".ts", ".jsx", ".tsx")
            Rules = "recommended + @typescript-eslint/recommended"
        }
        Formatting = @{
            Tool = "Prettier"
            Config = ".prettierrc"
            Extensions = @(".js", ".ts", ".jsx", ".tsx", ".json", ".md")
        }
        TypeChecking = @{
            Tool = "TypeScript Compiler"
            Config = "tsconfig.json"
            Mode = "strict"
        }
        Testing = @{
            Tool = "Jest + Supertest"
            Coverage = "85%"
            Config = "jest.config.js"
        }
    }
    PreCommitHooks = @{
        Tool = "husky + lint-staged"
        Hooks = @("pre-commit", "commit-msg", "pre-push")
        Actions = @("lint", "format", "type-check", "test")
    }
    ApiDocumentation = @{
        Tool = "Swagger/OpenAPI"
        Version = "3.0.3"
        Generator = "@apidevtools/swagger-jsdoc"
        UI = "swagger-ui-express"
        OutputFormat = @("JSON", "YAML", "HTML")
    }
}

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
    } catch {
        Write-Host "  ❌ Failed to create nodemon config: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Create development startup script
    $devStartScript = @"
#!/usr/bin/env pwsh

<#
.SYNOPSIS
    CodAI Services Development Startup Script
.DESCRIPTION
    Starts all Essential CodAI Services with hot reload enabled
#>

Write-Host "🚀 Starting CodAI Development Environment..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Array of services to start
`$services = @(
    @{
        Name = "Identity API"
        Path = "./services/identity-api"
        Port = 8102
        Command = "npx nodemon"
        Color = "Blue"
    },
    @{
        Name = "API Gateway"
        Path = "./services/api-gateway"
        Port = 8010
        Command = "npx nodemon"
        Color = "Green"
    },
    @{
        Name = "Hub API"
        Path = "./services/hub-api"
        Port = 8110
        Command = "npx nodemon"
        Color = "Yellow"
    },
    @{
        Name = "BancAI Service"
        Path = "./services/bancai-service"
        Port = 8120
        Command = "npx nodemon"
        Color = "Magenta"
    },
    @{
        Name = "CBD Database Service"
        Path = "./services/cbd-database"
        Port = 8180
        Command = "npx nodemon"
        Color = "Cyan"
    },
    @{
        Name = "Dashboard App"
        Path = "./apps/codai-dashboard"
        Port = 4250
        Command = "pnpm dev"
        Color = "White"
    }
)

# Function to start a service in background
function Start-Service {
    param([hashtable]`$service)
    
    Write-Host "🔧 Starting `$(`$service.Name) on port `$(`$service.Port)..." -ForegroundColor `$service.Color
    
    if (Test-Path `$service.Path) {
        Set-Location `$service.Path
        Start-Process -FilePath "pwsh" -ArgumentList "-ExecutionPolicy", "Bypass", "-Command", "`$(`$service.Command)" -WindowStyle Minimized
        Set-Location (Split-Path (Split-Path `$service.Path -Parent) -Parent)
        Write-Host "  ✅ `$(`$service.Name) started" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Path not found: `$(`$service.Path)" -ForegroundColor Red
    }
}

# Start all services
foreach (`$service in `$services) {
    Start-Service -service `$service
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
Write-Host ""
Write-Host "💡 Use Ctrl+C to stop individual services" -ForegroundColor Gray
Write-Host "💡 Check logs in minimized PowerShell windows" -ForegroundColor Gray
"@
    
    try {
        $devStartScript | Out-File -FilePath "start-dev-environment.ps1" -Encoding UTF8
        Write-Host "  ✅ Development startup script: start-dev-environment.ps1" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to create dev script: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔥 Hot Reload Setup Complete!" -ForegroundColor Green
    Write-Host "📋 Created Files:" -ForegroundColor Yellow
    Write-Host "  • nodemon.json - Hot reload configuration" -ForegroundColor White
    Write-Host "  • start-dev-environment.ps1 - Development startup script" -ForegroundColor White
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
            project = "./tsconfig.json"
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
            "object-shorthand" = "error"
            "prefer-template" = "error"
        }
        ignorePatterns = @("dist/", "build/", "node_modules/", "*.config.js")
    }
    
    # Prettier configuration
    $prettierConfig = @{
        semi = $true
        trailingComma = "es5"
        singleQuote = $true
        printWidth = 100
        tabWidth = 2
        useTabs = $false
        bracketSpacing = $true
        arrowParens = "avoid"
        endOfLine = "lf"
    }
    
    # TypeScript configuration for strict checking
    $tsConfig = @{
        compilerOptions = @{
            target = "ES2020"
            lib = @("ES2020")
            module = "commonjs"
            moduleResolution = "node"
            declaration = $true
            outDir = "./dist"
            rootDir = "./src"
            strict = $true
            noImplicitAny = $true
            strictNullChecks = $true
            strictFunctionTypes = $true
            noImplicitReturns = $true
            noFallthroughCasesInSwitch = $true
            noUnusedLocals = $true
            noUnusedParameters = $true
            exactOptionalPropertyTypes = $true
            esModuleInterop = $true
            allowSyntheticDefaultImports = $true
            skipLibCheck = $true
            forceConsistentCasingInFileNames = $true
            resolveJsonModule = $true
        }
        include = @("src/**/*")
        exclude = @("node_modules", "dist", "**/*.test.ts", "**/*.spec.ts")
    }
    
    # Jest configuration for testing
    $jestConfig = @"
// Jest Configuration for CodAI Services
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.test.{js,ts}',
    '!src/**/*.spec.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 30000
};
"@
    
    # Quality check script
    $qualityScript = @"
#!/usr/bin/env pwsh

<#
.SYNOPSIS
    CodAI Services Quality Checks
.DESCRIPTION
    Runs comprehensive code quality checks including linting, formatting, type checking, and testing
#>

param(
    [switch]`$Fix = `$false,
    [switch]`$Coverage = `$false
)

Write-Host "🔍 CodAI Code Quality Checks" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

`$failureCount = 0

# Function to run quality check
function Invoke-QualityCheck {
    param(
        [string]`$Name,
        [string]`$Command,
        [string]`$Color = "White"
    )
    
    Write-Host "🔧 Running `$Name..." -ForegroundColor `$Color
    
    try {
        if (`$Fix -and `$Command.Contains("eslint")) {
            `$Command += " --fix"
        }
        if (`$Fix -and `$Command.Contains("prettier")) {
            `$Command = `$Command.Replace("--check", "--write")
        }
        
        Invoke-Expression `$Command
        if (`$LASTEXITCODE -eq 0) {
            Write-Host "  ✅ `$Name: PASSED" -ForegroundColor Green
        } else {
            Write-Host "  ❌ `$Name: FAILED" -ForegroundColor Red
            `$script:failureCount++
        }
    } catch {
        Write-Host "  ❌ `$Name: ERROR - `$(`$_.Exception.Message)" -ForegroundColor Red
        `$script:failureCount++
    }
    Write-Host ""
}

# Run quality checks
Invoke-QualityCheck -Name "ESLint (Code Linting)" -Command "npx eslint src --ext .ts,.js" -Color "Blue"
Invoke-QualityCheck -Name "Prettier (Code Formatting)" -Command "npx prettier --check src/**/*.{ts,js}" -Color "Magenta"
Invoke-QualityCheck -Name "TypeScript Compilation" -Command "npx tsc --noEmit" -Color "Green"

if (`$Coverage) {
    Invoke-QualityCheck -Name "Jest Tests with Coverage" -Command "npx jest --coverage" -Color "Yellow"
} else {
    Invoke-QualityCheck -Name "Jest Tests" -Command "npx jest --passWithNoTests" -Color "Yellow"
}

# Summary
Write-Host "📊 Quality Check Summary:" -ForegroundColor Cyan
if (`$failureCount -eq 0) {
    Write-Host "✅ All quality checks PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ `$failureCount quality check(s) FAILED" -ForegroundColor Red
    Write-Host "💡 Run with -Fix to automatically fix linting and formatting issues" -ForegroundColor Yellow
    exit 1
}
"@
    
    try {
        # Save configuration files
        $eslintConfig | ConvertTo-Json -Depth 5 | Out-File -FilePath ".eslintrc.json" -Encoding UTF8
        $prettierConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath ".prettierrc" -Encoding UTF8
        $tsConfig | ConvertTo-Json -Depth 4 | Out-File -FilePath "tsconfig.json" -Encoding UTF8
        $jestConfig | Out-File -FilePath "jest.config.js" -Encoding UTF8
        $qualityScript | Out-File -FilePath "quality-check.ps1" -Encoding UTF8
        
        Write-Host "  ✅ ESLint configuration: .eslintrc.json" -ForegroundColor Green
        Write-Host "  ✅ Prettier configuration: .prettierrc" -ForegroundColor Green
        Write-Host "  ✅ TypeScript configuration: tsconfig.json" -ForegroundColor Green
        Write-Host "  ✅ Jest configuration: jest.config.js" -ForegroundColor Green
        Write-Host "  ✅ Quality check script: quality-check.ps1" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Failed to create quality check files: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔍 Quality Checks Setup Complete!" -ForegroundColor Green
    Write-Host "📋 Usage Examples:" -ForegroundColor Yellow
    Write-Host "  pwsh quality-check.ps1              # Run all checks" -ForegroundColor Gray
    Write-Host "  pwsh quality-check.ps1 -Fix         # Run with auto-fix" -ForegroundColor Gray
    Write-Host "  pwsh quality-check.ps1 -Coverage    # Include test coverage" -ForegroundColor Gray
    Write-Host ""
}

function Setup-PreCommitHooks {
    Write-Host "🎣 Setting up pre-commit hooks..." -ForegroundColor Yellow
    Write-Host ""
    
    # Package.json scripts for husky and lint-staged
    $packageJsonScripts = @{
        scripts = @{
            "prepare" = "husky install"
            "lint" = "eslint src --ext .ts,.js"
            "lint:fix" = "eslint src --ext .ts,.js --fix"
            "format" = "prettier --write src/**/*.{ts,js,json,md}"
            "format:check" = "prettier --check src/**/*.{ts,js,json,md}"
            "type-check" = "tsc --noEmit"
            "test" = "jest"
            "test:coverage" = "jest --coverage"
            "quality" = "npm run lint && npm run format:check && npm run type-check && npm run test"
        }
        "lint-staged" = @{
            "*.{ts,js}" = @(
                "eslint --fix",
                "prettier --write"
            )
            "*.{json,md}" = @(
                "prettier --write"
            )
        }
        husky = @{
            hooks = @{
                "pre-commit" = "lint-staged"
                "commit-msg" = "commitlint -E HUSKY_GIT_PARAMS"
                "pre-push" = "npm run quality"
            }
        }
    }
    
    # Husky pre-commit hook
    $preCommitHook = @"
#!/usr/bin/env sh
. "`$(dirname -- "`$0")/_/husky.sh"

echo "🎣 Running pre-commit hooks..."

# Run lint-staged
npx lint-staged

# Type checking
echo "🔍 Type checking..."
npx tsc --noEmit

if [ `$? -ne 0 ]; then
  echo "❌ Type checking failed. Commit aborted."
  exit 1
fi

# Run tests
echo "🧪 Running tests..."
npx jest --passWithNoTests --silent

if [ `$? -ne 0 ]; then
  echo "❌ Tests failed. Commit aborted."
  exit 1
fi

echo "✅ All pre-commit checks passed!"
"@
    
    # Husky commit-msg hook
    $commitMsgHook = @"
#!/usr/bin/env sh
. "`$(dirname -- "`$0")/_/husky.sh"

echo "📝 Validating commit message..."

# Conventional Commits pattern
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "`$commit_regex" "`$1"; then
  echo "❌ Invalid commit message format!"
  echo ""
  echo "📋 Commit message must follow Conventional Commits format:"
  echo "   <type>[optional scope]: <description>"
  echo ""
  echo "🏷️ Valid types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
  echo ""
  echo "📝 Examples:"
  echo "   feat: add user authentication"
  echo "   fix(api): resolve database connection issue"
  echo "   docs: update API documentation"
  echo ""
  exit 1
fi

echo "✅ Commit message format is valid!"
"@
    
    # Husky pre-push hook
    $prePushHook = @"
#!/usr/bin/env sh
. "`$(dirname -- "`$0")/_/husky.sh"

echo "🚀 Running pre-push hooks..."

# Run full quality checks
echo "🔍 Running comprehensive quality checks..."
npm run quality

if [ `$? -ne 0 ]; then
  echo "❌ Quality checks failed. Push aborted."
  echo "💡 Run 'npm run quality' locally to see detailed errors"
  exit 1
fi

echo "✅ All pre-push checks passed!"
"@
    
    # Commitlint configuration
    $commitlintConfig = @{
        extends = @("@commitlint/config-conventional")
        rules = @{
            "type-enum" = @(2, "always", @(
                "build", "chore", "ci", "docs", "feat", "fix",
                "perf", "refactor", "revert", "style", "test"
            ))
            "subject-max-length" = @(2, "always", 50)
            "body-max-line-length" = @(2, "always", 100)
        }
    }
    
    try {
        # Create hook files
        New-Item -ItemType Directory -Path ".husky" -Force | Out-Null
        $preCommitHook | Out-File -FilePath ".husky/pre-commit" -Encoding UTF8 -NoNewline
        $commitMsgHook | Out-File -FilePath ".husky/commit-msg" -Encoding UTF8 -NoNewline
        $prePushHook | Out-File -FilePath ".husky/pre-push" -Encoding UTF8 -NoNewline
        
        # Create configuration files
        $commitlintConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath "commitlint.config.json" -Encoding UTF8
        
        # Create setup script
        $huskySetup = @"
#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Setup Husky Pre-commit Hooks for CodAI Services
#>

Write-Host "🎣 Setting up Husky pre-commit hooks..." -ForegroundColor Cyan

# Install husky and dependencies
Write-Host "📦 Installing husky and lint-staged..." -ForegroundColor Yellow
npm install --save-dev husky lint-staged @commitlint/config-conventional @commitlint/cli

# Initialize husky
Write-Host "🔧 Initializing husky..." -ForegroundColor Yellow
npx husky install

# Make hooks executable (Git Bash on Windows)
if (Get-Command "git" -ErrorAction SilentlyContinue) {
    git update-index --chmod=+x .husky/pre-commit
    git update-index --chmod=+x .husky/commit-msg
    git update-index --chmod=+x .husky/pre-push
}

Write-Host "✅ Husky hooks setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configured Hooks:" -ForegroundColor Yellow
Write-Host "  • pre-commit: lint-staged + type checking + tests" -ForegroundColor White
Write-Host "  • commit-msg: conventional commit format validation" -ForegroundColor White
Write-Host "  • pre-push: comprehensive quality checks" -ForegroundColor White
"@
        
        $huskySetup | Out-File -FilePath "setup-hooks.ps1" -Encoding UTF8
        
        Write-Host "  ✅ Husky hooks created in .husky/ directory" -ForegroundColor Green
        Write-Host "  ✅ Commitlint configuration: commitlint.config.json" -ForegroundColor Green
        Write-Host "  ✅ Husky setup script: setup-hooks.ps1" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Failed to create pre-commit hooks: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🎣 Pre-commit Hooks Setup Complete!" -ForegroundColor Green
    Write-Host "📋 To activate hooks, run:" -ForegroundColor Yellow
    Write-Host "  pwsh setup-hooks.ps1" -ForegroundColor Gray
    Write-Host ""
}

function Setup-ApiDocs {
    Write-Host "📚 Setting up API documentation generation..." -ForegroundColor Yellow
    Write-Host ""
    
    # Swagger configuration
    $swaggerConfig = @"
// Swagger/OpenAPI Configuration for CodAI Services
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'CodAI Essential Services API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for CodAI Essential Services',
      contact: {
        name: 'CodAI Development Team',
        email: 'dev@codai.ro'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:8100',
        description: 'Identity API Development Server'
      },
      {
        url: 'http://localhost:8010',
        description: 'API Gateway Development Server'
      },
      {
        url: 'http://localhost:8110',
        description: 'Hub API Development Server'
      },
      {
        url: 'http://localhost:8120',
        description: 'BancAI Service Development Server'
      },
      {
        url: 'http://localhost:8180',
        description: 'CBD Database Service Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/routes/*.ts',
    './src/controllers/*.js', 
    './src/controllers/*.ts',
    './src/server-mvp.js',
    './src/server-mvp.ts'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
"@
    
    # API documentation middleware
    $apiDocsMiddleware = @"
// API Documentation Middleware for CodAI Services
const { specs, swaggerUi } = require('./swagger-config');

/**
 * Setup API documentation for a Fastify server
 * @param {object} fastify - Fastify instance
 */
async function setupApiDocs(fastify) {
  // Register Swagger UI
  await fastify.register(require('@fastify/swagger'), {
    routePrefix: '/api-docs',
    swagger: specs,
    exposeRoute: true
  });
  
  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/api-docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      defaultModelRendering: 'model'
    }
  });
  
  // Add raw JSON endpoint
  fastify.get('/api-docs.json', async (request, reply) => {
    return specs;
  });
  
  fastify.log.info('API Documentation available at /api-docs');
}

module.exports = { setupApiDocs };
"@
    
    # Example API route with Swagger documentation
    $exampleApiRoute = @"
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "user_12345"
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       username:
 *                         type: string
 *                         example: "johndoe"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 100
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing authentication token"
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newuser@example.com"
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "newuser"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePassword123!"
 *               full_name:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_12346"
 *                     email:
 *                       type: string
 *                       example: "newuser@example.com"
 *                     username:
 *                       type: string
 *                       example: "newuser"
 *       400:
 *         description: Bad request (validation error)
 *       409:
 *         description: Conflict (user already exists)
 */
async function userRoutes(fastify) {
  // Route implementations here
  fastify.get('/api/v1/users', async (request, reply) => {
    // Implementation
  });
  
  fastify.post('/api/v1/users', async (request, reply) => {
    // Implementation  
  });
}

module.exports = userRoutes;
"@
    
    # Documentation generation script
    $docGenScript = @"
#!/usr/bin/env pwsh

<#
.SYNOPSIS
    API Documentation Generator for CodAI Services
.DESCRIPTION
    Generates comprehensive API documentation using Swagger/OpenAPI
#>

param(
    [switch]`$Build = `$false,
    [switch]`$Serve = `$false,
    [string]`$Output = "./docs"
)

Write-Host "📚 CodAI API Documentation Generator" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

`$services = @("identity-api", "api-gateway", "hub-api", "bancai-service", "cbd-database")

if (`$Build) {
    Write-Host "🔧 Building API documentation..." -ForegroundColor Yellow
    
    # Create output directory
    if (!(Test-Path `$Output)) {
        New-Item -ItemType Directory -Path `$Output -Force | Out-Null
    }
    
    foreach (`$service in `$services) {
        `$servicePath = "./services/`$service"
        if (Test-Path `$servicePath) {
            Write-Host "  📖 Generating docs for `$service..." -ForegroundColor White
            
            Set-Location `$servicePath
            
            # Generate OpenAPI spec
            try {
                node -e "
                  const { specs } = require('./swagger-config');
                  const fs = require('fs');
                  fs.writeFileSync('../../`$Output/`$service-api.json', JSON.stringify(specs, null, 2));
                  console.log('Generated `$service API specification');
                "
                
                Write-Host "    ✅ `$service documentation generated" -ForegroundColor Green
            } catch {
                Write-Host "    ⚠️ `$service documentation generation failed" -ForegroundColor Yellow
            }
            
            Set-Location "../.."
        }
    }
    
    # Generate combined documentation index
    `$indexHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>CodAI Services API Documentation</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 40px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; }
        .service { margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .service h3 { color: #1f2937; margin-top: 0; }
        .btn { display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px; }
        .btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 CodAI Essential Services</h1>
        <p>Comprehensive API Documentation</p>
        <p>Generated: `$(Get-Date)</p>
    </div>
    
    <div class="service">
        <h3>🔐 Identity API</h3>
        <p>Authentication, authorization, and user management</p>
        <a href="http://localhost:8100/api-docs" class="btn">Live Docs</a>
        <a href="./identity-api-api.json" class="btn">OpenAPI Spec</a>
    </div>
    
    <div class="service">
        <h3>🌐 API Gateway</h3>
        <p>Request routing, load balancing, and service discovery</p>
        <a href="http://localhost:8010/api-docs" class="btn">Live Docs</a>
        <a href="./api-gateway-api.json" class="btn">OpenAPI Spec</a>
    </div>
    
    <div class="service">
        <h3>🔗 Hub API</h3>
        <p>Service orchestration and inter-service communication</p>
        <a href="http://localhost:8110/api-docs" class="btn">Live Docs</a>
        <a href="./hub-api-api.json" class="btn">OpenAPI Spec</a>
    </div>
    
    <div class="service">
        <h3>💰 BancAI Service</h3>
        <p>Financial AI, fraud detection, and PCI DSS compliance</p>
        <a href="http://localhost:8120/api-docs" class="btn">Live Docs</a>
        <a href="./bancai-service-api.json" class="btn">OpenAPI Spec</a>
    </div>
    
    <div class="service">
        <h3>🗄️ CBD Database Service</h3>
        <p>Graph database operations and advanced analytics</p>
        <a href="http://localhost:8180/api-docs" class="btn">Live Docs</a>
        <a href="./cbd-database-api.json" class="btn">OpenAPI Spec</a>
    </div>
</body>
</html>
"@
    
    `$indexHtml | Out-File -FilePath "`$Output/index.html" -Encoding UTF8
    
    Write-Host ""
    Write-Host "✅ API documentation generated in `$Output/" -ForegroundColor Green
    Write-Host "🌐 Open `$Output/index.html to view documentation index" -ForegroundColor Yellow
}

if (`$Serve) {
    Write-Host "🌐 Starting documentation server..." -ForegroundColor Yellow
    Write-Host "📖 Documentation available at: http://localhost:3001" -ForegroundColor White
    Write-Host "⏹️ Press Ctrl+C to stop server" -ForegroundColor Gray
    
    # Simple HTTP server for documentation
    python -m http.server 3001 --directory `$Output
}

Write-Host ""
Write-Host "💡 Usage examples:" -ForegroundColor Yellow
Write-Host "  pwsh generate-api-docs.ps1 -Build       # Generate documentation" -ForegroundColor Gray
Write-Host "  pwsh generate-api-docs.ps1 -Serve       # Serve documentation" -ForegroundColor Gray
Write-Host "  pwsh generate-api-docs.ps1 -Build -Serve # Generate and serve" -ForegroundColor Gray
"@
    
    try {
        # Save all files
        $swaggerConfig | Out-File -FilePath "swagger-config.js" -Encoding UTF8
        $apiDocsMiddleware | Out-File -FilePath "api-docs-middleware.js" -Encoding UTF8
        $exampleApiRoute | Out-File -FilePath "example-api-route.js" -Encoding UTF8
        $docGenScript | Out-File -FilePath "generate-api-docs.ps1" -Encoding UTF8
        
        Write-Host "  ✅ Swagger configuration: swagger-config.js" -ForegroundColor Green
        Write-Host "  ✅ API docs middleware: api-docs-middleware.js" -ForegroundColor Green
        Write-Host "  ✅ Example API route: example-api-route.js" -ForegroundColor Green
        Write-Host "  ✅ Documentation generator: generate-api-docs.ps1" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Failed to create API documentation files: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "📚 API Documentation Setup Complete!" -ForegroundColor Green
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Install Swagger dependencies: npm install swagger-jsdoc swagger-ui-express @fastify/swagger @fastify/swagger-ui" -ForegroundColor Gray
    Write-Host "  2. Add API docs middleware to your services" -ForegroundColor Gray
    Write-Host "  3. Add Swagger comments to your routes" -ForegroundColor Gray
    Write-Host "  4. Generate documentation: pwsh generate-api-docs.ps1 -Build" -ForegroundColor Gray
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