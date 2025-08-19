# 🌐 Vercel DNS Configuration Guide for MemorAI

## Overview
Configure Vercel DNS to route your custom domains to AWS backend infrastructure while keeping Vercel nameservers.

## Configuration Steps

### 1. Access Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Find your `memorai.ro` domain
3. Click on the domain name
4. Navigate to "DNS" or "DNS Records" tab

### 2. Add CNAME Records

#### API Service Record
```
Type: CNAME
Name: api
Value: memorai-alb-prod-2014965749.eu-central-1.elb.amazonaws.com
TTL: 300 (or Auto)
```

#### MCP Service Record
```
Type: CNAME
Name: mcp
Value: memorai-alb-prod-2014965749.eu-central-1.elb.amazonaws.com
TTL: 300 (or Auto)
```

### 3. SSL Configuration
- **Automatic**: Vercel will automatically provision SSL certificates
- **Timeline**: 1-5 minutes after DNS propagation
- **Status**: Check SSL status in domain settings

### 4. Verification Commands

After 5-10 minutes of adding the records:

```bash
# Test DNS resolution
nslookup api.memorai.ro
nslookup mcp.memorai.ro

# Test endpoints
curl https://api.memorai.ro/api/health
curl https://mcp.memorai.ro/health
```

### 5. Expected Results

#### API Health Endpoint
```json
{
  "status": "operational",
  "service": "memorai-api",
  "version": "1.0.0",
  "timestamp": "2025-08-08T12:00:00.000Z"
}
```

#### MCP Health Endpoint
```json
{
  "status": "healthy",
  "service": "memorai-mcp-enterprise",
  "version": "2.0.0-enterprise-rust",
  "features": ["vectorSearch", "hybridSearch", "analytics", ...]
}
```

## Backend Infrastructure Status

✅ **AWS ECS Cluster**: memorai-cluster-prod (Running)  
✅ **Application Load Balancer**: memorai-alb-prod-2014965749.eu-central-1.elb.amazonaws.com  
✅ **API Service**: 2 healthy tasks running  
✅ **MCP Service**: 1 healthy task running  
✅ **Health Checks**: All passing  

## Troubleshooting

### DNS Not Resolving
- Wait up to 30 minutes for global DNS propagation
- Clear local DNS cache: `ipconfig /flushdns`
- Test with different DNS servers: `nslookup api.memorai.ro 8.8.8.8`

### SSL Certificate Issues
- Vercel SSL provisioning can take up to 24 hours in rare cases
- Check domain SSL status in Vercel dashboard
- Ensure CNAME records are correctly configured

### Service Unreachable
- Verify AWS ALB is healthy: http://memorai-alb-prod-2014965749.eu-central-1.elb.amazonaws.com/api/health
- Check ECS service status in AWS console
- Verify target group health in AWS ALB settings

## Integration Benefits

🔗 **Best of Both Worlds**:
- Vercel DNS management and SSL automation
- AWS backend scalability and enterprise features
- Simple CNAME configuration without nameserver changes
- Automatic SSL certificate provisioning and renewal

## Next Steps

After successful configuration:
1. Update application configurations to use new domains
2. Test all API endpoints thoroughly
3. Monitor performance and SSL certificate status
4. Configure CDN caching if needed (via Vercel or CloudFlare)

---

**Domain Configuration**: Vercel DNS + AWS Backend  
**SSL Provider**: Vercel (Automatic)  
**Backend**: AWS ECS Fargate + ALB  
**Status**: Ready for Production  
