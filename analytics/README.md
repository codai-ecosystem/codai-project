# CODAI Analytics & Monitoring Module

## Overview
Comprehensive analytics and monitoring solution for the CODAI ecosystem, providing real-time insights, performance monitoring, and business intelligence.

## Features

### 🔄 Real-Time Monitoring
- Live application health monitoring
- Performance metrics tracking
- Error detection and alerting
- WebSocket-based real-time updates

### 📊 Analytics Dashboard
- Interactive web-based dashboard
- Application status overview
- Performance metrics visualization
- Security status monitoring
- Business analytics and insights

### 🤖 Business Intelligence
- User behavior analytics
- Application usage tracking
- Revenue and conversion metrics
- Predictive insights and recommendations

### 🔍 Prometheus Integration
- Custom metrics collection
- Advanced alerting rules
- Long-term data storage
- Integration with existing monitoring stack

## Quick Start

### 1. Install Dependencies
```bash
cd analytics
npm install
pip install pandas numpy aiohttp sqlite3
```

### 2. Start Analytics Dashboard
```bash
npm start
# or for development with auto-reload
npm run dev
```

### 3. Access Dashboard
- **Dashboard URL**: http://localhost:9999
- **API Endpoint**: http://localhost:9999/api/metrics
- **Health Check**: http://localhost:9999/api/health

### 4. Start Business Intelligence
```bash
npm run business-intelligence
# or directly
python business-intelligence.py
```

## API Endpoints

### Dashboard API
- `GET /` - Analytics dashboard (HTML)
- `GET /api/metrics` - Complete metrics data
- `GET /api/metrics/:category` - Category-specific metrics
- `GET /api/health` - Service health status
- `GET /api/applications/status` - Application health status
- `GET /api/performance/summary` - Performance metrics
- `GET /api/security/status` - Security status
- `GET /api/business/analytics` - Business metrics

### WebSocket Stream
- **Endpoint**: `ws://localhost:9999`
- **Protocol**: JSON messages
- **Subscribe**: `{"type": "subscribe", "categories": ["all"]}`

## Monitoring Configuration

### Application Health Checks
The system monitors these CODAI applications:
- MemorAI (memorai.codai.ro)
- Admin Dashboard (admin.codai.ro)
- Hub (hub.codai.ro)
- Control Panel (control.codai.ro)
- RomAI (romai.codai.ro)
- BancAI (bancai.codai.ro)
- ID Service (id.codai.ro)
- Apps Portal (apps.codai.ro)
- API Gateway (gateway.codai.ro)
- Main API (api.codai.ro)

### Metrics Collected
- **Performance**: Response time, throughput, error rates
- **Security**: OWASP compliance, vulnerability scans
- **Business**: User engagement, conversion rates, revenue
- **System**: CPU, memory, disk usage
- **Deployment**: Success rates, rollback frequency

## Prometheus Integration

### Configuration
```yaml
# Use prometheus-integration.yml for complete setup
scrape_configs:
  - job_name: 'codai-analytics'
    static_configs:
      - targets: ['localhost:9999']
    metrics_path: '/api/metrics'
```

### Custom Metrics
- `codai_application_health{app="memorai"}` - Application health status
- `codai_response_time{app="memorai"}` - Response time metrics
- `codai_user_count{app="memorai"}` - Active user counts
- `codai_error_rate{app="memorai"}` - Error rate percentages

## Business Intelligence

### Analytics Database
SQLite database with the following tables:
- `user_analytics` - User behavior tracking
- `app_performance` - Application performance metrics
- `business_metrics` - Business KPIs and revenue data
- `error_tracking` - Error logs and resolution tracking
- `user_sessions` - Session analytics and user journeys

### Analytics Functions
```python
from analytics.business_intelligence import CODAIBusinessIntelligence

bi = CODAIBusinessIntelligence()

# Track user event
bi.track_user_event("user123", "MemorAI", "page_view", {"page": "/dashboard"})

# Track performance
bi.track_performance_metric("MemorAI", "response_time", 850.5)

# Track business metric
bi.track_business_metric("revenue", 1250.00, "sales")

# Generate report
report = bi.generate_comprehensive_report()
```

## Dashboard Features

### Real-Time Updates
- Application health status with response times
- Performance metrics with trend analysis
- Security status and compliance scores
- Business analytics and user engagement
- Deployment metrics and success rates

### Visual Elements
- Color-coded status indicators
- Real-time metric updates every 30 seconds
- Responsive design for mobile and desktop
- Dark theme optimized for monitoring

### Monitoring Alerts
- Application downtime detection
- Performance degradation alerts
- Security vulnerability notifications
- Business metric anomaly detection

## Environment Variables

```bash
# Analytics Dashboard
ANALYTICS_PORT=9999

# Database
ANALYTICS_DB_PATH=analytics/codai_analytics.db

# Monitoring
MONITORING_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=5000

# Business Intelligence
BI_REPORT_SCHEDULE=0 0 * * *  # Daily reports
```

## Integration with CODAI Applications

### Frontend Integration
Add to your Next.js applications:
```javascript
// Track user events
fetch('/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'page_view',
    data: { page: window.location.pathname }
  })
});
```

### Backend Integration
Add to your Express applications:
```javascript
// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Send to analytics
    trackPerformance('api_response_time', duration);
  });
  next();
});
```

## Advanced Features

### Predictive Analytics
- User churn prediction
- Performance trend analysis
- Capacity planning recommendations
- Revenue forecasting

### Custom Dashboards
- Create application-specific dashboards
- Custom metric visualization
- Alerting rule configuration
- Report automation

### Data Export
- CSV export for historical data
- JSON API for programmatic access
- Prometheus metrics format
- Integration with external BI tools

## Production Deployment

### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 9999
CMD ["npm", "start"]
```

### Docker Compose
```yaml
services:
  analytics:
    build: ./analytics
    ports:
      - "9999:9999"
    environment:
      - NODE_ENV=production
      - ANALYTICS_PORT=9999
    volumes:
      - ./analytics/data:/app/data
```

### Health Checks
```bash
# Application health
curl http://localhost:9999/api/health

# Metrics availability
curl http://localhost:9999/api/metrics

# Dashboard accessibility
curl -I http://localhost:9999/
```

## Troubleshooting

### Common Issues
1. **Port 9999 in use**: Change ANALYTICS_PORT environment variable
2. **Database permission errors**: Ensure write access to analytics directory
3. **Application timeout**: Increase HEALTH_CHECK_TIMEOUT
4. **WebSocket connection failed**: Check firewall and proxy settings

### Logs and Debugging
```bash
# Enable debug logging
DEBUG=analytics:* npm start

# View application logs
tail -f logs/analytics.log

# Monitor database
sqlite3 analytics/codai_analytics.db ".tables"
```

### Performance Optimization
- Use Redis for caching frequent queries
- Implement database indexing for large datasets
- Configure connection pooling for high traffic
- Use CDN for static dashboard assets

## Security Considerations

### API Security
- Rate limiting on analytics endpoints
- API key authentication for sensitive data
- CORS configuration for dashboard access
- Input validation for all user data

### Data Privacy
- User data anonymization options
- GDPR compliance features
- Data retention policy configuration
- Secure data transmission (HTTPS/WSS)

## Contributing

### Development Setup
```bash
git clone <repository>
cd analytics
npm install
pip install -r requirements.txt
npm run dev
```

### Testing
```bash
npm test
python -m pytest tests/
```

### Code Style
- ESLint for JavaScript
- Black for Python
- Prettier for formatting

## License
MIT License - see LICENSE file for details

## Support
For support and questions:
- GitHub Issues: [Create Issue](https://github.com/codai/issues)
- Documentation: [Wiki](https://github.com/codai/wiki)
- Email: support@codai.ro
