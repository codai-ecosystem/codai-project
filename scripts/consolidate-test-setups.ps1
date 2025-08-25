# Test Setup Files Consolidation Script
# This script consolidates duplicate test setup files across all apps
# Supports both Vitest and Jest setups with proper categorization

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("vitest", "jest", "both")]
    [string]$SetupType,
    
    [switch]$ShowDetails = $false,
    [switch]$WhatIf = $false
)

$ErrorActionPreference = "Stop"
$WorkspaceRoot = $PSScriptRoot | Split-Path -Parent
$TestingUtilsDir = Join-Path $WorkspaceRoot "packages\testing-utils"

# Color functions for output
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
function Write-Success($msg) { Write-ColorOutput Green $msg }
function Write-Info($msg) { Write-ColorOutput Cyan $msg }
function Write-Warning($msg) { Write-ColorOutput Yellow $msg }
function Write-Failure($msg) { Write-ColorOutput Red $msg }

# Track consolidation statistics
$script:Stats = @{
    VitestSetupsProcessed = 0
    VitestSetupsConsolidated = 0
    VitestLinesEliminated = 0
    JestSetupsProcessed = 0
    JestSetupsConsolidated = 0 
    JestLinesEliminated = 0
    PackagesUpdated = 0
    TotalFilesProcessed = 0
    ErrorCount = 0
}

# Base Vitest Setup Template
$BaseVitestSetup = @'
import '@testing-library/jest-dom'
import { vi, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Clean up after each test
afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

// Setup React testing environment
beforeAll(() => {
    // Ensure React is available globally
    global.React = React
})

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock ResizeObserver  
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Basic SVG support for testing
Object.defineProperty(window, 'SVGElement', {
    writable: true,
    value: class SVGElement extends Element {
        getBBox() {
            return { x: 0, y: 0, width: 100, height: 100, top: 0, right: 100, bottom: 100, left: 0 }
        }
    }
})

// Enhanced SVG support for createElementNS
const originalCreateElementNS = document.createElementNS
document.createElementNS = function (namespaceURI: string, qualifiedName: string) {
    const element = originalCreateElementNS.call(this, namespaceURI, qualifiedName)
    if (namespaceURI === 'http://www.w3.org/2000/svg' && element) {
        (element as any).getBBox = () => ({ x: 0, y: 0, width: 100, height: 100, top: 0, right: 100, bottom: 100, left: 0 })
    }
    return element
}

// Real localStorage implementation for testing
Object.defineProperty(window, 'localStorage', {
    value: {
        store: {} as Record<string, string>,
        getItem: function (key: string) {
            return this.store[key] || null
        },
        setItem: function (key: string, value: string) {
            this.store[key] = String(value)
        },
        removeItem: function (key: string) {
            delete this.store[key]
        },
        clear: function () {
            this.store = {}
        },
    },
    writable: true,
})

// Suppress console warnings in tests
const originalWarn = console.warn
console.warn = (...args) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
         args[0].includes('Warning: React.createElement'))
    ) {
        return
    }
    originalWarn.call(console, ...args)
}

export { vi }
'@

# Next.js Extensions Template  
$NextJSExtensions = @'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/router', () => ({
    useRouter: () => ({
        push: vi.fn(),
        pathname: '/',
        query: {},
        asPath: '/'
    })
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams()
}))

// Mock Next.js Image
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => {
        return React.createElement("img", { src, alt, ...props })
    },
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
    default: vi.fn(({ children }) => children)
}))
'@

# NextAuth Extensions Template
$NextAuthExtensions = @'
import { vi } from 'vitest'

// Create mock functions for NextAuth
const useSessionMock = vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: vi.fn()
}))

const signInMock = vi.fn()
const signOutMock = vi.fn()

// Mock NextAuth with function references
vi.mock('next-auth/react', () => ({
    useSession: useSessionMock,
    signIn: signInMock,
    signOut: signOutMock,
    SessionProvider: vi.fn(({ children }) => children),
    getSession: vi.fn(() => Promise.resolve(null)),
    getCsrfToken: vi.fn(() => Promise.resolve('test-csrf-token')),
    getProviders: vi.fn(() => Promise.resolve({}))
}))

// Mock session data
const mockSession = {
    user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
        roles: ['user'],
        permissions: []
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

// Export mock functions for use in tests
export { useSessionMock, signInMock, signOutMock, mockSession }
'@

# Crypto Extensions Template
$CryptoExtensions = @'
import { vi } from 'vitest'

// Comprehensive crypto mocking for test environment
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
        getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256)
            }
            return arr
        },
        createCipher: vi.fn(),
        createDecipher: vi.fn(),
        subtle: {
            digest: vi.fn(),
            encrypt: vi.fn(),
            decrypt: vi.fn(),
            generateKey: vi.fn(),
            importKey: vi.fn(),
            exportKey: vi.fn()
        }
    },
    writable: true,
    configurable: true
})

// Mock Node.js crypto module for imports
vi.mock('crypto', () => ({
    default: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
        randomBytes: vi.fn((size: number) => Buffer.alloc(size, 0)),
        createCipher: vi.fn(() => ({
            update: vi.fn(() => 'encrypted-data'),
            final: vi.fn(() => ''),
            setAutoPadding: vi.fn(),
            getAuthTag: vi.fn(() => Buffer.alloc(16, 0))
        })),
        createDecipher: vi.fn(() => ({
            update: vi.fn(() => 'decrypted-data'),
            final: vi.fn(() => ''),
            setAutoPadding: vi.fn(),
            setAuthTag: vi.fn()
        })),
        getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256)
            }
            return arr
        }
    },
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    randomBytes: vi.fn((size: number) => Buffer.alloc(size, 0))
}))

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock WebCrypto API  
Object.defineProperty(window, 'crypto', {
    value: global.crypto,
    writable: true,
    configurable: true
})
'@

# Lucide React Extensions Template
$LucideExtensions = @'
import { vi } from 'vitest'
import React from 'react'

// Mock Lucide React icons - comprehensive set
vi.mock('lucide-react', () => ({
    User: vi.fn(() => React.createElement('svg', { 'data-testid': 'user-icon' })),
    LogOut: vi.fn(() => React.createElement('svg', { 'data-testid': 'logout-icon' })),
    Settings: vi.fn(() => React.createElement('svg', { 'data-testid': 'settings-icon' })),
    Shield: vi.fn(() => React.createElement('svg', { 'data-testid': 'shield-icon' })),
    Key: vi.fn(() => React.createElement('svg', { 'data-testid': 'key-icon' })),
    Loader2: vi.fn(() => React.createElement('svg', { 'data-testid': 'loader2-icon' })),
    ChevronDown: vi.fn(() => React.createElement('svg', { 'data-testid': 'chevron-down-icon' })),
    Plus: vi.fn(() => React.createElement('svg', { 'data-testid': 'plus-icon' })),
    CheckCircle: vi.fn(() => React.createElement('svg', { 'data-testid': 'check-circle-icon' })),
    Mail: vi.fn(() => React.createElement('svg', { 'data-testid': 'mail-icon' })),
    Eye: vi.fn(() => React.createElement('svg', { 'data-testid': 'eye-icon' })),
    EyeOff: vi.fn(() => React.createElement('svg', { 'data-testid': 'eye-off-icon' })),
    Info: vi.fn(() => React.createElement('svg', { 'data-testid': 'info-icon' })),
    XCircle: vi.fn(() => React.createElement('svg', { 'data-testid': 'x-circle-icon' })),
    AlertCircle: vi.fn(() => React.createElement('svg', { 'data-testid': 'alert-circle-icon' })),
    AlertTriangle: vi.fn(() => React.createElement('svg', { 'data-testid': 'alert-triangle-icon' })),
    X: vi.fn(() => React.createElement('svg', { 'data-testid': 'x-icon' })),
    Check: vi.fn(() => React.createElement('svg', { 'data-testid': 'check-icon' }))
}))
'@

# Base Jest Setup Template
$BaseJestSetup = @'
import '@testing-library/jest-dom';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(), 
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(), 
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
'@

function Write-ConsolidationProgress {
    param($message, $current, $total)
    $percentage = [math]::Round(($current / $total) * 100, 1)
    Write-Info "[$percentage%] $message ($current/$total)"
}

function Create-SetupDirectories {
    Write-Info "🗂️ Creating test setup directories..."
    
    $setupsDir = Join-Path $TestingUtilsDir "setups"
    $vitestDir = Join-Path $setupsDir "vitest"
    $jestDir = Join-Path $setupsDir "jest"
    
    if (-not (Test-Path $setupsDir)) {
        New-Item -Path $setupsDir -ItemType Directory -Force | Out-Null
    }
    if (-not (Test-Path $vitestDir)) {
        New-Item -Path $vitestDir -ItemType Directory -Force | Out-Null
    }
    if (-not (Test-Path $jestDir)) {
        New-Item -Path $jestDir -ItemType Directory -Force | Out-Null
    }
    
    Write-Success "✅ Setup directories created successfully"
    return @{
        SetupsDir = $setupsDir
        VitestDir = $vitestDir
        JestDir = $jestDir
    }
}

function Create-VitestSetupFiles {
    param($vitestDir)
    
    Write-Info "📝 Creating Vitest setup files..."
    
    # Base setup file
    $baseSetupPath = Join-Path $vitestDir "base.setup.ts"
    if (-not $WhatIf) {
        $BaseVitestSetup | Out-File -FilePath $baseSetupPath -Encoding UTF8
    }
    
    # Extension files
    $extensions = @{
        "nextjs.setup.ts" = $NextJSExtensions
        "nextauth.setup.ts" = $NextAuthExtensions
        "crypto.setup.ts" = $CryptoExtensions
        "lucide.setup.ts" = $LucideExtensions
    }
    
    foreach ($extension in $extensions.GetEnumerator()) {
        $extensionPath = Join-Path $vitestDir $extension.Key
        if (-not $WhatIf) {
            $extension.Value | Out-File -FilePath $extensionPath -Encoding UTF8
        }
    }
    
    Write-Success "✅ Vitest setup files created successfully"
}

function Create-JestSetupFiles {
    param($jestDir)
    
    Write-Info "📝 Creating Jest setup files..."
    
    # Base Jest setup file
    $baseSetupPath = Join-Path $jestDir "base.setup.js"
    if (-not $WhatIf) {
        $BaseJestSetup | Out-File -FilePath $baseSetupPath -Encoding UTF8
    }
    
    Write-Success "✅ Jest setup files created successfully"
}

function Get-AppTestSetupMapping {
    $appMappings = @{
        # Apps needing NextAuth + Lucide + NextJS
        'memorai' = @('base', 'nextjs', 'nextauth', 'lucide')
        
        # Apps needing Crypto + NextJS  
        'bancai' = @('base', 'nextjs', 'crypto')
        
        # Apps needing only NextJS
        'studiai' = @('base', 'nextjs')
        'docs' = @('base', 'nextjs')
        'publicai' = @('base', 'nextjs')
        'ajutai' = @('base', 'nextjs')
        'analizai' = @('base', 'nextjs')
        'x' = @('base', 'nextjs')
        'talentai' = @('base', 'nextjs')
        'sunai' = @('base', 'nextjs')
        'wallet' = @('base', 'nextjs')
        'stocai' = @('base', 'nextjs')
        'legalizai' = @('base', 'nextjs')
        'jucai' = @('base', 'nextjs')
        'marketai' = @('base', 'nextjs')
        'sociai' = @('base', 'nextjs')
        'conversai' = @('base', 'nextjs')
        'glass' = @('base', 'nextjs')
        'acasai' = @('base', 'nextjs')
        'muzicai' = @('base', 'nextjs')
        'tools' = @('base', 'nextjs')
        'promovai' = @('base', 'nextjs')
        'metu-web' = @('base', 'nextjs')
        'mod' = @('base', 'nextjs')
        
        # RomAI - special case with timeout exports
        'romai' = @('base')
    }
    
    return $appMappings
}

function Process-VitestSetups {
    Write-Info "🔧 Processing Vitest setup files..."
    
    $appsDir = Join-Path $WorkspaceRoot "apps"
    $appMappings = Get-AppTestSetupMapping
    $processedApps = @()
    
    # Get all apps with vitest setup files
    $vitestSetupFiles = Get-ChildItem -Path $appsDir -Recurse -Filter "setup.ts" | Where-Object { $_.DirectoryName -match "tests$" }
    
    Write-Info "Found $($vitestSetupFiles.Count) Vitest setup files to process"
    
    $counter = 0
    foreach ($setupFile in $vitestSetupFiles) {
        $counter++
        $appName = Split-Path (Split-Path $setupFile.DirectoryName -Parent) -Leaf
        
        Write-ConsolidationProgress "Processing $appName" $counter $vitestSetupFiles.Count
        
        try {
            # Count original lines
            $originalContent = Get-Content $setupFile.FullName -Raw -ErrorAction SilentlyContinue
            $originalLines = if ($originalContent) { ($originalContent -split "`n").Count } else { 0 }
            
            # Determine which setup extensions this app needs
            $extensions = if ($appMappings.ContainsKey($appName)) { 
                $appMappings[$appName] 
            } else { 
                @('base', 'nextjs')  # Default fallback
            }
            
            # Generate new setup file content
            $newContent = Generate-VitestSetupContent -AppName $appName -Extensions $extensions
            
            if (-not $WhatIf) {
                # Backup original file
                $backupPath = $setupFile.FullName + ".backup"
                if (Test-Path $setupFile.FullName) {
                    Copy-Item $setupFile.FullName $backupPath -Force
                }
                
                # Write new content
                $newContent | Out-File -FilePath $setupFile.FullName -Encoding UTF8
                
                # Update package.json with testing-utils dependency if needed
                Update-PackageDependencies -AppPath (Split-Path $setupFile.DirectoryName -Parent) -AddTestingUtils
            }
            
            $processedApps += @{
                App = $appName
                OriginalLines = $originalLines
                NewLines = ($newContent -split "`n").Count
                Extensions = $extensions
                Path = $setupFile.FullName
            }
            
            $script:Stats.VitestSetupsProcessed++
            $script:Stats.VitestSetupsConsolidated++
            $script:Stats.VitestLinesEliminated += $originalLines
            
        } catch {
            Write-Failure "❌ Error processing $appName : $($_.Exception.Message)"
            $script:Stats.ErrorCount++
        }
    }
    
    return $processedApps
}

function Generate-VitestSetupContent {
    param($AppName, $Extensions)
    
    $imports = @()
    $imports += "// Generated Vitest setup for $AppName app"
    $imports += "// Consolidates common test setup patterns using @codai/testing-utils"
    $imports += ""
    
    # Add imports for each extension
    foreach ($extension in $Extensions) {
        switch ($extension) {
            'base' { $imports += "import '@codai/testing-utils/setups/vitest/base.setup'" }
            'nextjs' { $imports += "import '@codai/testing-utils/setups/vitest/nextjs.setup'" }
            'nextauth' { $imports += "import '@codai/testing-utils/setups/vitest/nextauth.setup'" }
            'crypto' { $imports += "import '@codai/testing-utils/setups/vitest/crypto.setup'" }
            'lucide' { $imports += "import '@codai/testing-utils/setups/vitest/lucide.setup'" }
        }
    }
    
    # Add app-specific customizations
    $imports += ""
    $imports += "// App-specific customizations"
    
    switch ($AppName) {
        'memorai' {
            $imports += "// MemorAI environment variables"
            $imports += "process.env.NEXTAUTH_URL = 'http://localhost:4006'"
            $imports += "process.env.NEXTAUTH_SECRET = 'test-secret'"
            $imports += "process.env.CODAI_CLIENT_ID = 'test-client-id'"
            $imports += "process.env.CODAI_CLIENT_SECRET = 'test-client-secret'"
            $imports += "process.env.CODAI_AUTH_URL = 'https://auth.codai.ro'"
            $imports += "process.env.CODAI_ID_URL = 'https://id.codai.ro'"
        }
        'romai' {
            $imports += "// Test timeout for slower operations"
            $imports += "export const TEST_TIMEOUT = 60000 // 60 seconds for real API calls"
        }
        'bancai' {
            $imports += "// BancAI-specific environment setup"
            $imports += "process.env.BANCAI_TEST_MODE = 'true'"
        }
    }
    
    return ($imports -join "`n")
}

function Process-JestSetups {
    Write-Info "🔧 Processing Jest setup files..."
    
    $appsDir = Join-Path $WorkspaceRoot "apps"
    $processedApps = @()
    
    # Get all apps with jest setup files
    $jestSetupFiles = Get-ChildItem -Path $appsDir -Recurse -Filter "jest.setup.*" | Where-Object { $_.Extension -in @('.js', '.ts') }
    
    Write-Info "Found $($jestSetupFiles.Count) Jest setup files to process"
    
    $counter = 0
    foreach ($setupFile in $jestSetupFiles) {
        $counter++
        $appName = Split-Path (Split-Path $setupFile.DirectoryName -Parent) -Leaf
        
        Write-ConsolidationProgress "Processing $appName Jest setup" $counter $jestSetupFiles.Count
        
        try {
            # Count original lines
            $originalContent = Get-Content $setupFile.FullName -Raw -ErrorAction SilentlyContinue
            $originalLines = if ($originalContent) { ($originalContent -split "`n").Count } else { 0 }
            
            # Generate new content
            $newContent = @(
                "// Generated Jest setup for $appName app",
                "// Uses consolidated setup from @codai/testing-utils",
                "",
                "require('@codai/testing-utils/setups/jest/base.setup');"
            ) -join "`n"
            
            if (-not $WhatIf) {
                # Backup original file
                $backupPath = $setupFile.FullName + ".backup"
                if (Test-Path $setupFile.FullName) {
                    Copy-Item $setupFile.FullName $backupPath -Force
                }
                
                # Write new content
                $newContent | Out-File -FilePath $setupFile.FullName -Encoding UTF8
                
                # Update package.json with testing-utils dependency if needed
                Update-PackageDependencies -AppPath (Split-Path $setupFile.DirectoryName -Parent) -AddTestingUtils
            }
            
            $processedApps += @{
                App = $appName
                OriginalLines = $originalLines
                NewLines = ($newContent -split "`n").Count
                Path = $setupFile.FullName
            }
            
            $script:Stats.JestSetupsProcessed++
            $script:Stats.JestSetupsConsolidated++
            $script:Stats.JestLinesEliminated += $originalLines
            
        } catch {
            Write-Failure "❌ Error processing $appName Jest setup: $($_.Exception.Message)"
            $script:Stats.ErrorCount++
        }
    }
    
    return $processedApps
}

function Update-PackageDependencies {
    param($AppPath, [switch]$AddTestingUtils)
    
    $packageJsonPath = Join-Path $AppPath "package.json"
    
    if (-not (Test-Path $packageJsonPath)) {
        Write-Warning "⚠️  No package.json found at $packageJsonPath"
        return
    }
    
    try {
        $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        $modified = $false
        
        if ($AddTestingUtils) {
            # Initialize devDependencies if it doesn't exist
            if (-not $packageJson.devDependencies) {
                $packageJson | Add-Member -MemberType NoteProperty -Name "devDependencies" -Value @{}
            }
            
            # Add @codai/testing-utils dependency if not present
            if (-not $packageJson.devDependencies.'@codai/testing-utils') {
                $packageJson.devDependencies.'@codai/testing-utils' = 'workspace:*'
                $modified = $true
                $script:Stats.PackagesUpdated++
                
                if ($ShowDetails) {
                    Write-Info "  Added @codai/testing-utils dependency"
                }
            }
        }
        
        if ($modified -and -not $WhatIf) {
            $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $packageJsonPath -Encoding UTF8
        }
        
    } catch {
        Write-Failure "❌ Error updating package.json at $AppPath : $($_.Exception.Message)"
        $script:Stats.ErrorCount++
    }
}

function Show-ConsolidationSummary {
    param($ProcessedVitestApps, $ProcessedJestApps)
    
    Write-Success "`n🎉 TEST SETUP CONSOLIDATION COMPLETE!"
    Write-Success "============================================="
    
    if ($SetupType -in @('vitest', 'both') -and $ProcessedVitestApps.Count -gt 0) {
        Write-Success "`n📊 VITEST SETUP CONSOLIDATION RESULTS:"
        Write-Success "--------------------------------------"
        Write-Success "✅ Apps processed: $($script:Stats.VitestSetupsProcessed)"
        Write-Success "✅ Setups consolidated: $($script:Stats.VitestSetupsConsolidated)"
        Write-Success "✅ Lines eliminated: $($script:Stats.VitestLinesEliminated)"
        
        if ($ShowDetails) {
            Write-Info "`n📋 Vitest Apps Details:"
            foreach ($app in $ProcessedVitestApps) {
                Write-Info "  • $($app.App): $($app.OriginalLines) lines → standardized import"
                Write-Info "    Extensions: $($app.Extensions -join ', ')"
            }
        }
    }
    
    if ($SetupType -in @('jest', 'both') -and $ProcessedJestApps.Count -gt 0) {
        Write-Success "`n📊 JEST SETUP CONSOLIDATION RESULTS:"
        Write-Success "------------------------------------"  
        Write-Success "✅ Apps processed: $($script:Stats.JestSetupsProcessed)"
        Write-Success "✅ Setups consolidated: $($script:Stats.JestSetupsConsolidated)"
        Write-Success "✅ Lines eliminated: $($script:Stats.JestLinesEliminated)"
        
        if ($ShowDetails) {
            Write-Info "`n📋 Jest Apps Details:"
            foreach ($app in $ProcessedJestApps) {
                Write-Info "  • $($app.App): $($app.OriginalLines) lines → standardized import"
            }
        }
    }
    
    Write-Success "`n📦 DEPENDENCY MANAGEMENT:"
    Write-Success "-------------------------"
    Write-Success "✅ Packages updated: $($script:Stats.PackagesUpdated)"
    
    $totalLinesEliminated = $script:Stats.VitestLinesEliminated + $script:Stats.JestLinesEliminated
    $totalSetupsConsolidated = $script:Stats.VitestSetupsConsolidated + $script:Stats.JestSetupsConsolidated
    
    Write-Success "`n🏆 TOTAL IMPACT:"
    Write-Success "==============="
    Write-Success "📈 Test setups consolidated: $totalSetupsConsolidated"
    Write-Success "📉 Lines of code eliminated: $totalLinesEliminated"
    Write-Success "⚠️  Errors encountered: $($script:Stats.ErrorCount)"
    
    if ($WhatIf) {
        Write-Warning "`n⚠️  This was a dry run (-WhatIf). No files were modified."
    } else {
        Write-Success "`n✨ All setup files have been consolidated successfully!"
        Write-Info "   Next steps:"
        Write-Info "   1. Run tests to verify everything works correctly"
        Write-Info "   2. Remove .backup files if tests pass"
        Write-Info "   3. Run 'pnpm install' to update dependencies"
    }
}

# Main execution
try {
    Write-Success "🚀 Starting Test Setup Consolidation"
    Write-Info "Setup Type: $SetupType"
    if ($WhatIf) { Write-Warning "DRY RUN MODE - No files will be modified" }
    
    # Create setup directories and files in testing-utils
    $directories = Create-SetupDirectories
    
    if ($SetupType -in @('vitest', 'both')) {
        Create-VitestSetupFiles -vitestDir $directories.VitestDir
    }
    
    if ($SetupType -in @('jest', 'both')) {
        Create-JestSetupFiles -jestDir $directories.JestDir
    }
    
    # Process existing setup files
    $processedVitest = @()
    $processedJest = @()
    
    if ($SetupType -in @('vitest', 'both')) {
        $processedVitest = Process-VitestSetups
    }
    
    if ($SetupType -in @('jest', 'both')) {
        $processedJest = Process-JestSetups
    }
    
    # Show final summary
    Show-ConsolidationSummary -ProcessedVitestApps $processedVitest -ProcessedJestApps $processedJest
    
} catch {
    Write-Failure "💥 CRITICAL ERROR: $($_.Exception.Message)"
    Write-Failure "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}