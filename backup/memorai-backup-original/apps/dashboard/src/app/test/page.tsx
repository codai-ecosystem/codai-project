'use client';

import { useEffect, useState } from 'react';
import { mcpMemoryClient } from '../../lib/mcp-memory-client';

export default function TestPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testMCPClient() {
      try {
        console.log('=== TEST PAGE: Testing MCP Client ===');
        setLoading(true);

        const result = await mcpMemoryClient.getStats();
        console.log('TEST PAGE: MCP Client result:', result);

        setStats(result);
        setLoading(false);
      } catch (err) {
        console.error('TEST PAGE: Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    testMCPClient();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">MCP Client Test Page</h1>

      {loading && <p>Loading...</p>}

      {error && (
        <div className="text-red-600 p-4 border border-red-200 rounded">
          Error: {error}
        </div>
      )}

      {stats && (
        <div className="bg-green-50 p-4 border border-green-200 rounded">
          <h2 className="text-lg font-semibold mb-2">MCP Stats:</h2>
          <p><strong>Total Memories:</strong> {stats.totalMemories}</p>
          <p><strong>Total Agents:</strong> {stats.totalAgents}</p>
          <p><strong>Average Importance:</strong> {Math.round((stats.averageImportance || 0) * 100)}%</p>

          <h3 className="text-md font-semibold mt-4 mb-2">Memory Types:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(stats.memoryTypes, null, 2)}
          </pre>

          <h3 className="text-md font-semibold mt-4 mb-2">Full Stats:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
