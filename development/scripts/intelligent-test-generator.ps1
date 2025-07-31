#!/usr/bin/env pwsh
param(
    [string]$ComponentPath,
    [switch]$Analyze,
    [switch]$GenerateTests,
    [int]$Depth = 3
)

Write-Host "🧠 CODAI Intelligent Test Generator" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

function Analyze-ComponentStructure {
    param([string]$Path)
    
    $analysis = @{
        ComponentType = "unknown"
        MainExports = @()
        Dependencies = @()
        TestableFeatures = @()
        RequiredMocks = @()
        IntegrationPoints = @()
        BusinessLogic = @()
    }
    
    # Analyze package.json for type hints
    $packageJsonPath = Join-Path $Path "package.json"
    if (Test-Path $packageJsonPath) {
        try {
            $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
            
            # Determine component type from dependencies and scripts
            if ($packageJson.dependencies.express -or $packageJson.dependencies.fastify) {
                $analysis.ComponentType = "service"
            }
            elseif ($packageJson.dependencies.react -or $packageJson.dependencies.next) {
                $analysis.ComponentType = "frontend"
            }
            elseif ($packageJson.dependencies.commander -or $packageJson.bin) {
                $analysis.ComponentType = "cli"
            }
            elseif ($packageJson.name -match "mcp" -or $packageJson.description -match "mcp") {
                $analysis.ComponentType = "mcp"
            }
            else {
                $analysis.ComponentType = "sdk"
            }
            
            # Extract dependencies
            if ($packageJson.dependencies) {
                $analysis.Dependencies = $packageJson.dependencies | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
            }
        }
        catch {
            Write-Warning "Could not parse package.json: $_"
        }
    }
    
    # Analyze source code structure
    $srcPath = Join-Path $Path "src"
    if (Test-Path $srcPath) {
        $analysis = Analyze-SourceCode -Path $srcPath -Analysis $analysis
    }
    
    return $analysis
}

function Analyze-SourceCode {
    param(
        [string]$Path,
        [hashtable]$Analysis
    )
    
    # Find main entry point
    $indexFiles = @("index.ts", "index.js", "main.ts", "main.js", "cli.ts", "server.ts")
    foreach ($file in $indexFiles) {
        $filePath = Join-Path $Path $file
        if (Test-Path $filePath) {
            $content = Get-Content $filePath -Raw
            $Analysis = Parse-SourceFile -Content $content -Analysis $Analysis -FileName $file
            break
        }
    }
    
    # Analyze service classes
    $serviceFiles = Get-ChildItem $Path -Filter "*Service.ts" -Recurse
    foreach ($file in $serviceFiles) {
        $content = Get-Content $file.FullName -Raw
        $Analysis = Parse-ServiceClass -Content $content -Analysis $Analysis -FileName $file.Name
    }
    
    # Analyze API endpoints
    $apiFiles = Get-ChildItem $Path -Filter "*api*" -Recurse | Where-Object { $_.Extension -eq ".ts" }
    foreach ($file in $apiFiles) {
        $content = Get-Content $file.FullName -Raw
        $Analysis = Parse-APIEndpoints -Content $content -Analysis $Analysis -FileName $file.Name
    }
    
    return $Analysis
}

function Parse-SourceFile {
    param(
        [string]$Content,
        [hashtable]$Analysis,
        [string]$FileName
    )
    
    # Extract exports
    $exportMatches = [regex]::Matches($Content, "export\s+(?:class|function|const|interface)\s+(\w+)")
    foreach ($match in $exportMatches) {
        $Analysis.MainExports += $match.Groups[1].Value
    }
    
    # Extract imports to understand dependencies
    $importMatches = [regex]::Matches($Content, "import\s+.*?\s+from\s+['""]([^'""]+)['""]")
    foreach ($match in $importMatches) {
        $importPath = $match.Groups[1].Value
        if (-not $importPath.StartsWith(".")) {
            $Analysis.Dependencies += $importPath
        }
    }
    
    return $Analysis
}

function Parse-ServiceClass {
    param(
        [string]$Content,
        [hashtable]$Analysis,
        [string]$FileName
    )
    
    # Extract class methods
    $methodMatches = [regex]::Matches($Content, "(?:public|private|protected)?\s+(?:async\s+)?(\w+)\s*\([^)]*\)")
    foreach ($match in $methodMatches) {
        $methodName = $match.Groups[1].Value
        if ($methodName -notin @("constructor", "toString", "valueOf")) {
            $Analysis.TestableFeatures += "Service.$methodName"
        }
    }
    
    # Identify business logic patterns
    if ($Content -match "database|db|sql|query") {
        $Analysis.BusinessLogic += "DatabaseOperations"
        $Analysis.RequiredMocks += "DatabaseConnection"
    }
    
    if ($Content -match "cache|redis|memory") {
        $Analysis.BusinessLogic += "CacheOperations"
        $Analysis.RequiredMocks += "CacheService"
    }
    
    if ($Content -match "fetch|http|api|request") {
        $Analysis.BusinessLogic += "HTTPClient"
        $Analysis.RequiredMocks += "HTTPService"
    }
    
    if ($Content -match "email|smtp|mail") {
        $Analysis.BusinessLogic += "EmailService"
        $Analysis.RequiredMocks += "EmailProvider"
    }
    
    if ($Content -match "auth|jwt|token|session") {
        $Analysis.BusinessLogic += "Authentication"
        $Analysis.RequiredMocks += "AuthProvider"
    }
    
    return $Analysis
}

function Parse-APIEndpoints {
    param(
        [string]$Content,
        [hashtable]$Analysis,
        [string]$FileName
    )
    
    # Extract API routes
    $routeMatches = [regex]::Matches($Content, "(?:get|post|put|delete|patch)\s*\(\s*['""]([^'""]+)['""]")
    foreach ($match in $routeMatches) {
        $route = $match.Groups[1].Value
        $Analysis.IntegrationPoints += "API:$route"
    }
    
    return $Analysis
}

function Generate-ComponentSpecificTests {
    param(
        [hashtable]$Analysis,
        [string]$ComponentName,
        [string]$OutputPath
    )
    
    $testContent = Generate-TestHeader -ComponentName $ComponentName -Analysis $Analysis
    
    switch ($Analysis.ComponentType) {
        "service" {
            $testContent += Generate-ServiceTests -Analysis $Analysis
        }
        "frontend" {
            $testContent += Generate-FrontendTests -Analysis $Analysis
        }
        "cli" {
            $testContent += Generate-CLITests -Analysis $Analysis
        }
        "mcp" {
            $testContent += Generate-MCPTests -Analysis $Analysis
        }
        "sdk" {
            $testContent += Generate-SDKTests -Analysis $Analysis
        }
        default {
            $testContent += Generate-GenericTests -Analysis $Analysis
        }
    }
    
    $testContent += Generate-TestFooter -Analysis $Analysis
    
    return $testContent
}

function Generate-TestHeader {
    param(
        [string]$ComponentName,
        [hashtable]$Analysis
    )
    
    $imports = @()
    $imports += "import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';"
    
    if ($Analysis.RequiredMocks -contains "DatabaseConnection") {
        $imports += "import { vi } from 'vitest';"
    }
    
    if ($Analysis.ComponentType -eq "frontend") {
        $imports += "import { render, screen, fireEvent, waitFor } from '@testing-library/react';"
        $imports += "import '@testing-library/jest-dom';"
    }
    
    if ($Analysis.ComponentType -eq "service") {
        $imports += "import request from 'supertest';"
    }
    
    $imports += "import { $ComponentName } from '../src';"
    
    return ($imports -join "`n") + "`n`n"
}

function Generate-ServiceTests {
    param([hashtable]$Analysis)
    
    $tests = @"
describe('$($Analysis.ComponentType) - Core Service Tests', () => {
  let service: any;
  
  beforeEach(() => {
    // Setup service instance with test configuration
    service = new $($Analysis.MainExports[0])();
  });

  afterEach(() => {
    // Cleanup
    vi.clearAllMocks();
  });

"@

    # Generate tests for each business logic area
    foreach ($logic in $Analysis.BusinessLogic) {
        switch ($logic) {
            "DatabaseOperations" {
                $tests += @"

  describe('Database Operations', () => {
    it('should establish database connection', async () => {
      // Test database connectivity
      expect(service.connect).toBeDefined();
    });

    it('should handle database connection failures', async () => {
      // Test error handling for connection failures
    });

    it('should perform CRUD operations correctly', async () => {
      // Test create, read, update, delete operations
    });

    it('should handle concurrent database operations', async () => {
      // Test concurrent access patterns
    });

    it('should maintain data integrity during transactions', async () => {
      // Test transaction handling
    });
  });

"@
            }
            
            "CacheOperations" {
                $tests += @"

  describe('Cache Operations', () => {
    it('should cache frequently accessed data', async () => {
      // Test caching behavior
    });

    it('should invalidate expired cache entries', async () => {
      // Test cache expiration
    });

    it('should handle cache miss scenarios', async () => {
      // Test fallback when cache misses
    });
  });

"@
            }
            
            "Authentication" {
                $tests += @"

  describe('Authentication', () => {
    it('should validate JWT tokens correctly', async () => {
      // Test token validation
    });

    it('should handle expired tokens', async () => {
      // Test token expiration handling
    });

    it('should authenticate users with valid credentials', async () => {
      // Test authentication flow
    });

    it('should reject invalid credentials', async () => {
      // Test security validation
    });
  });

"@
            }
        }
    }

    # Generate tests for integration points
    foreach ($endpoint in $Analysis.IntegrationPoints) {
        if ($endpoint.StartsWith("API:")) {
            $route = $endpoint.Substring(4)
            $tests += @"

  describe('API Endpoint: $route', () => {
    it('should respond to valid requests', async () => {
      // Test endpoint functionality
    });

    it('should validate request parameters', async () => {
      // Test input validation
    });

    it('should handle authentication', async () => {
      // Test endpoint security
    });

    it('should return appropriate error codes', async () => {
      // Test error responses
    });
  });

"@
        }
    }

    $tests += "`n});"
    return $tests
}

function Generate-FrontendTests {
    param([hashtable]$Analysis)
    
    return @"
describe('$($Analysis.ComponentType) - Frontend Component Tests', () => {
  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      // Test basic rendering
    });

    it('should display expected content', () => {
      // Test content rendering
    });

    it('should handle props correctly', () => {
      // Test props handling
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', () => {
      // Test click handlers
    });

    it('should handle form submissions', () => {
      // Test form handling
    });

    it('should update state on user actions', () => {
      // Test state management
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      // Test ARIA compliance
    });

    it('should support keyboard navigation', () => {
      // Test keyboard accessibility
    });
  });

  describe('Performance', () => {
    it('should render within acceptable time limits', () => {
      // Test rendering performance
    });

    it('should not cause memory leaks', () => {
      // Test memory management
    });
  });
});
"@
}

function Generate-CLITests {
    param([hashtable]$Analysis)
    
    return @"
describe('$($Analysis.ComponentType) - CLI Tool Tests', () => {
  describe('Command Parsing', () => {
    it('should parse command line arguments correctly', () => {
      // Test argument parsing
    });

    it('should display help when requested', () => {
      // Test help system
    });

    it('should handle unknown commands gracefully', () => {
      // Test error handling
    });
  });

  describe('Command Execution', () => {
    it('should execute valid commands successfully', () => {
      // Test command execution
    });

    it('should return appropriate exit codes', () => {
      // Test exit code handling
    });

    it('should handle file system operations', () => {
      // Test file operations
    });
  });

  describe('Configuration', () => {
    it('should load configuration files correctly', () => {
      // Test config loading
    });

    it('should handle missing configuration gracefully', () => {
      // Test default configuration
    });

    it('should validate configuration values', () => {
      // Test config validation
    });
  });
});
"@
}

function Generate-MCPTests {
    param([hashtable]$Analysis)
    
    return @"
describe('$($Analysis.ComponentType) - MCP Server Tests', () => {
  describe('Protocol Compliance', () => {
    it('should implement required MCP methods', () => {
      // Test MCP protocol compliance
    });

    it('should handle tool registration correctly', () => {
      // Test tool definitions
    });

    it('should respond to tool calls appropriately', () => {
      // Test tool execution
    });
  });

  describe('Tool Execution', () => {
    it('should execute tools with valid parameters', () => {
      // Test tool functionality
    });

    it('should validate tool parameters', () => {
      // Test parameter validation
    });

    it('should handle tool execution errors', () => {
      // Test error handling
    });
  });

  describe('Resource Management', () => {
    it('should manage resources efficiently', () => {
      // Test resource handling
    });

    it('should handle concurrent tool calls', () => {
      // Test concurrency
    });

    it('should cleanup resources properly', () => {
      // Test cleanup
    });
  });
});
"@
}

function Generate-SDKTests {
    param([hashtable]$Analysis)
    
    return @"
describe('$($Analysis.ComponentType) - SDK Tests', () => {
  describe('API Surface', () => {
    it('should export all documented functions', () => {
      // Test public API
    });

    it('should maintain backward compatibility', () => {
      // Test API compatibility
    });

    it('should handle invalid inputs gracefully', () => {
      // Test input validation
    });
  });

  describe('Core Functionality', () => {
    it('should perform primary operations correctly', () => {
      // Test main functionality
    });

    it('should handle edge cases appropriately', () => {
      // Test edge cases
    });

    it('should integrate with dependencies correctly', () => {
      // Test integration
    });
  });

  describe('Performance', () => {
    it('should execute within performance bounds', () => {
      // Test performance
    });

    it('should handle large datasets efficiently', () => {
      // Test scalability
    });
  });
});
"@
}

function Generate-GenericTests {
    param([hashtable]$Analysis)
    
    return @"
describe('Component Tests', () => {
  it('should be properly initialized', () => {
    // Test initialization
  });

  it('should handle basic operations', () => {
    // Test core functionality
  });

  it('should handle errors gracefully', () => {
    // Test error handling
  });
});
"@
}

function Generate-TestFooter {
    param([hashtable]$Analysis)
    
    return "`n// TODO: Implement actual test logic based on component analysis"
}

# Main execution
if ($ComponentPath) {
    if ($Analyze) {
        Write-Host "🔍 Analyzing component structure..." -ForegroundColor Cyan
        $analysis = Analyze-ComponentStructure -Path $ComponentPath
        
        Write-Host "`n📊 Analysis Results:" -ForegroundColor Yellow
        Write-Host "Component Type: $($analysis.ComponentType)" -ForegroundColor White
        Write-Host "Main Exports: $($analysis.MainExports -join ', ')" -ForegroundColor White
        Write-Host "Dependencies: $($analysis.Dependencies -join ', ')" -ForegroundColor White
        Write-Host "Business Logic: $($analysis.BusinessLogic -join ', ')" -ForegroundColor White
        Write-Host "Integration Points: $($analysis.IntegrationPoints -join ', ')" -ForegroundColor White
        Write-Host "Required Mocks: $($analysis.RequiredMocks -join ', ')" -ForegroundColor White
    }
    
    if ($GenerateTests) {
        Write-Host "🧪 Generating component-specific tests..." -ForegroundColor Cyan
        $analysis = Analyze-ComponentStructure -Path $ComponentPath
        $componentName = Split-Path $ComponentPath -Leaf
        $testContent = Generate-ComponentSpecificTests -Analysis $analysis -ComponentName $componentName -OutputPath $ComponentPath
        
        $testDir = Join-Path $ComponentPath "tests\unit"
        if (-not (Test-Path $testDir)) {
            New-Item -ItemType Directory -Path $testDir -Force | Out-Null
        }
        
        $testFile = Join-Path $testDir "$componentName.test.ts"
        Set-Content -Path $testFile -Value $testContent -Encoding UTF8
        
        Write-Host "✅ Generated intelligent tests: $testFile" -ForegroundColor Green
    }
} else {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  ./intelligent-test-generator.ps1 -ComponentPath 'path/to/component' -Analyze" -ForegroundColor White
    Write-Host "  ./intelligent-test-generator.ps1 -ComponentPath 'path/to/component' -GenerateTests" -ForegroundColor White
}
