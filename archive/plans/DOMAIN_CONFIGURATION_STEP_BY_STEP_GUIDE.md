# 🎯 STEP-BY-STEP DOMAIN CONFIGURATION GUIDE

## 🚨 CURRENT WRONG CONFIGURATION CONFIRMED:

✅ **DNS Status Check Complete:**
- `api.codai.ro` → **aba0948c8ba14480982393668b20b88d-1205655413.eu-west-1.elb.amazonaws.com** (MemorAI infrastructure!)
- `gateway.codai.ro` → **216.150.16.1, 216.150.1.193** (Vercel edge servers)

❌ **Both domains are pointing to WRONG infrastructure!**

## 🎯 TARGET CONFIGURATION:

We need to point these domains to our CloudFront distributions:
- `api.codai.ro` → **d2x86rdq8c5dt7.cloudfront.net** (Our API CloudFront)
- `gateway.codai.ro` → **d1k9pj62mdieu1.cloudfront.net** (Our Gateway CloudFront)

---

## 📋 STEP 1: VERCEL DNS CONFIGURATION (5 minutes)

### Go to Vercel Dashboard → Domains → codai.ro → DNS Records

**UPDATE these DNS records:**

### 1. Update API Domain:
- **Find existing record**: `api.codai.ro`
- **Current Target**: `aba0948c8ba14480982393668b20b88d-1205655413.eu-west-1.elb.amazonaws.com`
- **Change To**: `d2x86rdq8c5dt7.cloudfront.net`
- **Type**: CNAME

### 2. Update Gateway Domain:
- **Find existing record**: `gateway.codai.ro`
- **Current Target**: Points to Vercel IPs
- **Change To**: `d1k9pj62mdieu1.cloudfront.net`
- **Type**: CNAME

### 3. Verify Other Records Stay Same:
Keep these as they are:
- `_acme-challenge.api.codai.ro` → SSL validation record
- `_acme-challenge.gateway.codai.ro` → SSL validation record
- `@` CAA record → `0 issue amazon.com`

---

## 📋 STEP 2: ADD FRONTEND DOMAIN MAPPINGS (10 minutes)

### Go to Vercel Dashboard → Projects

### 2.1 CODAI Main App:
1. **Go to**: CODAI project → Settings → Domains
2. **Add Domain**: `codai.ro`
3. **Configure**: Point to main CODAI app deployment

### 2.2 Admin Dashboard:
1. **Go to**: Admin Dashboard project → Settings → Domains  
2. **Add Domain**: `admin.codai.ro`
3. **Configure**: Point to admin dashboard deployment

### 2.3 Apps Showcase:
1. **Go to**: Apps project → Settings → Domains
2. **Add Domain**: `apps.codai.ro`
3. **Configure**: Point to apps showcase deployment

---

## 📋 STEP 3: VALIDATION CHECKLIST

After completing Steps 1-2, we'll verify:

### DNS Propagation Check:
```bash
nslookup api.codai.ro
# Should show: d2x86rdq8c5dt7.cloudfront.net

nslookup gateway.codai.ro  
# Should show: d1k9pj62mdieu1.cloudfront.net
```

### HTTPS Access Check:
```bash
curl -I https://api.codai.ro
# Should return 200 from CloudFront

curl -I https://gateway.codai.ro
# Should return 200 from CloudFront
```

---

## 🚨 IMPORTANT NOTES:

1. **DNS Propagation**: Changes take 5-15 minutes to propagate
2. **SSL Certificates**: We'll use CloudFront default certificates initially
3. **CORS Configuration**: I'll update backend automatically after DNS changes
4. **API Endpoints**: Frontend apps will be updated to use `api.codai.ro`

---

## 🎯 READY TO START?

**Please confirm you're ready, then:**

1. **Open Vercel Dashboard** → Domains → codai.ro → DNS Records
2. **Find the two records** mentioned above
3. **Tell me when you're ready** and I'll guide you through each change step-by-step

**Are you ready to start with Step 1 (DNS updates)?** 🚀
