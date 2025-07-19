#!/usr/bin/env tsx

import { promises as fs } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface TestResult {
    app: string
    status: 'success' | 'failed' | 'no-tests' | 'no-config'
    tests: number
    passed: number
    failed: number
    duration: string
    error?: string
}

// List of all applications
const ALL_APPS = [
    'acasai', 'admin', 'aide', 'ajutai', 'analizai', 'bancai', 'bancai-mobile',
    'codai', 'codai-mobile', 'conversai', 'cumparai', 'curtai', 'dash', 'dexai',
    'docs', 'donai', 'explorer', 'fabricai', 'glass', 'hub', 'id', 'jucai',
    'kodex', 'legalizai', 'logai', 'marketai', 'memorai', 'metu', 'metu-web',
    'mobile', 'mod', 'muzicai', 'prezentai', 'publicai', 'romai', 'sociai',
    'stocai', 'studiai', 'sunai', 'talentai', 'tools', 'wallet', 'x'
]

async function hasVitestConfig(appPath: string): Promise<boolean> {
    try {
        await fs.access(join(appPath, 'vitest.config.ts'))
        return true
    } catch {
        try {
            await fs.access(join(appPath, 'vitest.config.js'))
            return true
        } catch {
            return false
        }
    }
}

async function hasTestFiles(appPath: string): Promise<boolean> {
    try {
        // Check for test files in common locations
        const testDirs = ['__tests__', 'tests', 'src']
        for (const dir of testDirs) {
            try {
                const dirPath = join(appPath, dir)
                const files = await fs.readdir(dirPath, { recursive: true })
                const hasTestFiles = files.some(file =>
                    typeof file === 'string' &&
                    (file.includes('.test.') || file.includes('.spec.'))
                )
                if (hasTestFiles) return true
            } catch {
                // Directory doesn't exist, continue
            }
        }
        return false
    } catch {
        return false
    }
}

async function runTestsForApp(appName: string): Promise<TestResult> {
    const appPath = join(process.cwd(), 'apps', appName)

    try {
        // Check if app exists
        await fs.access(appPath)
    } catch {
        return {
            app: appName,
            status: 'no-config',
            tests: 0,
            passed: 0,
            failed: 0,
            duration: '0s',
            error: 'App directory not found'
        }
    }

    // Check if vitest config exists
    const hasConfig = await hasVitestConfig(appPath)
    if (!hasConfig) {
        return {
            app: appName,
            status: 'no-config',
            tests: 0,
            passed: 0,
            failed: 0,
            duration: '0s',
            error: 'No vitest config found'
        }
    }

    // Check if test files exist
    const hasTests = await hasTestFiles(appPath)
    if (!hasTests) {
        return {
            app: appName,
            status: 'no-tests',
            tests: 0,
            passed: 0,
            failed: 0,
            duration: '0s',
            error: 'No test files found'
        }
    }

    // Run tests
    try {
        console.log(`🧪 Testing ${appName}...`)
        const { stdout, stderr } = await execAsync(
            `cd "${appPath}" && npx vitest run`,
            { timeout: 60000 } // 60 second timeout
        )

        // Parse vitest output
        const output = stdout + stderr
        const testMatch = output.match(/Test Files\s+(\d+)\s+passed\s+\((\d+)\)/)
        const testsMatch = output.match(/Tests\s+(\d+)\s+passed\s+\((\d+)\)/)
        const durationMatch = output.match(/Duration\s+([\d.]+s)/)

        const passed = testsMatch ? parseInt(testsMatch[1]) : 0
        const total = testsMatch ? parseInt(testsMatch[2]) : 0
        const failed = total - passed

        return {
            app: appName,
            status: failed > 0 ? 'failed' : 'success',
            tests: total,
            passed,
            failed,
            duration: durationMatch ? durationMatch[1] : '0s'
        }
    } catch (error: any) {
        console.log(`  ❌ Failed: ${error.message}`)
        return {
            app: appName,
            status: 'failed',
            tests: 0,
            passed: 0,
            failed: 0,
            duration: '0s',
            error: error.message
        }
    }
}

function printSummary(results: TestResult[]) {
    console.log('\n📊 TEST SUMMARY')
    console.log('================')

    const successful = results.filter(r => r.status === 'success')
    const failed = results.filter(r => r.status === 'failed')
    const noTests = results.filter(r => r.status === 'no-tests')
    const noConfig = results.filter(r => r.status === 'no-config')

    console.log(`✅ Successful: ${successful.length}`)
    successful.forEach(r => {
        console.log(`   ${r.app}: ${r.passed}/${r.tests} tests in ${r.duration}`)
    })

    if (failed.length > 0) {
        console.log(`\n❌ Failed: ${failed.length}`)
        failed.forEach(r => {
            console.log(`   ${r.app}: ${r.error || 'Tests failed'}`)
        })
    }

    if (noTests.length > 0) {
        console.log(`\n⚠️  No tests: ${noTests.length}`)
        noTests.forEach(r => {
            console.log(`   ${r.app}: No test files found`)
        })
    }

    if (noConfig.length > 0) {
        console.log(`\n🔧 No config: ${noConfig.length}`)
        noConfig.forEach(r => {
            console.log(`   ${r.app}: No vitest configuration`)
        })
    }

    const totalTests = results.reduce((sum, r) => sum + r.tests, 0)
    const totalPassed = results.reduce((sum, r) => sum + r.passed, 0)
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)

    console.log(`\n📈 OVERALL STATS`)
    console.log(`================`)
    console.log(`Apps tested: ${results.length}`)
    console.log(`Total tests: ${totalTests}`)
    console.log(`Passed: ${totalPassed}`)
    console.log(`Failed: ${totalFailed}`)
    console.log(`Success rate: ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%`)
}

async function main() {
    console.log('🚀 Starting comprehensive test run for all applications...')
    console.log(`📊 Testing ${ALL_APPS.length} applications...\n`)

    const results: TestResult[] = []

    for (const appName of ALL_APPS) {
        const result = await runTestsForApp(appName)
        results.push(result)

        // Print immediate result
        switch (result.status) {
            case 'success':
                console.log(`  ✅ ${appName}: ${result.passed}/${result.tests} tests passed`)
                break
            case 'failed':
                console.log(`  ❌ ${appName}: ${result.error || 'Tests failed'}`)
                break
            case 'no-tests':
                console.log(`  ⚠️  ${appName}: No test files`)
                break
            case 'no-config':
                console.log(`  🔧 ${appName}: No vitest config`)
                break
        }
    }

    printSummary(results)

    // Generate fixes for apps without tests or configs
    const needsWork = results.filter(r => r.status === 'no-tests' || r.status === 'no-config')
    if (needsWork.length > 0) {
        console.log(`\n🔧 RECOMMENDED FIXES`)
        console.log(`====================`)
        console.log(`The following ${needsWork.length} apps need attention:`)
        needsWork.forEach(r => {
            if (r.status === 'no-config') {
                console.log(`   ${r.app}: Add vitest.config.ts`)
            } else {
                console.log(`   ${r.app}: Add test files`)
            }
        })
    }
}

// Run the script
main().catch(console.error)
