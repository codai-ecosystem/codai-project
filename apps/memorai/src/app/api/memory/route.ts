// API route for memory queries
import { NextRequest, NextResponse } from 'next/server'
import { MemoryService } from '@/services/MemoryService'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { agentId, query, type, limit, contextSize } = body

        if (!agentId || !query) {
            return NextResponse.json(
                { error: 'Missing required fields: agentId and query' },
                { status: 400 }
            )
        }

        const memoryService = MemoryService.getInstance()
        const response = await memoryService.query({
            agentId,
            query,
            type,
            limit: limit || 10,
            contextSize: contextSize || 5
        })

        return NextResponse.json(response)
    } catch (error) {
        console.error('Memory query error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const memoryService = MemoryService.getInstance()
        const memories = memoryService.getAllMemories()

        return NextResponse.json({
            success: true,
            memories,
            total: memories.length
        })
    } catch (error) {
        console.error('Memory retrieval error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
