# CODAI Ecosystem Port Allocation Plan

## Current Port Conflicts
- Port 80: IIS/Windows (reserved system port)
- Port 443: HTTPS (reserved system port) 
- Port 4003: Already in use (likely Gateway service)
- Port 4004: Already in use (likely ID service)
- Port 4005: Already in use (likely BancAI service)
- Port 6379: memorai-redis container (already running)
- Port 8001: Already in use (likely RomAI Enterprise API)

## New Port Allocation (All ports 4000+)

### Core Infrastructure (4000-4099)
- **4000**: Nginx Load Balancer (external entry point)
- **4010**: CODAI Gateway (internal orchestration)
- **4020**: CODAI Redis (internal cache)

### Application Services (4100-4199)  
- **4100**: ID Service (identity management)
- **4110**: Hub Service (central coordination)
- **4120**: BancAI Service (banking AI)
- **4130**: RomAI Service (roman AI)
- **4140**: Admin Service (administration)
- **4150**: Explorer Service (data exploration)

### API Services (4200-4299)
- **4200**: RomAI Enterprise API (external API)
- **4210**: GraphQL API (query interface)
- **4220**: REST API Gateway (RESTful interface)

### Database Services (4300-4399)
- **4300**: PostgreSQL (primary database) - keep 5432 for compatibility
- **4310**: MongoDB (document database)
- **4320**: Redis (cache) - internal port only

### Development Services (4400-4499)
- **4400**: Development Gateway
- **4410**: Hot Reload Server
- **4420**: Testing Server
- **4430**: Documentation Server

### Monitoring & Analytics (4500-4599)
- **4500**: Prometheus (metrics collection)
- **4510**: Grafana (monitoring dashboard)
- **4520**: Analytics Service
- **4530**: Health Check Service

## External Port Mapping Strategy
- External users access only port 4000 (Nginx)
- All internal services use 4000+ ports
- No conflicts with system ports (80, 443, 3000)
- No conflicts with existing services

## Implementation Priority
1. Stop conflicting containers
2. Update docker-compose.yml with new port allocation
3. Update Nginx configuration for new upstream ports
4. Restart containers with new configuration
5. Test all service connectivity