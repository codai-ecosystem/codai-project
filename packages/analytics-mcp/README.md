# Analytics MCP Server

A comprehensive Model Context Protocol (MCP) server for data analytics, metrics collection, and business intelligence within the CODAI ecosystem.

## Features

- **Real-time Metrics Collection**: Collect and store metrics from any service
- **Advanced Querying**: Query metrics with time ranges, aggregations, and filtering
- **AI-Powered Insights**: Generate intelligent insights and recommendations
- **Custom Dashboards**: Create and manage analytics dashboards
- **Multi-format Export**: Export data in JSON, CSV, and Excel formats
- **Service Analytics**: Get comprehensive metrics for specific services

## Installation

```bash
cd packages/analytics-mcp
npm install
```

## Usage

The Analytics MCP server can be started directly or integrated into your MCP client:

```bash
# Run the server
npm start

# Or run with ts-node for development
npx ts-node src/index.ts
```

## Available Tools

### collect_metric
Collect a metric data point for analytics.

```typescript
{
  name: "response_time",
  value: 150,
  service: "api-gateway",
  tags: {
    endpoint: "/api/users",
    method: "GET"
  }
}
```

### query_metrics
Query and aggregate metric data with advanced filtering.

```typescript
{
  metrics: ["response_time", "error_count"],
  timeRange: {
    start: "2024-01-01T00:00:00Z",
    end: "2024-01-02T00:00:00Z"
  },
  aggregation: "avg",
  groupBy: ["service"],
  filters: {
    service: "api-gateway"
  }
}
```

### generate_insights
Generate AI-powered insights for a specific metric.

```typescript
{
  metricName: "response_time",
  days: 7
}
```

### create_dashboard
Create custom analytics dashboards.

```typescript
{
  name: "Service Performance",
  description: "Real-time service performance metrics",
  widgets: [
    {
      type: "chart",
      title: "Response Time Trend",
      query: { /* analytics query */ },
      config: { chartType: "line" }
    }
  ]
}
```

### get_service_metrics
Get comprehensive metrics for a specific service.

```typescript
{
  serviceName: "api-gateway",
  hours: 24
}
```

## Integration Examples

### With CODAI Services

```javascript
// Collect performance metrics
await mcpClient.callTool('collect_metric', {
  name: 'api_response_time',
  value: responseTime,
  service: 'codai-api',
  tags: {
    endpoint: req.path,
    method: req.method,
    status: res.statusCode
  }
});

// Query performance trends
const insights = await mcpClient.callTool('query_metrics', {
  metrics: ['api_response_time'],
  timeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString()
  },
  aggregation: 'avg',
  groupBy: ['endpoint']
});
```

### Dashboard Creation

```javascript
// Create a comprehensive service dashboard
const dashboard = await mcpClient.callTool('create_dashboard', {
  name: 'CODAI Ecosystem Health',
  description: 'Real-time health and performance metrics',
  widgets: [
    {
      type: 'metric',
      title: 'Average Response Time',
      query: {
        metrics: ['response_time'],
        timeRange: { start: '-1h', end: 'now' },
        aggregation: 'avg'
      }
    },
    {
      type: 'chart',
      title: 'Error Rate Trend',
      query: {
        metrics: ['error_count'],
        timeRange: { start: '-24h', end: 'now' },
        aggregation: 'sum',
        groupBy: ['hour']
      },
      config: { chartType: 'line', color: 'red' }
    }
  ]
});
```

## Architecture

The Analytics MCP server provides:

1. **Metric Collection**: Flexible metric ingestion with tagging
2. **Time-Series Storage**: Efficient storage and retrieval
3. **Query Engine**: Advanced filtering and aggregation
4. **Insight Generation**: AI-powered trend analysis
5. **Dashboard Management**: Custom visualization creation
6. **Export Capabilities**: Multiple format support

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Configuration

The server can be configured through environment variables:

```bash
# Optional: Database connection (defaults to in-memory)
DATABASE_URL=postgresql://user:pass@localhost/analytics

# Optional: AI insights provider
AI_PROVIDER=openai
AI_API_KEY=your-api-key

# Optional: Export storage location
EXPORT_PATH=/tmp/analytics-exports
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details
