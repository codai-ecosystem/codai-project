#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { InventoryServices, ProductStatus, StockMovementType } from './services/inventoryServices.js';
import { logger } from './utils/logger.js';

class StocAIMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'stocai-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();

    // Error handling
    this.server.onerror = (error) => {
      logger.error('StocAI MCP Server error:', error);
    };

    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'calculate_inventory_value',
            description: 'Calculate total inventory value using selling or cost price method',
            inputSchema: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      quantity: { type: 'number', description: 'Quantity in stock' },
                      unitPrice: { type: 'number', description: 'Unit selling price' },
                      costPrice: { type: 'number', description: 'Unit cost price (optional)' },
                    },
                    required: ['quantity', 'unitPrice'],
                  },
                  description: 'Array of inventory items with quantities and prices',
                },
                valueMethod: {
                  type: 'string',
                  enum: ['selling', 'cost'],
                  description: 'Valuation method to use',
                  default: 'cost',
                },
              },
              required: ['items'],
            },
          },
          {
            name: 'calculate_turnover_rate',
            description: 'Calculate inventory turnover rate and days of supply',
            inputSchema: {
              type: 'object',
              properties: {
                costOfGoodsSold: {
                  type: 'number',
                  description: 'Cost of goods sold for the period',
                },
                averageInventoryValue: {
                  type: 'number',
                  description: 'Average inventory value during the period',
                },
                periodDays: {
                  type: 'number',
                  description: 'Period in days (default: 365)',
                  default: 365,
                },
              },
              required: ['costOfGoodsSold', 'averageInventoryValue'],
            },
          },
          {
            name: 'generate_reorder_recommendations',
            description: 'Generate reorder recommendations based on stock levels and usage patterns',
            inputSchema: {
              type: 'object',
              properties: {
                currentStock: {
                  type: 'number',
                  description: 'Current stock level',
                },
                reorderLevel: {
                  type: 'number',
                  description: 'Reorder point threshold',
                },
                maxStockLevel: {
                  type: 'number',
                  description: 'Maximum stock level',
                },
                averageDailyUsage: {
                  type: 'number',
                  description: 'Average daily usage/consumption',
                },
                leadTimeDays: {
                  type: 'number',
                  description: 'Lead time in days (default: 7)',
                  default: 7,
                },
              },
              required: ['currentStock', 'reorderLevel', 'maxStockLevel', 'averageDailyUsage'],
            },
          },
          {
            name: 'analyze_abc_classification',
            description: 'Perform ABC analysis (Pareto analysis) on products based on annual value',
            inputSchema: {
              type: 'object',
              properties: {
                products: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', description: 'Product ID' },
                      name: { type: 'string', description: 'Product name' },
                      annualValue: { type: 'number', description: 'Annual value (price × annual quantity)' },
                    },
                    required: ['id', 'name', 'annualValue'],
                  },
                  description: 'Array of products with their annual values',
                },
              },
              required: ['products'],
            },
          },
          {
            name: 'calculate_stock_aging',
            description: 'Analyze stock aging to identify slow-moving or obsolete inventory',
            inputSchema: {
              type: 'object',
              properties: {
                inventoryItems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      productId: { type: 'string', description: 'Product ID' },
                      quantity: { type: 'number', description: 'Quantity in stock' },
                      lastRestockDate: { type: 'string', description: 'Last restock date (ISO format)' },
                      unitValue: { type: 'number', description: 'Unit value for aging calculation' },
                    },
                    required: ['productId', 'quantity', 'lastRestockDate', 'unitValue'],
                  },
                  description: 'Array of inventory items with restock dates and values',
                },
              },
              required: ['inventoryItems'],
            },
          },
          {
            name: 'validate_sku',
            description: 'Validate SKU format according to standard conventions',
            inputSchema: {
              type: 'object',
              properties: {
                sku: {
                  type: 'string',
                  description: 'SKU to validate',
                },
              },
              required: ['sku'],
            },
          },
          {
            name: 'generate_sku',
            description: 'Generate a new SKU based on category and optional brand',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Product category',
                },
                brand: {
                  type: 'string',
                  description: 'Product brand (optional)',
                },
              },
              required: ['category'],
            },
          },
          {
            name: 'get_inventory_insights',
            description: 'Get comprehensive inventory insights and analytics',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'calculate_inventory_value': {
            const { items, valueMethod = 'cost' } = args as {
              items: Array<{ quantity: number; unitPrice: number; costPrice?: number }>;
              valueMethod?: 'selling' | 'cost';
            };

            const analysis = InventoryServices.calculateInventoryValue(items, valueMethod);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    totalValue: analysis.analysis.totalValue.toFixed(2),
                    recommendations: analysis.analysis.recommendations,
                    metrics: analysis.metrics,
                  }, null, 2),
                },
              ],
            };
          }

          case 'calculate_turnover_rate': {
            const { costOfGoodsSold, averageInventoryValue, periodDays = 365 } = args as {
              costOfGoodsSold: number;
              averageInventoryValue: number;
              periodDays?: number;
            };

            const analysis = InventoryServices.calculateTurnoverRate(
              costOfGoodsSold,
              averageInventoryValue,
              periodDays
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    turnoverRate: analysis.analysis.turnoverRate,
                    daysOfSupply: analysis.analysis.daysOfSupply,
                    performance: analysis.analysis.stockStatus,
                    recommendations: analysis.analysis.recommendations,
                    metrics: analysis.metrics,
                  }, null, 2),
                },
              ],
            };
          }

          case 'generate_reorder_recommendations': {
            const {
              currentStock,
              reorderLevel,
              maxStockLevel,
              averageDailyUsage,
              leadTimeDays = 7,
            } = args as {
              currentStock: number;
              reorderLevel: number;
              maxStockLevel: number;
              averageDailyUsage: number;
              leadTimeDays?: number;
            };

            const forecast = InventoryServices.generateReorderRecommendations(
              currentStock,
              reorderLevel,
              maxStockLevel,
              averageDailyUsage,
              leadTimeDays
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(forecast, null, 2),
                },
              ],
            };
          }

          case 'analyze_abc_classification': {
            const { products } = args as {
              products: Array<{ id: string; name: string; annualValue: number }>;
            };

            const result = InventoryServices.analyzeABCClassification(products);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'calculate_stock_aging': {
            const { inventoryItems } = args as {
              inventoryItems: Array<{
                productId: string;
                quantity: number;
                lastRestockDate: string;
                unitValue: number;
              }>;
            };

            const itemsWithDates = inventoryItems.map(item => ({
              ...item,
              lastRestockDate: new Date(item.lastRestockDate),
            }));

            const result = InventoryServices.calculateStockAging(itemsWithDates);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'validate_sku': {
            const { sku } = args as { sku: string };

            const isValid = InventoryServices.validateSKU(sku);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    sku,
                    isValid,
                    message: isValid
                      ? 'SKU format is valid'
                      : 'SKU format is invalid - should be 3-20 alphanumeric characters with hyphens',
                  }, null, 2),
                },
              ],
            };
          }

          case 'generate_sku': {
            const { category, brand } = args as { category: string; brand?: string };

            const sku = InventoryServices.generateSKU(category, brand);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    generatedSKU: sku,
                    category,
                    brand: brand || 'Generic',
                    timestamp: new Date().toISOString(),
                  }, null, 2),
                },
              ],
            };
          }

          case 'get_inventory_insights': {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    availableAnalysis: [
                      'Inventory Valuation (cost/selling price methods)',
                      'Turnover Rate Analysis',
                      'Reorder Point Recommendations',
                      'ABC Classification (Pareto Analysis)',
                      'Stock Aging Analysis',
                      'SKU Validation and Generation',
                    ],
                    stockStatuses: Object.values(ProductStatus),
                    movementTypes: Object.values(StockMovementType),
                    features: {
                      'Real-time Analytics': 'Calculate key inventory metrics instantly',
                      'Predictive Insights': 'Generate reorder recommendations and forecasts',
                      'Classification': 'Perform ABC analysis for inventory prioritization',
                      'Aging Analysis': 'Identify slow-moving and obsolete stock',
                      'SKU Management': 'Validate and generate product SKUs',
                    },
                  }, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Tool execution error: ${error}`);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'stocai://inventory-insights',
            mimeType: 'application/json',
            name: 'Inventory Insights',
            description: 'Comprehensive inventory analytics and insights',
          },
          {
            uri: 'stocai://product-statuses',
            mimeType: 'application/json',
            name: 'Product Status Types',
            description: 'Available product status classifications',
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;

      switch (uri) {
        case 'stocai://inventory-insights': {
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  analysisCapabilities: [
                    'Inventory Valuation',
                    'Turnover Rate Analysis',
                    'Reorder Recommendations',
                    'ABC Classification',
                    'Stock Aging Analysis',
                    'SKU Management',
                  ],
                  metricsAvailable: [
                    'Total inventory value',
                    'Turnover rate and days of supply',
                    'Stockout risk assessment',
                    'Product classification (A/B/C)',
                    'Stock aging categories',
                    'SKU validation results',
                  ],
                }, null, 2),
              },
            ],
          };
        }

        case 'stocai://product-statuses': {
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  productStatuses: Object.values(ProductStatus),
                  stockMovementTypes: Object.values(StockMovementType),
                  statusDescriptions: {
                    [ProductStatus.ACTIVE]: 'Product is actively sold and stocked',
                    [ProductStatus.DISCONTINUED]: 'Product is no longer being produced',
                    [ProductStatus.OUT_OF_STOCK]: 'Product is temporarily out of stock',
                    [ProductStatus.LOW_STOCK]: 'Product is below reorder level',
                  },
                }, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Resource not found: ${uri}`);
      }
    });
  }

  private async cleanup(): Promise<void> {
    logger.info('Cleaning up StocAI MCP Server...');
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('StocAI MCP Server running on stdio');
  }
}

const server = new StocAIMCPServer();
server.run().catch(console.error);
