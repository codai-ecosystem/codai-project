#!/usr/bin/env node

/**
 * CODAI Ecosystem Production Validation Script
 * Validates the production readiness of all 44 apps
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const appsDir = path.join(rootDir, 'apps')

// Expected apps based on the production readiness plan
const EXPECTED_APPS = [
    'acasai', 'admin', 'aide', 'ajutai', 'analizai', 'bancai', 'bancai-mobile',
    'codai', 'codai-mobile', 'conversai', 'cumparai', 'curtai', 'dash', 'docs',
    'donai', 'explorer', 'fabricai', 'glass', 'hub', 'id', 'jucai', 'kodex',
    'legalizai', 'logai', 'marketai', 'memorai', 'metu', 'metu-web', 'mobile',
    'mod', 'muzicai', 'prezentai', 'publicai', 'romai', 'sociai', 'stocai',
    'studiai', 'sunai', 'talentai', 'tools', 'wallet', 'x'
]

const REQUIRED_ROUTES = ['/', '/home', '/dashboard']
const REQUIRED_FILES = ['page.tsx', 'layout.tsx', 'package.json']

class ProductionValidator {
    constructor() {
        this.results = {
            totalApps: 0,
            validatedApps: 0,
            errors: [],
            warnings: [],
            summary: {}
        }
    }

    async validateEcosystem() {
        console.log('🚀 CODAI Ecosystem Production Validation')
        console.log('='.repeat(50))

        try {
            // 1. Validate app directory structure
            await this.validateAppStructure()

            // 2. Validate shared packages
            await this.validateSharedPackages()

            // 3. Validate individual apps
            await this.validateIndividualApps()

            // 4. Validate routing implementation
            await this.validateRoutingImplementation()

            // 5. Generate final report
            this.generateReport()

        } catch (error) {
            console.error('❌ Validation failed:', error.message)
            process.exit(1)
        }
    }

    async validateAppStructure() {
        console.log('\n📁 Validating App Directory Structure...')

        const appDirs = await fs.readdir(appsDir)
        const actualApps = appDirs.filter(async (dir) => {
            const dirPath = path.join(appsDir, dir)
            const stat = await fs.stat(dirPath)
            return stat.isDirectory()
        })

        this.results.totalApps = actualApps.length
        console.log(`   Found ${actualApps.length} app directories`)

        // Check for missing expected apps
        const missingApps = EXPECTED_APPS.filter(app => !actualApps.includes(app))
        if (missingApps.length > 0) {
            this.results.warnings.push(`Missing expected apps: ${missingApps.join(', ')}`)
        }

        // Check for unexpected apps
        const unexpectedApps = actualApps.filter(app => !EXPECTED_APPS.includes(app))
        if (unexpectedApps.length > 0) {
            this.results.warnings.push(`Unexpected apps found: ${unexpectedApps.join(', ')}`)
        }

        console.log(`   ✅ App structure validation complete`)
    }

    async validateSharedPackages() {
        console.log('\n📦 Validating Shared Packages...')

        const packagesDir = path.join(rootDir, 'packages')
        const requiredPackages = ['shared-ui', 'translations']

        for (const pkg of requiredPackages) {
            const pkgPath = path.join(packagesDir, pkg)
            const pkgJsonPath = path.join(pkgPath, 'package.json')
            const distPath = path.join(pkgPath, 'dist')

            try {
                // Check package.json exists
                await fs.access(pkgJsonPath)

                // Check if built (dist directory exists)
                try {
                    await fs.access(distPath)
                    console.log(`   ✅ ${pkg}: Built and ready`)
                } catch {
                    this.results.warnings.push(`${pkg}: Not built (missing dist directory)`)
                }

            } catch {
                this.results.errors.push(`${pkg}: Missing package.json`)
            }
        }
    }

    async validateIndividualApps() {
        console.log('\n🎯 Validating Individual Apps...')

        const appDirs = await fs.readdir(appsDir)

        for (const appDir of appDirs) {
            const appPath = path.join(appsDir, appDir)
            const stat = await fs.stat(appPath).catch(() => null)

            if (!stat?.isDirectory()) continue

            try {
                await this.validateSingleApp(appDir, appPath)
                this.results.validatedApps++
            } catch (error) {
                this.results.errors.push(`${appDir}: ${error.message}`)
            }
        }
    }

    async validateSingleApp(appName, appPath) {
        const appDir = path.join(appPath, 'app')
        const packageJsonPath = path.join(appPath, 'package.json')

        // Check package.json
        await fs.access(packageJsonPath)
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))

        // Check for shared dependencies
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
        if (!deps['@codai/shared-ui']) {
            throw new Error('Missing @codai/shared-ui dependency')
        }
        if (!deps['@codai/translations']) {
            throw new Error('Missing @codai/translations dependency')
        }

        // Check app directory exists
        await fs.access(appDir)

        // Check main page.tsx exists and uses AppRouting
        const mainPagePath = path.join(appDir, 'page.tsx')
        await fs.access(mainPagePath)

        const pageContent = await fs.readFile(mainPagePath, 'utf8')
        if (!pageContent.includes('AppRouting')) {
            throw new Error('Main page.tsx does not use AppRouting component')
        }

        console.log(`   ✅ ${appName}: Validated`)
    }

    async validateRoutingImplementation() {
        console.log('\n🛣️  Validating Routing Implementation...')

        const routingStats = {
            rootPages: 0,
            homePages: 0,
            dashboardPages: 0,
            appsWithAppRouting: 0
        }

        const appDirs = await fs.readdir(appsDir)

        for (const appDir of appDirs) {
            const appPath = path.join(appsDir, appDir)
            const stat = await fs.stat(appPath).catch(() => null)

            if (!stat?.isDirectory()) continue

            const appRoutePath = path.join(appPath, 'app')

            try {
                // Check root page
                const rootPagePath = path.join(appRoutePath, 'page.tsx')
                const rootPageExists = await fs.access(rootPagePath).then(() => true).catch(() => false)
                if (rootPageExists) {
                    routingStats.rootPages++

                    // Check if uses AppRouting
                    const content = await fs.readFile(rootPagePath, 'utf8')
                    if (content.includes('AppRouting')) {
                        routingStats.appsWithAppRouting++
                    }
                }

                // Check home page
                const homePagePath = path.join(appRoutePath, 'home', 'page.tsx')
                const homePageExists = await fs.access(homePagePath).then(() => true).catch(() => false)
                if (homePageExists) {
                    routingStats.homePages++
                }

                // Check dashboard page
                const dashboardPagePath = path.join(appRoutePath, 'dashboard', 'page.tsx')
                const dashboardPageExists = await fs.access(dashboardPagePath).then(() => true).catch(() => false)
                if (dashboardPageExists) {
                    routingStats.dashboardPages++
                }

            } catch (error) {
                // Skip if app directory doesn't exist
            }
        }

        this.results.summary.routing = routingStats

        console.log(`   📊 Routing Statistics:`)
        console.log(`      Root pages: ${routingStats.rootPages}`)
        console.log(`      Apps with AppRouting: ${routingStats.appsWithAppRouting}`)
        console.log(`      Home pages: ${routingStats.homePages}`)
        console.log(`      Dashboard pages: ${routingStats.dashboardPages}`)
    }

    generateReport() {
        console.log('\n📋 PRODUCTION VALIDATION REPORT')
        console.log('='.repeat(50))

        console.log(`\n✅ APPS VALIDATED: ${this.results.validatedApps}/${this.results.totalApps}`)

        if (this.results.summary.routing) {
            const { routing } = this.results.summary
            console.log(`\n🛣️  ROUTING IMPLEMENTATION:`)
            console.log(`   • Apps with AppRouting: ${routing.appsWithAppRouting}`)
            console.log(`   • Home pages: ${routing.homePages}`)
            console.log(`   • Dashboard pages: ${routing.dashboardPages}`)

            const completionRate = Math.round((routing.appsWithAppRouting / this.results.totalApps) * 100)
            console.log(`   • Implementation rate: ${completionRate}%`)
        }

        if (this.results.warnings.length > 0) {
            console.log(`\n⚠️  WARNINGS (${this.results.warnings.length}):`)
            this.results.warnings.forEach(warning => {
                console.log(`   • ${warning}`)
            })
        }

        if (this.results.errors.length > 0) {
            console.log(`\n❌ ERRORS (${this.results.errors.length}):`)
            this.results.errors.forEach(error => {
                console.log(`   • ${error}`)
            })
        }

        const successRate = Math.round((this.results.validatedApps / this.results.totalApps) * 100)

        if (successRate >= 95 && this.results.errors.length === 0) {
            console.log(`\n🎉 PRODUCTION READY! Success rate: ${successRate}%`)
            console.log(`\n🚀 All systems go for production deployment!`)
        } else if (successRate >= 80) {
            console.log(`\n⚠️  MOSTLY READY: ${successRate}% success rate`)
            console.log(`   Address errors and warnings before production deployment`)
        } else {
            console.log(`\n❌ NOT PRODUCTION READY: ${successRate}% success rate`)
            console.log(`   Significant issues need to be resolved`)
        }
    }
}

// Run validation
const validator = new ProductionValidator()
validator.validateEcosystem().catch(console.error)
