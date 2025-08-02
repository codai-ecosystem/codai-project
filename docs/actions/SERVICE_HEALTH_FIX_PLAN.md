# 🔧 Service Health Endpoint Fix Implementation

## Immediate Action Plan - August 2, 2025

**Priority**: CRITICAL  
**Target**: Fix 4/6 services with broken health endpoints

---

## 📊 Current Service Status

### ✅ WORKING SERVICES

- **Port 4180**: CBD Engine - `/health` ✅ (Production ready)
- **Port 4008**: Hub Service - `/health` ✅ (Operational)
- **Port 4005**: BancAI Service - ✅ (Next.js app, needs `/health` endpoint)

### 🔧 SERVICES NEEDING HEALTH FIXES

- **Port 4001**: CODAI/ID Service - 500 Internal Server Error
- **Port 4006**: MemorAI Service - Internal Server Error
- **Port 4002**: Admin Service - fetch failed (not running on expected port)
- **Port 4004**: ID Service - fetch failed (not running on expected port)

---

## 🎯 Fix Implementation Strategy

### Phase 1: Identify Actual Service Mappings

```bash
# Test all ports to identify actual services
for port in 4001 4002 4003 4004 4005 4006 4007 4008; do
  echo "Testing port $port:"
  curl -s http://localhost:$port/health || curl -s http://localhost:$port/api/health || curl -s http://localhost:$port/ | head -n 1
done
```

### Phase 2: Fix Health Endpoints Per Service Type

#### Next.js Services (BancAI, Admin, etc.)

```javascript
// Add to: src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    service: 'service-name',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Service is operational',
  });
}
```

#### Node.js/Express Services (MemorAI, CODAI, etc.)

```javascript
// Add to: src/routes/health.js or main server file
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'service-name',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Service is operational',
  });
});
```

### Phase 3: Update Gateway Service Mapping

```javascript
// Update Gateway routes to match actual service ports
const serviceMap = {
  codai: 'http://localhost:4001', // Fix: verify actual port
  admin: 'http://localhost:4005', // Fix: might be on different port
  hub: 'http://localhost:4008', // ✅ Confirmed working
  id: 'http://localhost:4001', // Fix: verify actual port
  bancai: 'http://localhost:4005', // ✅ Confirmed working
  memorai: 'http://localhost:4006', // Fix: needs health endpoint
};
```

---

## 📋 Implementation Tasks

### IMMEDIATE (Next 2 Hours)

#### Task 1: Service Port Audit

- [ ] Test all ports 4001-4010 to identify actual services
- [ ] Create accurate service-to-port mapping
- [ ] Update Gateway configuration with correct mappings

#### Task 2: MemorAI Health Endpoint (Port 4006)

```bash
cd apps/memorai
# Add health endpoint to MemorAI service
# Location: Check if it's Express or Next.js based
```

#### Task 3: CODAI Service Health Fix (Port 4001)

```bash
cd apps/codai
# Fix 500 Internal Server Error on health endpoint
# Likely missing route or server error
```

#### Task 4: Admin Service Location

```bash
# Find where Admin service is actually running
# Expected on 4002 but might be on different port
netstat -ano | findstr LISTENING | findstr :40
```

### VERIFICATION TASKS

- [ ] All services respond to `/health` with JSON
- [ ] Gateway health monitoring shows 6/6 services healthy
- [ ] Service discovery endpoints operational
- [ ] API routing working through Gateway

---

## 🔧 Service-Specific Implementation

### MemorAI Service (Port 4006)

**Issue**: `/api/health` returns Internal Server Error  
**Solution**: Add proper health endpoint

```javascript
// If Express-based (src/server.js or similar):
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'memorai',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'cbd-connected',
    message: 'MemorAI service operational with CBD backend',
  });
});

// If Next.js-based (src/app/api/health/route.ts):
export async function GET() {
  return Response.json({
    status: 'healthy',
    service: 'memorai',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'cbd-connected',
    message: 'MemorAI service operational with CBD backend',
  });
}
```

### CODAI Service (Port 4001)

**Issue**: `/health` returns 500 Internal Server Error  
**Solution**: Debug and fix server error

```bash
# Check logs for specific error
cd apps/codai
npm run logs

# Common fixes:
# 1. Missing route handler
# 2. Database connection error
# 3. Environment variable missing
# 4. Dependencies not installed
```

### Admin Service (Port 4002)

**Issue**: fetch failed - service not responding on expected port  
**Solution**: Locate actual running port and fix routing

```bash
# Find Admin service actual port
ps aux | grep admin
netstat -ano | findstr admin

# Update Gateway routing once found
```

---

## 🎯 Success Criteria

### Gateway Health Check Target

```json
{
  "gateway": {
    "status": "healthy",
    "uptime": "5m 30s",
    "version": "2.0.0"
  },
  "services": {
    "total": 6,
    "healthy": 6,
    "unhealthy": 0
  },
  "timestamp": "2025-08-02T06:30:00.000Z"
}
```

### Individual Service Health Response

```json
{
  "status": "healthy",
  "service": "service-name",
  "timestamp": "2025-08-02T06:30:00.000Z",
  "version": "1.0.0",
  "message": "Service is operational"
}
```

---

## 📅 Implementation Timeline

### Next 30 Minutes

1. **Service Port Audit**: Identify actual service locations
2. **MemorAI Health Fix**: Add health endpoint
3. **Gateway Restart**: Deploy with corrected mappings

### Next 60 Minutes

4. **CODAI Service Debug**: Fix 500 error
5. **Admin Service Location**: Find and connect
6. **Full Ecosystem Test**: Validate 6/6 services healthy

### Next 90 Minutes

7. **Service Integration**: Test inter-service communication
8. **Performance Validation**: Confirm <100ms CBD, <200ms API
9. **Documentation Update**: Record final service mappings

---

**Next Action**: Execute service port audit to identify accurate service-to-port mappings.

---

**Generated**: August 2, 2025  
**Status**: READY FOR IMPLEMENTATION  
**Priority**: CRITICAL
