#!/usr/bin/env node

/**
 * CODAI Tailwind Config Generator
 * 
 * This script generates app-specific Tailwind configurations for all CODAI apps.
 * It ensures consistent design system usage while allowing app-specific customizations.
 */

import fs from 'fs/promises'
import path from 'path'
import { createCodaiTailwindConfig, brandColorPalettes } from '../tailwind-master.config.js'

// Map of app directories to their brand color names
const appBrandMap = {
    // Core apps
    'codai': 'codai',
    'memorai': 'memorai',
    'bancai': 'bancai',
    'stocai': 'stocai',
    'talentai': 'talentai',
    'prezentai': 'prezentai',

    // AI apps
    'aide': 'default',
    'ajutai': 'default',
    'analizai': 'default',
    'conversai': 'default',
    'fabricai': 'default',
    'legalizai': 'default',
    'logai': 'default',
    'marketai': 'default',
    'muzicai': 'prezentai', // Creative app
    'publicai': 'default',
    'romai': 'default',
    'sociai': 'default',
    'studiai': 'default',
    'sunai': 'default',

    // Utility apps
    'acasai': 'default',
    'admin': 'default',
    'cumparai': 'stocai', // E-commerce related
    'curtai': 'default',
    'dash': 'default',
    'dexai': 'default',
    'docs': 'default',
    'donai': 'default',
    'explorer': 'default',
    'glass': 'default',
    'hub': 'default',
    'id': 'default',
    'jucai': 'default',
    'kodex': 'codai', // Coding related
    'metu': 'default',
    'metu-web': 'default',
    'mobile': 'default',
    'mod': 'default',
    'tools': 'default',
    'wallet': 'bancai', // Finance related
    'x': 'default',

    // Mobile apps
    'bancai-mobile': 'bancai',
    'codai-mobile': 'codai',
}

/**
 * Generates a Tailwind config file for a specific app
 */
function generateAppTailwindConfig(appName: string): string {
    const brandName = appBrandMap[appName] || 'default'

    return `import { createCodaiTailwindConfig } from '@codai/shared-ui/tailwind-master.config'

/**
 * Tailwind CSS configuration for ${appName.toUpperCase()}
 * 
 * This configuration extends the CODAI master design system with ${appName}-specific branding.
 * Brand theme: ${brandName}
 * 
 * @see {@link https://tailwindcss.com/docs/configuration} for configuration options
 */

const config = createCodaiTailwindConfig('${brandName}', {
  // Add ${appName}-specific color overrides here if needed
  // Example:
  // 'custom-blue': '#1e40af',
  // 'custom-red': '#dc2626',
}, {
  // Add ${appName}-specific Tailwind extensions here
  // Example:
  // theme: {
  //   extend: {
  //     fontFamily: {
  //       'custom': ['Custom Font', 'sans-serif'],
  //     },
  //   },
  // },
})

export default config
`
}

/**
 * Generates a package.json entry for shared-ui Tailwind config
 */
function generatePackageJsonExport(): string {
    return `{
  "name": "@codai/shared-ui",
  "exports": {
    "./tailwind": "./tailwind-master.config.ts",
    "./tailwind/config": "./tailwind-master.config.ts",
    "./styles/design-system": "./styles/design-system.css",
    "./styles/globals": "./styles/globals.css"
  }
}`
}

/**
 * Main function to generate all configs
 */
async function generateAllConfigs() {
    const rootDir = process.cwd()
    const appsDir = path.join(rootDir, '../../apps')

    console.log('🎨 Generating Tailwind configurations for CODAI ecosystem...')

    try {
        // Read all app directories
        const apps = await fs.readdir(appsDir, { withFileTypes: true })
        const appDirs = apps.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)

        let generatedCount = 0
        let updatedCount = 0

        for (const appName of appDirs) {
            const appPath = path.join(appsDir, appName)
            const configPath = path.join(appPath, 'tailwind.config.ts')

            // Check if package.json exists (indicates it's a real app)
            try {
                await fs.access(path.join(appPath, 'package.json'))
            } catch {
                console.log(`⏭️  Skipping ${appName} (no package.json found)`)
                continue
            }

            // Generate the config content
            const configContent = generateAppTailwindConfig(appName)

            // Check if config already exists
            try {
                const existingContent = await fs.readFile(configPath, 'utf-8')
                if (existingContent.includes('createCodaiTailwindConfig')) {
                    console.log(`✅ ${appName}: Tailwind config already uses CODAI system`)
                    continue
                }

                // Backup existing config
                await fs.writeFile(configPath + '.backup', existingContent)
                await fs.writeFile(configPath, configContent)
                updatedCount++
                console.log(`🔄 ${appName}: Updated Tailwind config (backup created)`)
            } catch {
                // Create new config
                await fs.writeFile(configPath, configContent)
                generatedCount++
                console.log(`✨ ${appName}: Generated new Tailwind config`)
            }
        }

        console.log(`\\n🎉 Configuration generation complete!`)
        console.log(`📊 Stats:`)
        console.log(`  - ${generatedCount} new configs generated`)
        console.log(`  - ${updatedCount} existing configs updated`)
        console.log(`  - ${appDirs.length} total apps processed`)

        console.log(`\\n🔧 Next steps:`)
        console.log(`  1. Install dependencies: pnpm install`)
        console.log(`  2. Build shared-ui package: pnpm build --filter @codai/shared-ui`)
        console.log(`  3. Test app builds: pnpm build --filter <app-name>`)

    } catch (error) {
        console.error('❌ Error generating configs:', error)
        process.exit(1)
    }
}

// Run the generator if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateAllConfigs()
}

export { generateAllConfigs, generateAppTailwindConfig }
`
