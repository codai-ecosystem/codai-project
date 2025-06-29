#!/usr/bin/env node

import { readFile, writeFile, readdir } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('🔧 CODAI ECOSYSTEM: COMPREHENSIVE REACT DEPENDENCY FIX')
console.log('====================================================')

const STANDARD_REACT_VERSION = '^18.3.1'
const STANDARD_REACT_DOM_VERSION = '^18.3.1'
const STANDARD_REACT_TYPES_VERSION = '^18.3.23'
const STANDARD_NEXT_VERSION = '^15.1.0'

async function updatePackageJson(packagePath, serviceName) {
    try {
        const packageContent = await readFile(packagePath, 'utf-8')
        const pkg = JSON.parse(packageContent)

        let updated = false

        // Fix React dependencies
        if (pkg.dependencies) {
            if (pkg.dependencies.react && pkg.dependencies.react !== STANDARD_REACT_VERSION) {
                console.log(`  ✅ ${serviceName}: Updating React ${pkg.dependencies.react} → ${STANDARD_REACT_VERSION}`)
                pkg.dependencies.react = STANDARD_REACT_VERSION
                updated = true
            }

            if (pkg.dependencies['react-dom'] && pkg.dependencies['react-dom'] !== STANDARD_REACT_DOM_VERSION) {
                console.log(`  ✅ ${serviceName}: Updating React DOM ${pkg.dependencies['react-dom']} → ${STANDARD_REACT_DOM_VERSION}`)
                pkg.dependencies['react-dom'] = STANDARD_REACT_DOM_VERSION
                updated = true
            }

            if (pkg.dependencies.next && pkg.dependencies.next !== STANDARD_NEXT_VERSION) {
                console.log(`  ✅ ${serviceName}: Updating Next.js ${pkg.dependencies.next} → ${STANDARD_NEXT_VERSION}`)
                pkg.dependencies.next = STANDARD_NEXT_VERSION
                updated = true
            }

            if (pkg.dependencies['@types/react'] && pkg.dependencies['@types/react'] !== STANDARD_REACT_TYPES_VERSION) {
                console.log(`  ✅ ${serviceName}: Updating @types/react ${pkg.dependencies['@types/react']} → ${STANDARD_REACT_TYPES_VERSION}`)
                pkg.dependencies['@types/react'] = STANDARD_REACT_TYPES_VERSION
                updated = true
            }
        }

        // Fix devDependencies
        if (pkg.devDependencies) {
            if (pkg.devDependencies['@types/react'] && pkg.devDependencies['@types/react'] !== STANDARD_REACT_TYPES_VERSION) {
                console.log(`  ✅ ${serviceName}: Updating @types/react (dev) ${pkg.devDependencies['@types/react']} → ${STANDARD_REACT_TYPES_VERSION}`)
                pkg.devDependencies['@types/react'] = STANDARD_REACT_TYPES_VERSION
                updated = true
            }

            if (pkg.devDependencies['@types/react-dom']) {
                console.log(`  ✅ ${serviceName}: Updating @types/react-dom`)
                pkg.devDependencies['@types/react-dom'] = '^18.3.7'
                updated = true
            }
        }

        // Remove conflicting pnpm field from individual services
        if (pkg.pnpm && serviceName !== 'root') {
            console.log(`  ✅ ${serviceName}: Removing conflicting pnpm field`)
            delete pkg.pnpm
            updated = true
        }

        if (updated) {
            await writeFile(packagePath, JSON.stringify(pkg, null, 2) + '\n')
            console.log(`  ✅ ${serviceName}: package.json updated`)
        } else {
            console.log(`  ➡️ ${serviceName}: No changes needed`)
        }

        return updated
    } catch (error) {
        console.error(`  ❌ ${serviceName}: Error updating package.json:`, error.message)
        return false
    }
}

async function createRootPnpmConfig() {
    const pnpmConfig = {
        "auto-install-peers": true,
        "strict-peer-dependencies": false,
        "resolution-mode": "highest",
        "prefer-workspace-packages": true,
        "hoist-pattern": [
            "*"
        ],
        "public-hoist-pattern": [
            "*eslint*",
            "*prettier*",
            "*typescript*",
            "@types/*"
        ],
        "shamefully-hoist": true
    }

    try {
        await writeFile(join(projectRoot, '.pnpmrc'), Object.entries(pnpmConfig).map(([key, value]) => {
            if (Array.isArray(value)) {
                return value.map(v => `${key}=${v}`).join('\n')
            }
            return `${key}=${value}`
        }).join('\n') + '\n')

        console.log('✅ Created comprehensive .pnpmrc configuration')
    } catch (error) {
        console.error('❌ Error creating .pnpmrc:', error.message)
    }
}

async function updateRootPackageJson() {
    try {
        const rootPackagePath = join(projectRoot, 'package.json')
        const rootPackageContent = await readFile(rootPackagePath, 'utf-8')
        const rootPkg = JSON.parse(rootPackageContent)

        // Add pnpm configuration
        rootPkg.pnpm = {
            "overrides": {
                "react": STANDARD_REACT_VERSION,
                "react-dom": STANDARD_REACT_DOM_VERSION,
                "@types/react": STANDARD_REACT_TYPES_VERSION,
                "@types/react-dom": "^18.3.7"
            },
            "peerDependencyRules": {
                "allowedVersions": {
                    "react": "18",
                    "react-dom": "18"
                },
                "ignoreMissing": [
                    "react",
                    "react-dom"
                ]
            }
        }

        // Add React to root dependencies for consistent resolution
        if (!rootPkg.dependencies) {
            rootPkg.dependencies = {}
        }

        rootPkg.dependencies.react = STANDARD_REACT_VERSION
        rootPkg.dependencies['react-dom'] = STANDARD_REACT_DOM_VERSION

        if (!rootPkg.devDependencies) {
            rootPkg.devDependencies = {}
        }

        rootPkg.devDependencies['@types/react'] = STANDARD_REACT_TYPES_VERSION
        rootPkg.devDependencies['@types/react-dom'] = '^18.3.7'

        await writeFile(rootPackagePath, JSON.stringify(rootPkg, null, 2) + '\n')
        console.log('✅ Updated root package.json with React dependencies and pnpm overrides')

        return true
    } catch (error) {
        console.error('❌ Error updating root package.json:', error.message)
        return false
    }
}

async function processAllServices() {
    const serviceTypes = ['apps', 'services']
    let totalUpdated = 0

    for (const type of serviceTypes) {
        const typePath = join(projectRoot, type)

        try {
            const services = await readdir(typePath)
            console.log(`\n🔍 Processing ${type}:`)

            for (const service of services) {
                const servicePath = join(typePath, service)
                const packagePath = join(servicePath, 'package.json')

                try {
                    await readFile(packagePath, 'utf-8')
                    const wasUpdated = await updatePackageJson(packagePath, service)
                    if (wasUpdated) totalUpdated++
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.log(`  ⚠️ ${service}: Could not read package.json`)
                    }
                }
            }
        } catch (error) {
            console.log(`⚠️ Could not read ${type} directory`)
        }
    }

    return totalUpdated
}

async function main() {
    console.log('Starting comprehensive React dependency fix...\n')

    // Step 1: Update root configuration
    console.log('📦 Step 1: Updating root package.json and pnpm configuration')
    await updateRootPackageJson()
    await createRootPnpmConfig()

    // Step 2: Process all services
    console.log('\n📦 Step 2: Processing all service package.json files')
    const totalUpdated = await processAllServices()

    console.log('\n🎯 RESULTS SUMMARY:')
    console.log('==================')
    console.log(`✅ Services updated: ${totalUpdated}`)
    console.log('✅ Root configuration updated')
    console.log('✅ pnpm overrides configured')
    console.log('\n🚀 Next steps:')
    console.log('   1. Run: pnpm install --force')
    console.log('   2. Run: pnpm build')
    console.log('   3. Verify all services build successfully')

    console.log('\n🎖️ MISSION STATUS: DEPENDENCY RESOLUTION OPTIMIZED')
}

// Execute the fix
main().catch(console.error)
