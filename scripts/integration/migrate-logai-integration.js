#!/usr/bin/env node

/**
 * LogAI Integration Migration Script
 * 
 * This script systematically integrates LogAI SDK with API key management
 * across ALL CODAI apps in the ecosystem following the universal pattern.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const WORKSPACE_ROOT = path.join(__dirname, '..', '..')
const APPS_DIR = path.join(WORKSPACE_ROOT, 'apps')

// LogAI integration patterns
const INTEGRATION_PATTERNS = {
    nextjs: {
        files: [
            'app/layout.tsx',
            'pages/_app.tsx',
            'src/app/layout.tsx',
            'src/pages/_app.tsx'
        ],
        imports: `
import { useLogAI, setupGlobalErrorHandling, logPerformanceMetrics } from '@codai/logai-integration'
`,
        initialization: `
  // Initialize LogAI integration
  const { logEvent, logError, logUserAction } = useLogAI()
  
  useEffect(() => {
    // Setup global error handling and performance monitoring
    setupGlobalErrorHandling('{{SERVICE_NAME}}')
    logPerformanceMetrics('{{SERVICE_NAME}}')
    
    // Log app initialization
    logEvent('app_initialized', {
      service: '{{SERVICE_NAME}}',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString()
    })
  }, [])
`,
        dependencies: {
            '@codai/logai-sdk': '^1.0.0',
            '@codai/api-keys': '^1.0.0',
            '@codai/logai-integration': 'workspace:*'
        }
    },

    expo: {
        files: [
            'App.tsx',
            'app/_layout.tsx',
            'src/App.tsx'
        ],
        imports: `
import { useLogAI, setupGlobalErrorHandling } from '@codai/logai-integration'
`,
        initialization: `
  // Initialize LogAI integration for mobile
  const { logEvent, logError, logUserAction } = useLogAI()
  
  useEffect(() => {
    // Setup error handling for React Native
    setupGlobalErrorHandling('{{SERVICE_NAME}}')
    
    // Log mobile app initialization
    logEvent('mobile_app_initialized', {
      service: '{{SERVICE_NAME}}',
      platform: Platform.OS,
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString()
    })
  }, [])
`,
        dependencies: {
            '@codai/logai-sdk': '^1.0.0',
            '@codai/api-keys': '^1.0.0',
            '@codai/logai-integration': 'workspace:*'
        }
    },

    electron: {
        files: [
            'src/main.ts',
            'src/renderer/App.tsx',
            'main.ts',
            'renderer/App.tsx'
        ],
        imports: `
import { initializeLogger, logServerAction } from '@codai/logai-integration'
`,
        initialization: `
  // Initialize LogAI for Electron app
  await initializeLogger('{{SERVICE_NAME}}')
  
  // Log desktop app initialization
  await logServerAction('{{SERVICE_NAME}}', 'desktop_app_initialized', {
    platform: process.platform,
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString()
  })
`,
        dependencies: {
            '@codai/logai-sdk': '^1.0.0',
            '@codai/api-keys': '^1.0.0',
            '@codai/logai-integration': 'workspace:*'
        }
    },

    nodejs: {
        files: [
            'src/index.ts',
            'src/server.ts',
            'index.ts',
            'server.ts',
            'app.ts'
        ],
        imports: `
import { initializeLogger, logServerAction } from '@codai/logai-integration'
`,
        initialization: `
// Initialize LogAI for Node.js service
await initializeLogger('{{SERVICE_NAME}}')

// Log service startup
await logServerAction('{{SERVICE_NAME}}', 'service_started', {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  version: process.env.npm_package_version || '1.0.0',
  timestamp: new Date().toISOString()
})
`,
        dependencies: {
            '@codai/logai-sdk': '^1.0.0',
            '@codai/api-keys': '^1.0.0',
            '@codai/logai-integration': 'workspace:*'
        }
    }
}

async function detectAppType(appPath) {
    try {
        const packageJsonPath = path.join(appPath, 'package.json')
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))

        // Check dependencies to determine app type
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

        if (deps['next']) return 'nextjs'
        if (deps['expo']) return 'expo'
        if (deps['electron']) return 'electron'
        if (deps['express'] || deps['fastify'] || deps['@nestjs/core']) return 'nodejs'

        // Check for React Native
        if (deps['react-native']) return 'expo'

        // Default to Next.js if React is present
        if (deps['react']) return 'nextjs'

        return 'nodejs'
    } catch (error) {
        console.warn(`Failed to detect app type for ${appPath}:`, error.message)
        return 'nodejs'
    }
}

async function findIntegrationFile(appPath, appType) {
    const pattern = INTEGRATION_PATTERNS[appType]
    if (!pattern) return null

    for (const file of pattern.files) {
        const filePath = path.join(appPath, file)
        try {
            await fs.access(filePath)
            return filePath
        } catch {
            // File doesn't exist, try next
        }
    }

    return null
}

async function addLogAIIntegration(filePath, appType, serviceName) {
    try {
        const content = await fs.readFile(filePath, 'utf8')
        const pattern = INTEGRATION_PATTERNS[appType]

        // Check if already integrated
        if (content.includes('@codai/logai-integration')) {
            console.log(`  ✅ LogAI already integrated in ${path.basename(filePath)}`)
            return false
        }

        // Add imports
        const imports = pattern.imports.replace(/{{SERVICE_NAME}}/g, serviceName)
        let newContent = content

        // Find import section and add LogAI imports
        const importRegex = /import.*from.*['"][^'"]*['"];?\s*$/gm
        const lastImportMatch = [...content.matchAll(importRegex)].pop()

        if (lastImportMatch) {
            const insertPosition = lastImportMatch.index + lastImportMatch[0].length
            newContent = content.slice(0, insertPosition) + imports + content.slice(insertPosition)
        } else {
            // No imports found, add at the beginning
            newContent = imports + content
        }

        // Add initialization code
        const initialization = pattern.initialization.replace(/{{SERVICE_NAME}}/g, serviceName)

        // Find component/function body and add initialization
        if (appType === 'nextjs' || appType === 'expo') {
            // React component
            const componentRegex = /export\s+default\s+function\s+\w+\([^)]*\)\s*{/
            const match = newContent.match(componentRegex)
            if (match) {
                const insertPosition = match.index + match[0].length
                newContent = newContent.slice(0, insertPosition) + initialization + newContent.slice(insertPosition)
            }
        } else {
            // Node.js service
            const mainFunctionRegex = /(async\s+function\s+\w+|app\.listen|server\.listen)/
            const match = newContent.match(mainFunctionRegex)
            if (match) {
                const insertPosition = match.index
                newContent = newContent.slice(0, insertPosition) + initialization + '\n\n' + newContent.slice(insertPosition)
            }
        }

        await fs.writeFile(filePath, newContent, 'utf8')
        console.log(`  ✅ Added LogAI integration to ${path.basename(filePath)}`)
        return true

    } catch (error) {
        console.error(`  ❌ Failed to integrate LogAI in ${filePath}:`, error.message)
        return false
    }
}

async function updatePackageJson(appPath, appType) {
    try {
        const packageJsonPath = path.join(appPath, 'package.json')
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))

        const pattern = INTEGRATION_PATTERNS[appType]
        if (!pattern) return false

        // Add LogAI dependencies
        packageJson.dependencies = packageJson.dependencies || {}
        let updated = false

        for (const [dep, version] of Object.entries(pattern.dependencies)) {
            if (!packageJson.dependencies[dep]) {
                packageJson.dependencies[dep] = version
                updated = true
            }
        }

        if (updated) {
            await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8')
            console.log(`  ✅ Updated package.json with LogAI dependencies`)
            return true
        }

        return false
    } catch (error) {
        console.error(`  ❌ Failed to update package.json:`, error.message)
        return false
    }
}

async function migrateApp(appPath) {
    const serviceName = path.basename(appPath)
    console.log(`\n🔄 Migrating ${serviceName}...`)

    try {
        // Detect app type
        const appType = await detectAppType(appPath)
        console.log(`  📱 Detected app type: ${appType}`)

        // Find integration file
        const integrationFile = await findIntegrationFile(appPath, appType)
        if (!integrationFile) {
            console.log(`  ⚠️  No suitable integration file found`)
            return { success: false, reason: 'No integration file' }
        }

        // Update package.json
        const packageUpdated = await updatePackageJson(appPath, appType)

        // Add LogAI integration
        const codeUpdated = await addLogAIIntegration(integrationFile, appType, serviceName)

        if (packageUpdated || codeUpdated) {
            console.log(`  ✅ Successfully migrated ${serviceName}`)
            return { success: true, appType, integrationFile }
        } else {
            console.log(`  ℹ️  ${serviceName} already has LogAI integration`)
            return { success: true, reason: 'Already integrated' }
        }

    } catch (error) {
        console.error(`  ❌ Failed to migrate ${serviceName}:`, error.message)
        return { success: false, reason: error.message }
    }
}

async function createLogAIPackage() {
    const packagePath = path.join(WORKSPACE_ROOT, 'packages', 'logai-integration')

    try {
        await fs.mkdir(packagePath, { recursive: true })

        // Create package.json
        const packageJson = {
            name: '@codai/logai-integration',
            version: '1.0.0',
            description: 'Universal LogAI integration utilities for CODAI ecosystem',
            main: './dist/index.js',
            types: './dist/index.d.ts',
            files: ['dist'],
            scripts: {
                build: 'tsc',
                dev: 'tsc --watch',
                clean: 'rimraf dist'
            },
            dependencies: {
                '@codai/logai-sdk': 'workspace:*',
                '@codai/api-keys': 'workspace:*'
            },
            devDependencies: {
                'typescript': '^5.7.0',
                'rimraf': '^6.0.1'
            },
            peerDependencies: {
                'react': '^19.0.0'
            }
        }

        await fs.writeFile(
            path.join(packagePath, 'package.json'),
            JSON.stringify(packageJson, null, 2) + '\n'
        )

        // Create source directory
        await fs.mkdir(path.join(packagePath, 'src'), { recursive: true })

        // Copy the integration file from docs
        const sourcePath = path.join(WORKSPACE_ROOT, 'docs', 'guides', 'universal-logai-integration.ts')
        const destPath = path.join(packagePath, 'src', 'index.ts')

        await fs.copyFile(sourcePath, destPath)

        // Create TypeScript config
        const tsConfig = {
            compilerOptions: {
                target: 'ES2020',
                module: 'ESNext',
                moduleResolution: 'node',
                declaration: true,
                outDir: './dist',
                strict: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true
            },
            include: ['src/**/*'],
            exclude: ['dist', 'node_modules']
        }

        await fs.writeFile(
            path.join(packagePath, 'tsconfig.json'),
            JSON.stringify(tsConfig, null, 2) + '\n'
        )

        console.log('✅ Created @codai/logai-integration package')
        return true

    } catch (error) {
        console.error('❌ Failed to create LogAI integration package:', error.message)
        return false
    }
}

async function main() {
    console.log('🚀 Starting LogAI Integration Migration for CODAI Ecosystem')
    console.log('='.repeat(60))
    console.log('Current working directory:', process.cwd())
    console.log('Script location:', __dirname)
    console.log('Workspace root:', WORKSPACE_ROOT)
    console.log('Apps directory:', APPS_DIR)

    // Create LogAI integration package
    console.log('\n📦 Creating LogAI integration package...')
    await createLogAIPackage()

    // Get all apps
    let apps
    try {
        apps = await fs.readdir(APPS_DIR)
        console.log('Found apps:', apps)
    } catch (error) {
        console.error('Failed to read apps directory:', error.message)
        return
    }

    const results = {
        successful: [],
        failed: [],
        skipped: []
    }

    // Migrate each app
    for (const app of apps) {
        const appPath = path.join(APPS_DIR, app)
        let stat
        try {
            stat = await fs.stat(appPath)
        } catch (error) {
            console.log(`Skipping ${app}: ${error.message}`)
            continue
        }

        if (stat.isDirectory()) {
            const result = await migrateApp(appPath)

            if (result.success) {
                results.successful.push({ name: app, ...result })
            } else if (result.reason === 'Already integrated') {
                results.skipped.push({ name: app, ...result })
            } else {
                results.failed.push({ name: app, ...result })
            }
        }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 LOGAI INTEGRATION MIGRATION SUMMARY')
    console.log('='.repeat(60))

    console.log(`\n✅ Successfully migrated: ${results.successful.length} apps`)
    results.successful.forEach(app => {
        console.log(`  - ${app.name} (${app.appType})`)
    })

    console.log(`\nℹ️  Already integrated: ${results.skipped.length} apps`)
    results.skipped.forEach(app => {
        console.log(`  - ${app.name}`)
    })

    console.log(`\n❌ Failed migrations: ${results.failed.length} apps`)
    results.failed.forEach(app => {
        console.log(`  - ${app.name}: ${app.reason}`)
    })

    // Install dependencies
    if (results.successful.length > 0) {
        console.log('\n📥 Installing dependencies...')
        try {
            execSync('pnpm install', { cwd: WORKSPACE_ROOT, stdio: 'inherit' })
            console.log('✅ Dependencies installed successfully')
        } catch (error) {
            console.error('❌ Failed to install dependencies:', error.message)
        }
    }

    console.log(`\n🎉 LogAI integration migration completed!`)
    console.log(`Total apps processed: ${apps.length}`)
    console.log(`Success rate: ${Math.round((results.successful.length / apps.length) * 100)}%`)
}

// Always run main for now
console.log('Script starting...')
main().catch(console.error)

export { migrateApp, createLogAIPackage }
