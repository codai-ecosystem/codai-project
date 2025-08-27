#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "test-minimal-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools with array parameters using pure JSON Schema
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "test_array_tool",
        description: "Test tool with array parameter to diagnose validation issues",
        inputSchema: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              description: "Array of tasks to perform",
              items: {
                type: "string",
                enum: ["task1", "task2", "task3"]
              }
            },
            files: {
              type: "array", 
              description: "Array of file paths",
              items: {
                type: "string"
              }
            },
            numbers: {
              type: "array",
              description: "Array of numbers",
              items: {
                type: "number"
              }
            }
          },
          required: ["tasks"]
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "test_array_tool") {
    return {
      content: [
        {
          type: "text",
          text: `Test successful! Received: ${JSON.stringify(args, null, 2)}`
        }
      ]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Minimal MCP test server running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});