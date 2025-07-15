import { NextResponse } from 'next/server';
import { mcpMemoryClient } from '@/lib/mcp-memory-client';

export async function GET() {
  try {
    console.log('Stats API called - connecting to real MCP system...');

    // Get real stats from MCP memory client with optimized responses
    const mcpStats = await mcpMemoryClient.getStats();
    console.log('MCP Stats received:', mcpStats);

    const response = {
      totalMemories: mcpStats.totalMemories,
      systemHealth: 'healthy',
      totalAgents: mcpStats.totalAgents,
      averageImportance: mcpStats.averageImportance,
      recentActivity: mcpStats.recentActivity.map(activity => ({
        count: activity.count,
        type: 'memory_created',
        timestamp: new Date(activity.date).toISOString()
      })),
      // Add response optimization info
      optimized: true,
      responseSize: 'compact'
    };

    console.log('Stats API returning optimized MCP data:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Stats API error:', error);

    // Fallback to basic stats if MCP connection fails
    return NextResponse.json({
      totalMemories: 0,
      systemHealth: 'error',
      totalAgents: 0,
      averageImportance: 0,
      recentActivity: [],
      optimized: false,
      error: 'MCP connection failed'
    }, { status: 500 });
  }
}
