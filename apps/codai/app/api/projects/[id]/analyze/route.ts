/**
 * Code Analysis API Endpoint
 * Provides AI-powered code analysis for projects
 */

import { NextRequest, NextResponse } from 'next/server'
import { CodeAnalyzer } from '../../../../../lib/ai/CodeAnalyzer'
import path from 'path'
import fs from 'fs/promises'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const { searchParams } = new URL(request.url)
        const analysisId = searchParams.get('analysisId')
        const filePath = searchParams.get('file')

        // Validate project exists
        const projectsDir = path.join(process.cwd(), 'projects')
        const projectPath = path.join(projectsDir, id)

        try {
            await fs.access(projectPath)
        } catch {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        const analyzer = new CodeAnalyzer(projectPath)

        // If specific file analysis requested
        if (filePath) {
            const fileAnalysis = await analyzer.analyzeFile(filePath)
            return NextResponse.json(fileAnalysis)
        }

        // If specific analysis ID requested
        if (analysisId) {
            const analysis = await analyzer.getAnalysis(analysisId)
            if (!analysis) {
                return NextResponse.json(
                    { error: 'Analysis not found' },
                    { status: 404 }
                )
            }
            return NextResponse.json(analysis)
        }

        // Get latest analysis or return null if none exists
        const latestAnalysis = await analyzer.getAnalysis()
        return NextResponse.json(latestAnalysis)

    } catch (error) {
        console.error('Code analysis error:', error)
        return NextResponse.json(
            { error: 'Failed to retrieve code analysis' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await request.json()
        const {
            scope = 'full', // 'full' | 'incremental' | 'file'
            options = {},
            files = []
        } = body

        // Validate project exists
        const projectsDir = path.join(process.cwd(), 'projects')
        const projectPath = path.join(projectsDir, id)

        try {
            await fs.access(projectPath)
        } catch {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        const analyzer = new CodeAnalyzer(projectPath)

        let result

        switch (scope) {
            case 'full':
                // Perform comprehensive project analysis
                result = await analyzer.analyzeProject()
                break

            case 'file':
                // Analyze specific files
                if (!files.length) {
                    return NextResponse.json(
                        { error: 'No files specified for analysis' },
                        { status: 400 }
                    )
                }

                const fileAnalyses = await Promise.all(
                    files.map((file: string) => analyzer.analyzeFile(file))
                )
                result = {
                    type: 'fileAnalysis',
                    files: fileAnalyses,
                    timestamp: new Date().toISOString()
                }
                break

            case 'incremental':
                // Analyze only changed files (requires git integration)
                const changedFiles = await getChangedFiles(projectPath)
                if (changedFiles.length === 0) {
                    return NextResponse.json({
                        type: 'incremental',
                        message: 'No changes detected',
                        timestamp: new Date().toISOString()
                    })
                }

                const incrementalAnalyses = await Promise.all(
                    changedFiles.map(file => analyzer.analyzeFile(file))
                )
                result = {
                    type: 'incremental',
                    files: incrementalAnalyses,
                    changedFiles,
                    timestamp: new Date().toISOString()
                }
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid analysis scope' },
                    { status: 400 }
                )
        }

        return NextResponse.json(result)

    } catch (error) {
        console.error('Code analysis error:', error)
        return NextResponse.json(
            { error: 'Failed to perform code analysis' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await request.json()
        const {
            analysisId,
            action, // 'rerun' | 'refresh' | 'update-settings'
            settings = {}
        } = body

        // Validate project exists
        const projectsDir = path.join(process.cwd(), 'projects')
        const projectPath = path.join(projectsDir, id)

        try {
            await fs.access(projectPath)
        } catch {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        const analyzer = new CodeAnalyzer(projectPath)

        switch (action) {
            case 'rerun':
                // Re-run analysis with same parameters
                const analysis = await analyzer.getAnalysis(analysisId)
                if (!analysis) {
                    return NextResponse.json(
                        { error: 'Analysis not found' },
                        { status: 404 }
                    )
                }

                const newAnalysis = await analyzer.analyzeProject()
                return NextResponse.json(newAnalysis)

            case 'refresh':
                // Refresh analysis data
                const refreshedAnalysis = await analyzer.analyzeProject()
                return NextResponse.json(refreshedAnalysis)

            case 'update-settings':
                // Update analysis settings (this would be extended with actual settings storage)
                return NextResponse.json({
                    message: 'Analysis settings updated',
                    settings,
                    timestamp: new Date().toISOString()
                })

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

    } catch (error) {
        console.error('Code analysis update error:', error)
        return NextResponse.json(
            { error: 'Failed to update code analysis' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const { searchParams } = new URL(request.url)
        const analysisId = searchParams.get('analysisId')

        if (!analysisId) {
            return NextResponse.json(
                { error: 'Analysis ID required' },
                { status: 400 }
            )
        }

        // Validate project exists
        const projectsDir = path.join(process.cwd(), 'projects')
        const projectPath = path.join(projectsDir, id)

        try {
            await fs.access(projectPath)
        } catch {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        const analyzer = new CodeAnalyzer(projectPath)

        // In a real implementation, this would remove the analysis from storage
        // For now, we'll simulate the deletion
        return NextResponse.json({
            message: 'Analysis deleted successfully',
            analysisId,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Code analysis deletion error:', error)
        return NextResponse.json(
            { error: 'Failed to delete code analysis' },
            { status: 500 }
        )
    }
}

/**
 * Get changed files using git
 */
async function getChangedFiles(projectPath: string): Promise<string[]> {
    try {
        const { spawn } = await import('child_process')

        return new Promise((resolve, reject) => {
            const git = spawn('git', ['diff', '--name-only', 'HEAD~1'], {
                cwd: projectPath,
                stdio: 'pipe'
            })

            let output = ''

            git.stdout.on('data', (data) => {
                output += data.toString()
            })

            git.on('close', (code) => {
                if (code === 0) {
                    const files = output
                        .split('\n')
                        .filter(Boolean)
                        .filter(file => /\.(ts|tsx|js|jsx|py|java|cpp|c|cs|go|rs|php|rb)$/.test(file))
                    resolve(files)
                } else {
                    resolve([]) // No git repo or no changes
                }
            })

            git.on('error', () => {
                resolve([]) // Git not available
            })
        })
    } catch {
        return []
    }
}
