// MCP Server Implementation for Memorai
// Model Context Protocol server for AI agent memory management

import { MemoryService } from './MemoryService';
import { MCPConnection, QueryRequest, MemoryRequest } from '../types';

export class MCPServer {
  private static instance: MCPServer;
  private memoryService: MemoryService;
  private connections: Map<string, MCPConnection> = new Map();
  private server: any = null; // Would be actual server instance in production

  private constructor() {
    this.memoryService = MemoryService.getInstance();
    this.initializeMockConnections();
  }

  public static getInstance(): MCPServer {
    if (!MCPServer.instance) {
      MCPServer.instance = new MCPServer();
    }
    return MCPServer.instance;
  }

  private initializeMockConnections(): void {
    const mockConnections: MCPConnection[] = [
      {
        id: 'conn_1',
        agentId: 'codai-orchestrator',
        status: 'connected',
        lastActivity: new Date().toISOString(),
        queryCount: 1247,
        endpoint: 'ws://localhost:3001/mcp/codai-orchestrator',
      },
      {
        id: 'conn_2',
        agentId: 'memorai-agent',
        status: 'connected',
        lastActivity: new Date(Date.now() - 5000).toISOString(),
        queryCount: 892,
        endpoint: 'ws://localhost:3001/mcp/memorai-agent',
      },
      {
        id: 'conn_3',
        agentId: 'logai-agent',
        status: 'disconnected',
        lastActivity: new Date(Date.now() - 300000).toISOString(),
        queryCount: 156,
        endpoint: 'ws://localhost:3001/mcp/logai-agent',
      },
    ];

    mockConnections.forEach(conn => {
      this.connections.set(conn.id, conn);
    });
  }

  public async startServer(port: number = 3001): Promise<void> {
    // In production, this would start the actual MCP server
    console.log(`MCP Server starting on port ${port}`);

    // Mock server startup
    this.server = {
      port,
      status: 'running',
      startTime: new Date().toISOString(),
    };

    console.log('MCP Server ready for agent connections');
  }

  public async stopServer(): Promise<void> {
    console.log('Stopping MCP Server...');
    this.server = null;
    this.connections.clear();
  }

  public async handleConnection(
    agentId: string,
    endpoint: string
  ): Promise<MCPConnection> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const connection: MCPConnection = {
      id: connectionId,
      agentId,
      status: 'connected',
      lastActivity: new Date().toISOString(),
      queryCount: 0,
      endpoint,
    };

    this.connections.set(connectionId, connection);

    console.log(`Agent ${agentId} connected via MCP`);
    return connection;
  }

  public async handleQuery(
    connectionId: string,
    request: QueryRequest
  ): Promise<any> {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      throw new Error('Invalid connection');
    }

    if (connection.status !== 'connected') {
      throw new Error('Connection not active');
    }

    // Update connection activity
    connection.lastActivity = new Date().toISOString();
    connection.queryCount++;

    // Process query through memory service
    const response = await this.memoryService.query(request);

    return {
      jsonrpc: '2.0',
      id: Date.now(),
      result: response,
    };
  }

  public async handleRemember(
    connectionId: string,
    request: MemoryRequest
  ): Promise<any> {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      throw new Error('Invalid connection');
    }

    if (connection.status !== 'connected') {
      throw new Error('Connection not active');
    }

    // Update connection activity
    connection.lastActivity = new Date().toISOString();

    // Process memory storage through memory service
    const response = await this.memoryService.remember(request);

    return {
      jsonrpc: '2.0',
      id: Date.now(),
      result: response,
    };
  }

  public async handleForget(
    connectionId: string,
    memoryId: string
  ): Promise<any> {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      throw new Error('Invalid connection');
    }

    if (connection.status !== 'connected') {
      throw new Error('Connection not active');
    }

    // Update connection activity
    connection.lastActivity = new Date().toISOString();

    // Process memory deletion through memory service
    const response = await this.memoryService.forget(memoryId);

    return {
      jsonrpc: '2.0',
      id: Date.now(),
      result: response,
    };
  }

  public getConnections(): MCPConnection[] {
    return Array.from(this.connections.values());
  }

  public getConnectionById(id: string): MCPConnection | null {
    return this.connections.get(id) || null;
  }

  public getConnectionByAgent(agentId: string): MCPConnection | null {
    for (const connection of this.connections.values()) {
      if (connection.agentId === agentId) {
        return connection;
      }
    }
    return null;
  }

  public disconnectAgent(agentId: string): void {
    for (const [id, connection] of this.connections.entries()) {
      if (connection.agentId === agentId) {
        connection.status = 'disconnected';
        console.log(`Agent ${agentId} disconnected`);
        break;
      }
    }
  }

  public getServerStatus(): any {
    return {
      ...this.server,
      totalConnections: this.connections.size,
      activeConnections: Array.from(this.connections.values()).filter(
        c => c.status === 'connected'
      ).length,
      totalQueries: Array.from(this.connections.values()).reduce(
        (sum, c) => sum + c.queryCount,
        0
      ),
    };
  }
}
