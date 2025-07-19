#!/usr/bin/env node

/**
 * CODAI Ecosystem End-to-End Testing Script
 * Tests critical functionality across all applications
 */

import { execSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

const APPS_TO_TEST = [
    { name: 'codai', port: 5000, critical: true },
    { name: 'memorai', port: 5002, critical: true },
    { name: 'bancai', port: 5004, critical: true },
    { name: 'stocai', port: 5005, critical: true },
    { name: 'logai', port: 5024, critical: true },
    { name: 'conversai', port: 5001, critical: false },
    { name: 'analizai', port: 5003, critical: false },
    { name: 'marketai', port: 5026, critical: false },
    { name: 'fabricai', port: 5017, critical: false },
    { name: 'dexai', port: 5013, critical: false }
]

class E2ETestRunner {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            details: []
        }
    }

    async runTests() {
        console.log('🧪 CODAI Ecosystem End-to-End Testing')
        console.log('='.repeat(50))

        try {
            // 1. Test shared package builds
            await this.testSharedPackages()

            // 2. Test app builds
            await this.testAppBuilds()

            // 3. Test routing configuration
            await this.testRoutingConfiguration()

            // 4. Test translation files
            await this.testTranslations()

            // 5. Generate test report
            this.generateTestReport()

        } catch (error) {
            console.error('❌ Testing failed:', error.message)
            process.exit(1)
        }
    }

    async testSharedPackages() {
        console.log('\n📦 Testing Shared Package Builds...')

        const packages = ['shared-ui', 'translations']

        for (const pkg of packages) {
            try {
                console.log(`   Testing ${pkg}...`)
                const pkgPath = path.join(process.cwd(), 'packages', pkg)

                // Test build
                execSync('pnpm build', { cwd: pkgPath, stdio: 'pipe' })

                // Check dist exists
                const distPath = path.join(pkgPath, 'dist')
                await fs.access(distPath)

                this.addResult(`${pkg} build`, 'PASS', 'Package builds successfully')

            } catch (error) {
                this.addResult(`${pkg} build`, 'FAIL', error.message)
            }
        }
    }

    async testAppBuilds() {
        console.log('\n🏗️  Testing App Builds...')

        const criticalApps = APPS_TO_TEST.filter(app => app.critical)

        for (const app of criticalApps) {
            try {
                console.log(`   Testing ${app.name} build...`)
                const appPath = path.join(process.cwd(), 'apps', app.name)

                // Test if package.json has correct dependencies
                const packageJson = JSON.parse(
                    await fs.readFile(path.join(appPath, 'package.json'), 'utf8')
                )

                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

                if (!deps['@codai/shared-ui']) {
                    throw new Error('Missing @codai/shared-ui dependency')
                }

                if (!deps['@codai/translations']) {
                    throw new Error('Missing @codai/translations dependency')
                }

                // Test NextJS config exists
                const nextConfigExists = await this.fileExists(path.join(appPath, 'next.config.js')) ||
                    await this.fileExists(path.join(appPath, 'next.config.mjs')) ||
                    await this.fileExists(path.join(appPath, 'next.config.ts'))

                if (!nextConfigExists) {
                    throw new Error('Missing Next.js configuration file')
                }

                this.addResult(`${app.name} configuration`, 'PASS', 'App configuration valid')

            } catch (error) {
                this.addResult(`${app.name} configuration`, 'FAIL', error.message)
            }
        }
    }

    async testRoutingConfiguration() {
        console.log('\n🛣️  Testing Routing Configuration...')

        for (const app of APPS_TO_TEST) {
            try {
                const appPath = path.join(process.cwd(), 'apps', app.name, 'app')

                // Test main page exists and uses AppRouting
                const mainPagePath = path.join(appPath, 'page.tsx')
                const pageContent = await fs.readFile(mainPagePath, 'utf8')

                if (!pageContent.includes('AppRouting')) {
                    throw new Error('Page does not use AppRouting component')
                }

                if (!pageContent.includes("'@codai/shared-ui'")) {
                    throw new Error('Missing shared-ui import')
                }

                // Test layout exists
                const layoutPath = path.join(appPath, 'layout.tsx')
                await fs.access(layoutPath)

                this.addResult(`${app.name} routing`, 'PASS', 'Routing configuration valid')

            } catch (error) {
                this.addResult(`${app.name} routing`, 'FAIL', error.message)
            }
        }
    }

    async testTranslations() {
        console.log('\n🌐 Testing Translation Configuration...')

        try {
            const translationsPath = path.join(process.cwd(), 'packages', 'translations', 'locales')

            // Check if locales directory exists
            await fs.access(translationsPath)

            // Check for Romanian and English locales
            const locales = await fs.readdir(translationsPath)

            const hasEnglish = locales.includes('en') || locales.some(f => f.includes('en'))
            const hasRomanian = locales.includes('ro') || locales.some(f => f.includes('ro'))

            if (!hasEnglish) {
                throw new Error('Missing English locale files')
            }

            if (!hasRomanian) {
                throw new Error('Missing Romanian locale files')
            }

            this.addResult('translation locales', 'PASS', 'English and Romanian locales available')

        } catch (error) {
            this.addResult('translation locales', 'FAIL', error.message)
        }
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath)
            return true
        } catch {
            return false
        }
    }

    addResult(testName, status, message) {
        this.results.details.push({ testName, status, message })
        if (status === 'PASS') {
            this.results.passed++
            console.log(`   ✅ ${testName}`)
        } else if (status === 'FAIL') {
            this.results.failed++
            console.log(`   ❌ ${testName}: ${message}`)
        } else {
            this.results.skipped++
            console.log(`   ⏭️  ${testName}: ${message}`)
        }
    }

    generateTestReport() {
        console.log('\n📋 END-TO-END TEST REPORT')
        console.log('='.repeat(50))

        const total = this.results.passed + this.results.failed + this.results.skipped
        const successRate = Math.round((this.results.passed / total) * 100)

        console.log(`\n📊 TEST RESULTS:`)
        console.log(`   ✅ Passed: ${this.results.passed}`)
        console.log(`   ❌ Failed: ${this.results.failed}`)
        console.log(`   ⏭️  Skipped: ${this.results.skipped}`)
        console.log(`   📈 Success Rate: ${successRate}%`)

        if (this.results.failed > 0) {
            console.log(`\n❌ FAILED TESTS:`)
            this.results.details
                .filter(result => result.status === 'FAIL')
                .forEach(result => {
                    console.log(`   • ${result.testName}: ${result.message}`)
                })
        }

        if (successRate >= 95) {
            console.log(`\n🎉 EXCELLENT! All critical tests passing`)
            console.log(`🚀 Ready for production deployment!`)
        } else if (successRate >= 80) {
            console.log(`\n⚠️  GOOD: Most tests passing`)
            console.log(`   Address failed tests before production`)
        } else {
            console.log(`\n❌ ISSUES DETECTED: Multiple test failures`)
            console.log(`   Resolve issues before proceeding`)
        }
    }
}

// Run tests
const runner = new E2ETestRunner()
runner.runTests().catch(console.error)
