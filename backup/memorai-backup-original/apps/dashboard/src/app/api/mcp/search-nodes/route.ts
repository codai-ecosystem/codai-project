import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { query } = requestBody;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    try {
      // Use real MCP recall to search memories
      const mcpResult = await fetch('http://localhost:3000/mcp/recall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'memorai-development',
          query: query,
          limit: 20
        }),
      });

      if (!mcpResult.ok) {
        console.error('MCP search failed:', mcpResult.statusText);
        return NextResponse.json([]);
      }

      const searchData = await mcpResult.json();

      if (!searchData.success || !searchData.memories) {
        console.warn('No search results from MCP');
        return NextResponse.json([]);
      }

      // Transform MCP memories to expected format
      const transformedResults = searchData.memories.map((item: any, index: number) => {
        const memory = item.memory || item;
        return {
          name: `memory-${index + 1}`,
          entityType: memory.type || 'memory',
          observations: [memory.content || ''],
          score: item.score || memory.confidence || 0.5,
          metadata: memory.context || {},
        };
      });

      console.log(`Found ${transformedResults.length} search results for "${query}"`);
      return NextResponse.json(transformedResults);
    } catch (mcpError) {
      console.error('MCP search error:', mcpError);
      return NextResponse.json([]);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in search-nodes API:', error);
    }
    return NextResponse.json(
      { error: 'Failed to search nodes' },
      { status: 500 }
    );
  }
}
