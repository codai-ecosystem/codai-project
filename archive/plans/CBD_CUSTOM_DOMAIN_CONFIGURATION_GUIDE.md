# 🌐 CBD Custom Domain Configuration Guide
## Configuring cbd.memorai.ro with Vercel DNS

### ✅ Phase 1: SSL Certificate Requested
**Certificate ARN**: `arn:aws:acm:eu-west-1:567877624442:certificate/43ff9d2f-f79f-41dd-a1b6-1d43392cac00`
**Status**: PENDING_VALIDATION

### 🔧 Phase 2: DNS Validation Required (VERCEL DNS SETUP)

**CRITICAL**: You need to add the following DNS record in your Vercel DNS settings for `memorai.ro`:

#### DNS Record to Add in Vercel:
```
Type: CNAME
Name: _f33b15311ff6d15d59c8c2bf5e701e4d.cbd
Value: _54944bed2272cb5191e4a927fe00661a.xlfgrmvvlj.acm-validations.aws.
TTL: 300 (5 minutes)
```

#### Step-by-Step Vercel DNS Configuration:
1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Navigate to your domain**: Find `memorai.ro` in your domains list
3. **Click "Manage"** or "DNS Settings"
4. **Add new DNS record**:
   - **Type**: CNAME
   - **Name**: `_f33b15311ff6d15d59c8c2bf5e701e4d.cbd`
   - **Value**: `_54944bed2272cb5191e4a927fe00661a.xlfgrmvvlj.acm-validations.aws.`
   - **TTL**: 300 seconds

### 📋 Phase 3: Main Domain CNAME (Add After Certificate Validation)
Once the SSL certificate is validated, you'll also need to add this record:

```
Type: CNAME
Name: cbd
Value: cbd-universal-alb-1527097302.eu-west-1.elb.amazonaws.com
TTL: 300
```

### 🎯 Expected Timeline:
1. **DNS Propagation**: 5-15 minutes after adding validation record
2. **Certificate Validation**: 2-30 minutes after DNS propagation
3. **ALB HTTPS Configuration**: 2-5 minutes (automated)
4. **Final Domain Access**: `https://cbd.memorai.ro`

### 🔍 Current Infrastructure:
- **ALB Endpoint**: `cbd-universal-alb-1527097302.eu-west-1.elb.amazonaws.com`
- **ECS Service**: Running 2 tasks
- **SSL Certificate**: Pending validation
- **Health Checks**: ✅ Passing

### ⚡ Next Steps:
1. **Add DNS validation record in Vercel** (priority)
2. Wait for certificate validation
3. Configure ALB HTTPS listener
4. Add main domain CNAME record
5. Test HTTPS connectivity

---
**Status**: Waiting for DNS validation record to be added in Vercel DNS
