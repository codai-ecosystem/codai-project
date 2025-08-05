# 🌐 CODAI Vercel DNS Configuration Guide

## Overview
Configure Vercel DNS records to enable AWS SSL certificate validation and subdomain routing.

## Current Status
- ✅ Domain: `codai.ro` 
- ✅ Nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- ✅ AWS ALB: `codai-alb-prod-348122537.us-east-1.elb.amazonaws.com`
- ⏳ SSL Certificate: Pending validation

## Required DNS Records in Vercel

### 1. SSL Certificate Validation (CRITICAL)
```
Type: CNAME
Name: _53ae83bd7c62c9a3ba720c1daef04f0e
Value: _cdf0bc9c4d14f8a298a72222503b451e.xlfgrmvvlj.acm-validations.aws.
TTL: 300 (5 minutes)
```

### 2. Backend API Subdomains
```
Type: CNAME
Name: api
Value: codai-alb-prod-348122537.us-east-1.elb.amazonaws.com
TTL: 300

Type: CNAME
Name: gateway  
Value: codai-alb-prod-348122537.us-east-1.elb.amazonaws.com
TTL: 300

Type: CNAME
Name: admin
Value: codai-alb-prod-348122537.us-east-1.elb.amazonaws.com
TTL: 300

Type: CNAME
Name: apps
Value: codai-alb-prod-348122537.us-east-1.elb.amazonaws.com
TTL: 300

Type: CNAME
Name: docs
Value: codai-alb-prod-348122537.us-east-1.elb.amazonaws.com
TTL: 300
```

## Step-by-Step Instructions

### Step 1: Access Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Domains**
3. Click on `codai.ro` domain

### Step 2: Add SSL Validation Record (PRIORITY 1)
1. Click **DNS Records** tab
2. Click **Add Record**
3. Select **CNAME**
4. **Name:** `_53ae83bd7c62c9a3ba720c1daef04f0e`
5. **Value:** `_cdf0bc9c4d14f8a298a72222503b451e.xlfgrmvvlj.acm-validations.aws.`
6. **TTL:** `300`
7. Click **Save**

### Step 3: Add Subdomain Records
For each subdomain (api, gateway, admin, apps, docs):
1. Click **Add Record**
2. Select **CNAME**
3. **Name:** `[subdomain]` (e.g., `api`)
4. **Value:** `codai-alb-prod-348122537.us-east-1.elb.amazonaws.com`
5. **TTL:** `300`
6. Click **Save**

### Step 4: Verify Configuration
After adding all records, verify with:
```bash
# Check SSL validation record
nslookup -type=CNAME _53ae83bd7c62c9a3ba720c1daef04f0e.codai.ro

# Check subdomain records
nslookup api.codai.ro
nslookup gateway.codai.ro
```

## Expected Results
- ✅ SSL certificate validation should complete within 15 minutes
- ✅ Subdomains should resolve to AWS ALB
- ✅ Backend services accessible via custom domains
- ✅ CloudFront deployment can proceed

## Next Steps
Once DNS records are configured and propagated:
1. Wait for SSL certificate validation (monitor in AWS ACM)
2. Deploy CloudFront distributions with validated certificates
3. Update service configurations to use custom domains
4. Test end-to-end connectivity

## Troubleshooting
- **SSL validation fails:** Ensure CNAME record is exact (copy-paste recommended)
- **Subdomains don't resolve:** Check TTL and wait for propagation (up to 24 hours)
- **Mixed content errors:** Ensure all services use HTTPS

## Timeline
- DNS record addition: 5 minutes
- DNS propagation: 5-60 minutes  
- SSL validation: 15-30 minutes
- CloudFront deployment: 10-20 minutes
