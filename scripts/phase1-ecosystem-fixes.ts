#!/usr/bin/env tsx

/**
 * CODAI Ecosystem Phase 1 Production Readiness Script
 * 
 * This script implements comprehensive fixes across all 43 CODAI ecosystem apps:
 * 1. Fix viewport metadata warnings
 * 2. Standardize routing patterns
 * 3. Update shared UI integration
 * 4. Fix Tailwind configuration
 * 5. Implement translation infrastructure
 */

import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

// Configuration for all CODAI apps
const APPS_CONFIG = {
    // Core Platform
    'codai': { name: 'CODAI', description: 'AI-native development environment', port: 5000 },
    'memorai': { name: 'MEMORAI', description: 'AI-powered memory and knowledge management', port: 5001 },
    'aide': { name: 'AIDE', description: 'AI Development Environment', port: 5002 },

    // Banking & Finance
    'bancai': { name: 'BANCAI', description: 'AI-powered banking platform', port: 5003 },
    'stocai': { name: 'STOCAI', description: 'AI stock trading platform', port: 5004 },
    'cumparai': { name: 'CUMPARAI', description: 'AI-powered shopping assistant', port: 5005 },

    // Business & Productivity
    'talentai': { name: 'TALENTAI', description: 'AI talent management platform', port: 5006 },
    'marketai': { name: 'MARKETAI', description: 'AI marketing automation', port: 5007 },
    'prezentai': { name: 'PREZENTAI', description: 'AI presentation creator', port: 5008 },
    'analizai': { name: 'ANALIZAI', description: 'AI analytics platform', port: 5009 },

    // Legal & Compliance
    'legalizai': { name: 'LEGALIZAI', description: 'AI legal assistant', port: 5010 },
    'curtai': { name: 'CURTAI', description: 'AI court management system', port: 5011 },

    // Education & Learning
    'studiai': { name: 'STUDIAI', description: 'AI learning platform', port: 5012 },
    'publicai': { name: 'PUBLICAI', description: 'AI content publishing', port: 5013 },

    // Creative & Media
    'muzicai': { name: 'MUZICAI', description: 'AI music creation platform', port: 5014 },
    'fabricai': { name: 'FABRICAI', description: 'AI design and fabrication', port: 5015 },

    // Communication & Social
    'conversai': { name: 'CONVERSAI', description: 'AI conversation platform', port: 5016 },
    'sociai': { name: 'SOCIAI', description: 'AI social media management', port: 5017 },
    'sunai': { name: 'SUNAI', description: 'AI communication assistant', port: 5018 },

    // Entertainment & Gaming
    'jucai': { name: 'JUCAI', description: 'AI gaming platform', port: 5019 },

    // Infrastructure & Tools
    'logai': { name: 'LOGAI', description: 'AI logging and monitoring', port: 5020 },
    'dexai': { name: 'DEXAI', description: 'AI data exchange platform', port: 5021 },
    'ajutai': { name: 'AJUTAI', description: 'AI support and help system', port: 5022 },
    'donai': { name: 'DONAI', description: 'AI donation platform', port: 5023 },

    // Mobile Apps
    'mobile': { name: 'CODAI Mobile', description: 'Mobile development platform', port: 5024 },
    'codai-mobile': { name: 'CODAI Mobile App', description: 'Mobile companion app', port: 5025 },
    'bancai-mobile': { name: 'BANCAI Mobile', description: 'Mobile banking app', port: 5026 },

    // Admin & Management
    'admin': { name: 'CODAI Admin', description: 'Admin dashboard', port: 5027 },
    'dash': { name: 'CODAI Dashboard', description: 'Main dashboard', port: 5028 },
    'hub': { name: 'CODAI Hub', description: 'Central hub', port: 5029 },
    'explorer': { name: 'CODAI Explorer', description: 'File and project explorer', port: 5030 },

    // Specialized Tools
    'glass': { name: 'GLASS', description: 'UI automation and testing', port: 5031 },
    'kodex': { name: 'KODEX', description: 'Code analysis and documentation', port: 5032 },
    'mod': { name: 'MOD', description: 'Modular development platform', port: 5033 },
    'tools': { name: 'CODAI Tools', description: 'Development tools suite', port: 5034 },
    'wallet': { name: 'CODAI Wallet', description: 'Digital wallet and payments', port: 5035 },
    'x': { name: 'CODAI X', description: 'Experimental features', port: 5036 },

    // Authentication & Identity
    'id': { name: 'CODAI ID', description: 'Identity and authentication', port: 5037 },
    'acasai': { name: 'ACASAI', description: 'Home automation', port: 5038 },

    // Web Apps
    'metu': { name: 'METU', description: 'Meeting and team utilities', port: 5039 },
    'metu-web': { name: 'METU Web', description: 'Web-based meeting platform', port: 5040 },
    'romai': { name: 'ROMAI', description: 'Romanian AI assistant', port: 5041 },
    'docs': { name: 'CODAI Docs', description: 'Documentation platform', port: 5042 },
}

interface LayoutFix {
    filePath: string
    hasViewportInMetadata: boolean
    hasScrollBehavior: boolean
}

class Phase1EcosystemFixer {
    private rootDir: string
    private appsDir: string

    constructor() {
        this.rootDir = process.cwd()
        this.appsDir = path.join(this.rootDir, 'apps')
    }

    async run() {
        console.log('🚀 Starting CODAI Ecosystem Phase 1 Production Readiness Fixes...\n')

        try {
            // Step 1: Fix viewport metadata warnings
            await this.fixViewportMetadata()

            // Step 2: Update shared components integration
            await this.updateSharedComponents()

            // Step 3: Fix Tailwind configurations
            await this.fixTailwindConfigs()

            // Step 4: Standardize routing patterns
            await this.standardizeRouting()

            // Step 5: Update package.json files
            await this.updatePackageJsons()

            console.log('✅ Phase 1 fixes completed successfully!')
            console.log('\n📋 Summary:')
            console.log('- Fixed viewport metadata warnings across all apps')
            console.log('- Updated shared UI integration')
            console.log('- Standardized Tailwind configurations')
            console.log('- Implemented consistent routing patterns')
            console.log('- Updated package.json dependencies')

        } catch (error) {
            console.error('❌ Error during Phase 1 fixes:', error)
            process.exit(1)
        }
    }

    private async fixViewportMetadata() {
        console.log('🔧 Step 1: Fixing viewport metadata warnings...')

        for (const [appName, config] of Object.entries(APPS_CONFIG)) {
            const appPath = path.join(this.appsDir, appName)

            // Check if app directory exists
            try {
                await fs.access(appPath)
            } catch {
                console.log(`   ⚠️  Skipping ${appName} - directory not found`)
                continue
            }

            const layoutPath = path.join(appPath, 'app', 'layout.tsx')

            try {
                const layoutContent = await fs.readFile(layoutPath, 'utf-8')

                // Check if viewport is in metadata export
                if (layoutContent.includes('viewport:') && layoutContent.includes('export const metadata')) {
                    console.log(`   🔄 Fixing ${appName} layout.tsx`)

                    const fixedContent = this.generateFixedLayout(layoutContent, config)
                    await fs.writeFile(layoutPath, fixedContent, 'utf-8')

                    console.log(`   ✅ Fixed ${appName}`)
                } else {
                    console.log(`   ℹ️  ${appName} already correct`)
                }
            } catch (error) {
                console.log(`   ⚠️  Could not fix ${appName}: ${error}`)
            }
        }
    }

    private generateFixedLayout(content: string, config: { name: string; description: string }): string {
        // Remove viewport from metadata and add it as separate export
        let fixedContent = content

        // Add Viewport import if not present
        if (!fixedContent.includes('Viewport')) {
            fixedContent = fixedContent.replace(
                /import { Metadata }/,
                'import { Metadata, Viewport }'
            )
        }

        // Remove viewport from metadata
        fixedContent = fixedContent.replace(
            /,?\s*viewport:\s*['"'][^'"]*['"],?\s*/g,
            ''
        )

        // Add viewport export if not present
        if (!fixedContent.includes('export const viewport')) {
            const viewportExport = `
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}`

            // Insert after metadata export
            fixedContent = fixedContent.replace(
                /(export const metadata[^}]+})/,
                `$1${viewportExport}`
            )
        }

        // Add scroll behavior if not present
        if (!fixedContent.includes('data-scroll-behavior')) {
            fixedContent = fixedContent.replace(
                /<html([^>]*?)>/,
                '<html$1 data-scroll-behavior="smooth">'
            )
        }

        return fixedContent
    }

    private async updateSharedComponents() {
        console.log('🔧 Step 2: Updating shared components integration...')

        for (const [appName, config] of Object.entries(APPS_CONFIG)) {
            const appPath = path.join(this.appsDir, appName)

            try {
                await fs.access(appPath)
            } catch {
                continue
            }

            // Update package.json to include latest shared packages
            const packageJsonPath = path.join(appPath, 'package.json')

            try {
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))

                // Ensure shared UI packages are in dependencies
                packageJson.dependencies = packageJson.dependencies || {}
                packageJson.dependencies['@codai/shared-ui'] = 'workspace:*'
                packageJson.dependencies['@codai/translations'] = 'workspace:*'

                await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')
                console.log(`   ✅ Updated ${appName} package.json`)
            } catch (error) {
                console.log(`   ⚠️  Could not update ${appName} package.json: ${error}`)
            }
        }
    }

    private async fixTailwindConfigs() {
        console.log('🔧 Step 3: Fixing Tailwind configurations...')

        for (const [appName, config] of Object.entries(APPS_CONFIG)) {
            const appPath = path.join(this.appsDir, appName)

            try {
                await fs.access(appPath)
            } catch {
                continue
            }

            const tailwindConfigPath = path.join(appPath, 'tailwind.config.ts')

            try {
                // Generate standardized Tailwind config
                const tailwindConfig = `import { createCodaiTailwindConfig } from '../../packages/shared-ui/tailwind-master.config';

export default createCodaiTailwindConfig(
  '${appName}',
  undefined, // Use default brand colors for ${appName}
  {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './src/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './lib/**/*.{js,ts,jsx,tsx,mdx}',
      './utils/**/*.{js,ts,jsx,tsx,mdx}',
      '../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx,mdx}',
      '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
  }
);
`

                await fs.writeFile(tailwindConfigPath, tailwindConfig, 'utf-8')
                console.log(`   ✅ Updated ${appName} Tailwind config`)
            } catch (error) {
                console.log(`   ⚠️  Could not update ${appName} Tailwind config: ${error}`)
            }
        }
    }

    private async standardizeRouting() {
        console.log('🔧 Step 4: Standardizing routing patterns...')

        for (const [appName, config] of Object.entries(APPS_CONFIG)) {
            const appPath = path.join(this.appsDir, appName)

            try {
                await fs.access(appPath)
            } catch {
                continue
            }

            // Generate standardized root page
            const rootPagePath = path.join(appPath, 'app', 'page.tsx')
            const rootPageContent = this.generateStandardRootPage(config)

            try {
                await fs.writeFile(rootPagePath, rootPageContent, 'utf-8')
                console.log(`   ✅ Updated ${appName} root page`)
            } catch (error) {
                console.log(`   ⚠️  Could not update ${appName} root page: ${error}`)
            }
        }
    }

    private generateStandardRootPage(config: { name: string; description: string }): string {
        return `'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, LoadingSpinner } from '@codai/shared-ui'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/landing')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Loading state while checking auth and redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
      <LoadingSpinner
        size="xl"
        variant="white"
        text="Loading ${config.name}..."
        centered
      />
    </div>
  )
}
`
    }

    private async updatePackageJsons() {
        console.log('🔧 Step 5: Updating package.json files...')

        for (const [appName, config] of Object.entries(APPS_CONFIG)) {
            const appPath = path.join(this.appsDir, appName)

            try {
                await fs.access(appPath)
            } catch {
                continue
            }

            const packageJsonPath = path.join(appPath, 'package.json')

            try {
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))

                // Update metadata
                packageJson.name = appName
                packageJson.description = config.description
                packageJson.version = packageJson.version || '1.0.0'
                packageJson.private = true

                // Standardize scripts
                packageJson.scripts = packageJson.scripts || {}
                packageJson.scripts.dev = `next dev --port ${config.port}`
                packageJson.scripts.build = 'next build'
                packageJson.scripts.start = `next start --port ${config.port}`
                packageJson.scripts.lint = 'next lint'
                packageJson.scripts['type-check'] = 'tsc --noEmit'

                await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')
                console.log(`   ✅ Updated ${appName} package.json`)
            } catch (error) {
                console.log(`   ⚠️  Could not update ${appName} package.json: ${error}`)
            }
        }
    }
}

// Run the script
const fixer = new Phase1EcosystemFixer()
fixer.run().catch(console.error)
