# 🌐 CBD Universal Database - Domain Configuration Plan

## 🎯 Current Status
- **Cloud Deployment**: ✅ ACTIVE (2 ECS tasks running)
- **Access Method**: Direct public IP addresses on port 4180
- **Domain Configuration**: ❌ **NOT CONFIGURED**
- **SSL/HTTPS**: ❌ **NOT CONFIGURED**

## 🚀 Domain Configuration Implementation Plan

### Phase 1: Application Load Balancer Setup (15 minutes)
1. **Create Application Load Balancer**
   - Internet-facing ALB in public subnets
   - Health checks on /health endpoint
   - Target group for ECS tasks

2. **Update Security Groups**
   - ALB security group: Allow HTTP (80) and HTTPS (443)
   - ECS security group: Allow traffic from ALB only

### Phase 2: SSL Certificate & Domain (10 minutes)
1. **Request SSL Certificate**
   - AWS Certificate Manager
   - Domain validation
   - Wildcard certificate for subdomains

2. **Choose Domain Strategy**
   - **Option A**: Custom domain (cbd-universal.com)
   - **Option B**: Subdomain (cbd.codai-ecosystem.com)
   - **Option C**: AWS-provided subdomain

### Phase 3: DNS Configuration (5 minutes)
1. **Route 53 Hosted Zone**
   - Create or use existing hosted zone
   - A record pointing to ALB
   - CNAME for www subdomain

### Phase 4: ECS Service Integration (10 minutes)
1. **Update ECS Service**
   - Attach to ALB target group
   - Remove public IP assignment
   - Private subnet deployment

## 🛠️ Implementation Commands

### Step 1: Create Application Load Balancer
```bash
# Create target group
aws elbv2 create-target-group \
  --name cbd-universal-targets \
  --protocol HTTP \
  --port 4180 \
  --vpc-id vpc-094aaefb826f8b037 \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 5

# Create load balancer
aws elbv2 create-load-balancer \
  --name cbd-universal-alb \
  --subnets subnet-08b70df2cac5f7c59 subnet-0618a5c81a0970af9 \
  --security-groups sg-[ALB-SG-ID] \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4
```

### Step 2: SSL Certificate Request
```bash
# Request SSL certificate
aws acm request-certificate \
  --domain-name cbd.codai-ecosystem.com \
  --subject-alternative-names *.cbd.codai-ecosystem.com \
  --validation-method DNS \
  --region eu-west-1
```

### Step 3: Create DNS Records
```bash
# Create Route 53 record
aws route53 change-resource-record-sets \
  --hosted-zone-id Z[ZONE-ID] \
  --change-batch file://dns-change-batch.json
```

## 🌐 Proposed Domain Architecture

```
                    ┌─────────────────────────────────┐
                    │         Internet Users         │
                    └─────────────────────────────────┘
                                     │
                         HTTPS (Port 443) / HTTP (Port 80)
                                     │
                    ┌─────────────────────────────────┐
                    │  Application Load Balancer      │
                    │  (cbd.codai-ecosystem.com)      │
                    │  - SSL Termination              │
                    │  - Health Checks                │
                    │  - Traffic Distribution         │
                    └─────────────────────────────────┘
                                     │
                            Internal Traffic (Port 4180)
                                     │
          ┌─────────────────────────────────────────────────────┐
          │              ECS Fargate Cluster                    │
          │               (Private Subnets)                     │
          │                                                     │
          │  ┌───────────────┐           ┌───────────────┐      │
          │  │  CBD Task 1   │           │  CBD Task 2   │      │
          │  │  (Running)    │           │  (Running)    │      │
          │  │  Port: 4180   │           │  Port: 4180   │      │
          │  └───────────────┘           └───────────────┘      │
          └─────────────────────────────────────────────────────┘
```

## 🔒 Enhanced Security Configuration

### Load Balancer Security Group
```json
{
  "SecurityGroupRules": [
    {
      "IpProtocol": "tcp",
      "FromPort": 80,
      "ToPort": 80,
      "CidrIpv4": "0.0.0.0/0"
    },
    {
      "IpProtocol": "tcp", 
      "FromPort": 443,
      "ToPort": 443,
      "CidrIpv4": "0.0.0.0/0"
    }
  ]
}
```

### ECS Security Group (Updated)
```json
{
  "SecurityGroupRules": [
    {
      "IpProtocol": "tcp",
      "FromPort": 4180,
      "ToPort": 4180,
      "SourceSecurityGroupId": "sg-[ALB-SG-ID]"
    }
  ]
}
```

## 📊 Domain Options Analysis

### Option A: Custom Domain (cbd-universal.com)
- **Pros**: Professional, brandable, full control
- **Cons**: Requires domain purchase (~$12/year)
- **Setup Time**: 15-30 minutes (domain propagation)
- **Cost**: ~$12/year + Route 53 costs

### Option B: Subdomain (cbd.codai-ecosystem.com)
- **Pros**: Uses existing domain, professional
- **Cons**: Requires access to codai-ecosystem.com DNS
- **Setup Time**: 5-10 minutes
- **Cost**: Only Route 53 costs (~$1/month)

### Option C: AWS ALB Subdomain
- **Pros**: Free, immediate availability
- **Cons**: Long, unmemorable URL
- **Setup Time**: 5 minutes
- **Example**: cbd-universal-alb-123456789.eu-west-1.elb.amazonaws.com

## 🎯 Recommended Implementation

### Phase 1: Quick Setup (ALB + AWS Domain)
```bash
# Create ALB and get AWS-provided domain immediately
# Access: https://cbd-universal-alb-[random].eu-west-1.elb.amazonaws.com
```

### Phase 2: Custom Domain (Optional)
```bash
# Add custom domain after ALB is working
# Access: https://cbd.codai-ecosystem.com
```

## 💰 Additional Costs for Domain Setup

### Load Balancer Costs
- **Application Load Balancer**: ~$20-25/month
- **Data Processing**: ~$0.008 per GB processed
- **Target Group**: No additional charge

### SSL Certificate
- **AWS Certificate Manager**: FREE for AWS resources
- **Automatic renewal**: FREE

### DNS Costs
- **Route 53 Hosted Zone**: $0.50/month
- **DNS Queries**: $0.50 per million queries

### Total Additional Monthly Cost
- **With ALB**: ~$21-26/month additional
- **Total Project Cost**: ~$82-118/month (vs current ~$61-92/month)

## ✅ Success Criteria

### Functional Requirements
- [ ] Custom domain resolving to CBD service
- [ ] HTTPS with valid SSL certificate
- [ ] HTTP to HTTPS redirect
- [ ] Load balancer health checks passing
- [ ] DNS propagation complete

### Performance Requirements
- [ ] SSL handshake < 100ms
- [ ] DNS resolution < 50ms
- [ ] Load balancer response time < 10ms additional
- [ ] Health checks every 30 seconds

### Security Requirements
- [ ] TLS 1.2+ only
- [ ] HSTS headers configured
- [ ] Private subnet deployment
- [ ] WAF integration ready

## 🚀 Execution Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **ALB Setup** | 15 min | Create ALB, target group, security groups |
| **SSL Certificate** | 10 min | Request and validate certificate |
| **DNS Configuration** | 10 min | Create Route 53 records |
| **ECS Integration** | 15 min | Update service, test connectivity |
| **Testing & Validation** | 10 min | End-to-end testing |
| **Total** | **60 min** | **Complete domain setup** |

---

**Status**: 🔄 READY TO IMPLEMENT
**Recommended Option**: Start with ALB + AWS domain, then add custom domain
**Priority**: High (Production systems need proper domains)
**Next Step**: Create Application Load Balancer
