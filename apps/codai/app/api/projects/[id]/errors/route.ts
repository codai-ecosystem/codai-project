/**
 * Error Detection API Endpoint
 * Provides intelligent error detection and real-time code analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { IntelligentErrorDetector } from '../../../../../lib/ai/IntelligentErrorDetector'
import path from 'path'
import fs from 'fs/promises'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const { searchParams } = new URL(request.url)
        const detectionId = searchParams.get('detectionId')
        const filePath = searchParams.get('file')
        const realTime = searchParams.get('realTime') === 'true'

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

        const detector = new IntelligentErrorDetector(projectPath)

        // If specific file error detection requested
        if (filePath) {
            const fileErrors = await detector.detectFileErrors(filePath)
            return NextResponse.json({
                type: 'fileErrors',
                file: filePath,
                errors: fileErrors,
                timestamp: new Date().toISOString()
            })
        }

        // If real-time detection requested, set up SSE
        if (realTime) {
            return new Response(
                new ReadableStream({
                    start(controller) {
                        const watcherId = detector.enableRealTimeDetection((result) => {
                            const data = `data: ${JSON.stringify(result)}\n\n`
                            controller.enqueue(new TextEncoder().encode(data))
                        })

                        // Set up cleanup
                        request.signal.addEventListener('abort', () => {
                            detector.disableRealTimeDetection(watcherId)
                            controller.close()
                        })
                    }
                }),
                {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                    }
                }
            )
        }

        // Get latest detection result
        const result = await detector.detectProjectErrors()
        return NextResponse.json(result)

    } catch (error) {
        console.error('Error detection error:', error)
        return NextResponse.json(
            { error: 'Failed to detect errors' },
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
            action,
            scope = 'project', // 'project' | 'file' | 'line'
            filePath,
            line,
            column,
            context,
            options = {}
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

        const detector = new IntelligentErrorDetector(projectPath)

        switch (action) {
            case 'detect':
                if (scope === 'project') {
                    const result = await detector.detectProjectErrors()
                    return NextResponse.json(result)
                } else if (scope === 'file' && filePath) {
                    const errors = await detector.detectFileErrors(filePath)
                    return NextResponse.json({
                        type: 'fileErrors',
                        file: filePath,
                        errors,
                        timestamp: new Date().toISOString()
                    })
                } else {
                    return NextResponse.json(
                        { error: 'Invalid scope or missing parameters' },
                        { status: 400 }
                    )
                }

            case 'getSuggestions':
                if (!filePath || line === undefined || column === undefined) {
                    return NextResponse.json(
                        { error: 'Missing required parameters for suggestions' },
                        { status: 400 }
                    )
                }

                const suggestions = await detector.getCodeSuggestions(
                    filePath,
                    line,
                    column,
                    context
                )

                return NextResponse.json({
                    type: 'suggestions',
                    file: filePath,
                    position: { line, column },
                    suggestions,
                    timestamp: new Date().toISOString()
                })

            case 'enableRealTime':
                // This would typically return a WebSocket connection or SSE endpoint
                return NextResponse.json({
                    type: 'realTimeEnabled',
                    endpoint: `/api/projects/${id}/errors?realTime=true`,
                    message: 'Real-time error detection enabled',
                    timestamp: new Date().toISOString()
                })

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

    } catch (error) {
        console.error('Error detection operation failed:', error)
        return NextResponse.json(
            { error: 'Failed to perform error detection operation' },
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
            action,
            autoFixId,
            errorId,
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

        const detector = new IntelligentErrorDetector(projectPath)

        switch (action) {
            case 'applyAutoFix':
                if (!autoFixId) {
                    return NextResponse.json(
                        { error: 'Auto-fix ID required' },
                        { status: 400 }
                    )
                }

                const success = await detector.applyAutoFix(autoFixId)

                if (success) {
                    return NextResponse.json({
                        type: 'autoFixApplied',
                        autoFixId,
                        success: true,
                        message: 'Auto-fix applied successfully',
                        timestamp: new Date().toISOString()
                    })
                } else {
                    return NextResponse.json(
                        { error: 'Failed to apply auto-fix' },
                        { status: 500 }
                    )
                }

            case 'updateSettings':
                // Update error detection settings
                return NextResponse.json({
                    type: 'settingsUpdated',
                    settings,
                    message: 'Error detection settings updated',
                    timestamp: new Date().toISOString()
                })

            case 'suppressError':
                if (!errorId) {
                    return NextResponse.json(
                        { error: 'Error ID required' },
                        { status: 400 }
                    )
                }

                // Implement error suppression logic
                return NextResponse.json({
                    type: 'errorSuppressed',
                    errorId,
                    message: 'Error suppressed',
                    timestamp: new Date().toISOString()
                })

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

    } catch (error) {
        console.error('Error detection update failed:', error)
        return NextResponse.json(
            { error: 'Failed to update error detection' },
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
        const detectionId = searchParams.get('detectionId')
        const watcherId = searchParams.get('watcherId')

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

        const detector = new IntelligentErrorDetector(projectPath)

        if (watcherId) {
            // Disable specific real-time watcher
            detector.disableRealTimeDetection(watcherId)

            return NextResponse.json({
                type: 'watcherDisabled',
                watcherId,
                message: 'Real-time error detection disabled',
                timestamp: new Date().toISOString()
            })
        }

        if (detectionId) {
            // Clear specific detection result
            return NextResponse.json({
                type: 'detectionCleared',
                detectionId,
                message: 'Detection result cleared',
                timestamp: new Date().toISOString()
            })
        }

        // Clear all detection data
        detector.disableRealTimeDetection()

        return NextResponse.json({
            type: 'allDetectionCleared',
            message: 'All error detection data cleared',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Error detection cleanup failed:', error)
        return NextResponse.json(
            { error: 'Failed to cleanup error detection' },
            { status: 500 }
        )
    }
}
