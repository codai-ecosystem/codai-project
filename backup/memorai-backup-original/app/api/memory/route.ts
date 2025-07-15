import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AIMemoryService } from '../../../lib/ai-memory-service';

const prisma = new PrismaClient();
const memoryService = new AIMemoryService();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get('agentId');
        const memoryId = searchParams.get('id');
        const limit = parseInt(searchParams.get('limit') || '10');
        const memoryType = searchParams.get('type');

        if (memoryId) {
            // Get specific memory and update access stats
            const memory = await memoryService.getMemoryById(memoryId);
            return NextResponse.json(memory);
        }

        if (!agentId) {
            return NextResponse.json({ error: 'agentId required' }, { status: 400 });
        }

        // Get memories for agent with filtering
        const memories = await memoryService.getMemoriesForAgent(agentId, {
            limit,
            memoryType,
            orderBy: 'lastAccessed'
        });

        return NextResponse.json({
            memories,
            count: memories.length,
            agentId
        });
    } catch (error) {
        console.error('Memory retrieval error:', error);
        return NextResponse.json({ error: 'Failed to retrieve memories' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            agentId,
            content,
            memoryType = 'EPISODIC',
            importance = 0.5,
            confidence = 0.8,
            category,
            tags,
            metadata,
            sessionId
        } = body;

        if (!agentId || !content) {
            return NextResponse.json(
                { error: 'agentId and content are required' },
                { status: 400 }
            );
        }

        // First ensure agent exists, create if not
        let agent = await prisma.agent.findUnique({ where: { id: agentId } });
        if (!agent) {
            agent = await prisma.agent.create({
                data: {
                    id: agentId,
                    name: `Agent ${agentId}`,
                    type: 'PERSONAL',
                    status: 'ACTIVE'
                }
            });
        }

        // Create memory directly without complex AI processing for now
        const memory = await prisma.memory.create({
            data: {
                agentId,
                content,
                summary: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
                memoryType,
                importance,
                confidence,
                category,
                tags: tags ? JSON.stringify(tags) : null,
                metadata: metadata ? JSON.stringify(metadata) : null,
                sessionId
            }
        });

        return NextResponse.json(memory, { status: 201 });
    } catch (error) {
        console.error('Memory creation error:', error);
        return NextResponse.json({ error: 'Failed to create memory', details: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Memory ID required' }, { status: 400 });
        }

        // Update memory with intelligent processing
        const updatedMemory = await memoryService.updateMemory(id, updateData);

        return NextResponse.json(updatedMemory);
    } catch (error) {
        console.error('Memory update error:', error);
        return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Memory ID required' }, { status: 400 });
        }

        // Soft delete or hard delete with cascade cleanup
        await memoryService.deleteMemory(id);

        return NextResponse.json({ success: true, deletedId: id });
    } catch (error) {
        console.error('Memory deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
    }
}