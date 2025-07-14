import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface KnowledgeNode {
    id: string
    label: string
    type: 'memory' | 'agent' | 'keyword' | 'category'
    size: number
    importance: number
    connections: number
    lastActivity: string
    metadata: Record<string, any>
}

export interface KnowledgeEdge {
    id: string
    source: string
    target: string
    weight: number
    type: 'semantic' | 'temporal' | 'agent' | 'category'
    strength: number
    createdAt: string
}

export interface KnowledgeGraphData {
    nodes: KnowledgeNode[]
    edges: KnowledgeEdge[]
    clusters: KnowledgeCluster[]
    statistics: GraphStatistics
}

export interface KnowledgeCluster {
    id: string
    name: string
    nodeIds: string[]
    centroid: { x: number; y: number }
    density: number
    importance: number
}

export interface GraphStatistics {
    totalNodes: number
    totalEdges: number
    totalClusters: number
    averageConnections: number
    networkDensity: number
    strongestConnections: string[]
    keywordFrequency: Record<string, number>
    agentActivity: Record<string, number>
}

interface Memory {
    id: string
    content: string
    agentId: string
    createdAt: Date
    updatedAt: Date
    metadata: any
}

function extractKeywords(content: string): string[] {
    // Extract meaningful keywords (3+ chars, exclude common words)
    const commonWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'])

    const words = content.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 3 && !commonWords.has(word))
        .slice(0, 10) // Top 10 keywords per memory

    return [...new Set(words)] // Remove duplicates
}

function calculateSimilarity(keywords1: string[], keywords2: string[]): number {
    const set1 = new Set(keywords1)
    const set2 = new Set(keywords2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])

    return union.size > 0 ? intersection.size / union.size : 0
}

function calculateTemporalProximity(date1: Date, date2: Date): number {
    const diffMs = Math.abs(date1.getTime() - date2.getTime())
    const diffHours = diffMs / (1000 * 60 * 60)

    // Stronger connection for memories created closer in time
    if (diffHours < 1) return 0.9
    if (diffHours < 24) return 0.7
    if (diffHours < 168) return 0.5 // 1 week
    if (diffHours < 720) return 0.3 // 1 month
    return 0.1
}

async function buildKnowledgeGraph(): Promise<KnowledgeGraphData> {
    try {
        // Get all memories with metadata
        const memories = await prisma.memory.findMany({
            select: {
                id: true,
                content: true,
                agentId: true,
                createdAt: true,
                updatedAt: true,
                metadata: true
            },
            orderBy: { createdAt: 'desc' }
        })

        const nodes: KnowledgeNode[] = []
        const edges: KnowledgeEdge[] = []
        const keywordMap = new Map<string, string[]>() // keyword -> memory IDs
        const agentActivity = new Map<string, number>()

        // Create memory nodes and extract keywords
        for (const memory of memories) {
            const keywords = extractKeywords(memory.content)
            const agentCount = agentActivity.get(memory.agentId) || 0
            agentActivity.set(memory.agentId, agentCount + 1)

            // Memory node
            nodes.push({
                id: `memory-${memory.id}`,
                label: memory.content.substring(0, 50) + (memory.content.length > 50 ? '...' : ''),
                type: 'memory',
                size: Math.min(100, memory.content.length / 10), // Size based on content length
                importance: keywords.length * 10, // Importance based on keyword richness
                connections: 0, // Will be calculated later
                lastActivity: memory.updatedAt.toISOString(),
                metadata: {
                    agentId: memory.agentId,
                    contentLength: memory.content.length,
                    keywords,
                    createdAt: memory.createdAt.toISOString()
                }
            })

            // Track keywords for semantic connections
            keywords.forEach(keyword => {
                if (!keywordMap.has(keyword)) {
                    keywordMap.set(keyword, [])
                }
                keywordMap.get(keyword)!.push(memory.id)
            })
        }

        // Create agent nodes
        const uniqueAgents = [...agentActivity.keys()]
        uniqueAgents.forEach(agentId => {
            const activity = agentActivity.get(agentId) || 0
            nodes.push({
                id: `agent-${agentId}`,
                label: `Agent ${agentId}`,
                type: 'agent',
                size: Math.min(150, activity * 20),
                importance: activity * 25,
                connections: 0,
                lastActivity: new Date().toISOString(),
                metadata: {
                    memoryCount: activity,
                    agentId
                }
            })
        })

        // Create keyword nodes for frequent keywords
        const keywordFrequency: Record<string, number> = {}
        keywordMap.forEach((memoryIds, keyword) => {
            keywordFrequency[keyword] = memoryIds.length
            if (memoryIds.length >= 2) { // Only create nodes for keywords appearing in 2+ memories
                nodes.push({
                    id: `keyword-${keyword}`,
                    label: keyword,
                    type: 'keyword',
                    size: Math.min(80, memoryIds.length * 15),
                    importance: memoryIds.length * 15,
                    connections: 0,
                    lastActivity: new Date().toISOString(),
                    metadata: {
                        frequency: memoryIds.length,
                        keyword
                    }
                })
            }
        })

        // Create edges
        let edgeId = 0

        // Agent-Memory connections
        memories.forEach((memory: Memory) => {
            edges.push({
                id: `edge-${++edgeId}`,
                source: `agent-${memory.agentId}`,
                target: `memory-${memory.id}`,
                weight: 1.0,
                type: 'agent',
                strength: 0.8,
                createdAt: memory.createdAt.toISOString()
            })
        })

        // Semantic connections (shared keywords)
        for (let i = 0; i < memories.length; i++) {
            for (let j = i + 1; j < memories.length; j++) {
                const memory1 = memories[i]
                const memory2 = memories[j]
                const keywords1 = extractKeywords(memory1.content)
                const keywords2 = extractKeywords(memory2.content)

                const similarity = calculateSimilarity(keywords1, keywords2)
                const temporal = calculateTemporalProximity(memory1.createdAt, memory2.createdAt)

                if (similarity > 0.2 || temporal > 0.5) { // Threshold for connection
                    const strength = Math.max(similarity, temporal * 0.7)
                    edges.push({
                        id: `edge-${++edgeId}`,
                        source: `memory-${memory1.id}`,
                        target: `memory-${memory2.id}`,
                        weight: strength,
                        type: similarity > temporal ? 'semantic' : 'temporal',
                        strength,
                        createdAt: new Date().toISOString()
                    })
                }
            }
        }

        // Keyword-Memory connections
        keywordMap.forEach((memoryIds, keyword) => {
            if (memoryIds.length >= 2) {
                memoryIds.forEach(memoryId => {
                    edges.push({
                        id: `edge-${++edgeId}`,
                        source: `keyword-${keyword}`,
                        target: `memory-${memoryId}`,
                        weight: 0.6,
                        type: 'category',
                        strength: 0.6,
                        createdAt: new Date().toISOString()
                    })
                })
            }
        })

        // Update connection counts
        const connectionCounts = new Map<string, number>()
        edges.forEach(edge => {
            connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1)
            connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1)
        })

        nodes.forEach(node => {
            node.connections = connectionCounts.get(node.id) || 0
        })

        // Create simple clusters based on agents
        const clusters: KnowledgeCluster[] = uniqueAgents.map((agentId, index) => {
            const agentNodeIds = nodes
                .filter(node =>
                    node.type === 'agent' && node.metadata.agentId === agentId ||
                    node.type === 'memory' && node.metadata.agentId === agentId
                )
                .map(node => node.id)

            return {
                id: `cluster-${agentId}`,
                name: `Agent ${agentId} Cluster`,
                nodeIds: agentNodeIds,
                centroid: { x: index * 100, y: index * 100 },
                density: agentNodeIds.length / Math.max(1, nodes.length),
                importance: agentActivity.get(agentId) || 0
            }
        })

        const statistics: GraphStatistics = {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            totalClusters: clusters.length,
            averageConnections: nodes.length > 0 ? edges.length * 2 / nodes.length : 0,
            networkDensity: nodes.length > 1 ? edges.length / (nodes.length * (nodes.length - 1) / 2) : 0,
            strongestConnections: edges
                .sort((a, b) => b.strength - a.strength)
                .slice(0, 5)
                .map(edge => `${edge.source} → ${edge.target}`),
            keywordFrequency,
            agentActivity: Object.fromEntries(agentActivity)
        }

        return {
            nodes,
            edges,
            clusters,
            statistics
        }

    } catch (error) {
        console.error('Error building knowledge graph:', error)

        // Return minimal fallback graph
        return {
            nodes: [
                {
                    id: 'fallback-node',
                    label: 'Knowledge Graph',
                    type: 'memory',
                    size: 50,
                    importance: 100,
                    connections: 0,
                    lastActivity: new Date().toISOString(),
                    metadata: {}
                }
            ],
            edges: [],
            clusters: [],
            statistics: {
                totalNodes: 1,
                totalEdges: 0,
                totalClusters: 0,
                averageConnections: 0,
                networkDensity: 0,
                strongestConnections: [],
                keywordFrequency: {},
                agentActivity: {}
            }
        }
    }
}

export async function GET() {
    try {
        const graphData = await buildKnowledgeGraph()

        return NextResponse.json({
            ...graphData,
            generatedAt: new Date().toISOString(),
            version: '1.0.0'
        })
    } catch (error) {
        console.error('Error getting knowledge graph:', error)
        return NextResponse.json(
            { error: 'Failed to generate knowledge graph' },
            { status: 500 }
        )
    }
}
