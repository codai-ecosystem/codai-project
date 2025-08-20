# CBD SSL Certificate Setup - Independent Solution

## 🔒 Cloud-Independent SSL for CBD Universal Database

This solution provides **completely independent SSL certificate management** without depending on cloud providers like Cloudflare, AWS Certificate Manager, or other external services.

### ✅ What's Included

- **Let's Encrypt Integration**: Free, automated SSL certificates
- **Cross-Platform Support**: Linux, Windows, and macOS scripts
- **Auto-Renewal**: Automatic certificate renewal with cron/scheduled tasks
- **Nginx Proxy**: Production-ready reverse proxy configuration
- **ACME Challenge Handling**: Built-in HTTP-01 challenge support
- **Zero Cloud Dependencies**: No external services required

---

## 🚀 Quick Start

### Option 1: Linux/Ubuntu (Recommended)

```bash
# Make script executable
chmod +x setup-ssl-independent.sh

# Run as root (uses sudo internally)
sudo ./setup-ssl-independent.sh
```

### Option 2: Windows PowerShell

```powershell
# Run as Administrator
PowerShell -ExecutionPolicy Bypass -File setup-ssl-windows.ps1
```

### Option 3: Node.js SSL Manager

```bash
# Install dependencies
npm install

# Start SSL manager
npm run start

# Request SSL certificate
npm run ssl:request

# Check status
npm run ssl:status
```

---

## 📋 Prerequisites

### For Linux:
- Ubuntu 20.04+ or similar
- Root access (sudo)
- Port 80 and 443 available
- CBD service running on port 4180

### For Windows:
- Windows 10/11 or Windows Server 2019+
- PowerShell 5.1+ (Administrator)
- .NET Framework 4.7.2+
- CBD service running on port 4180

### DNS Requirements:
- Domain `cbd.memorai.ro` pointing to your server IP
- Port 80 accessible from internet (for ACME challenge)

---

## 🔧 How It Works

### 1. **ACME Challenge Setup**
- Creates web root directory for Let's Encrypt challenges
- Configures HTTP server to serve challenge files
- Handles HTTP-01 validation automatically

### 2. **Certificate Request**
- Uses Certbot to request certificate from Let's Encrypt
- Validates domain ownership via HTTP challenge
- Stores certificate files securely

### 3. **HTTPS Configuration**
- Configures Nginx as reverse proxy
- Sets up HTTPS with security headers
- Redirects HTTP to HTTPS automatically

### 4. **Auto-Renewal**
- Sets up cron job (Linux) or scheduled task (Windows)
- Renews certificates automatically before expiration
- Reloads web server configuration after renewal

---

## 📁 File Structure

```
packages/cbd/
├── cbd-ssl-manager.js          # Node.js SSL manager
├── setup-ssl-independent.sh   # Linux setup script
├── setup-ssl-windows.ps1      # Windows setup script
├── ssl-package.json           # NPM package configuration
├── ssl-challenges/            # ACME challenge directory
│   └── .well-known/
│       └── acme-challenge/
└── README-SSL.md             # This file
```

---

## 🌐 Access URLs After Setup

- **HTTP**: `http://cbd.memorai.ro` (redirects to HTTPS)
- **HTTPS**: `https://cbd.memorai.ro`
- **Health Check**: `https://cbd.memorai.ro/health`
- **Stats**: `https://cbd.memorai.ro/stats`
- **API Endpoints**: All CBD API endpoints via HTTPS

---

## 🔍 Verification Commands

### Linux:
```bash
# Check certificate status
sudo certbot certificates

# Test certificate renewal
sudo certbot renew --dry-run

# Check Nginx status
sudo systemctl status nginx

# Test HTTPS access
curl -I https://cbd.memorai.ro/health
```

### Windows:
```powershell
# Check certificate status
C:\Certbot\bin\certbot.exe certificates

# Test certificate renewal
C:\Certbot\bin\certbot.exe renew --dry-run

# Test HTTPS access
Invoke-RestMethod -Uri "https://cbd.memorai.ro/health"
```

### Universal:
```bash
# Test SSL certificate
openssl s_client -connect cbd.memorai.ro:443 -servername cbd.memorai.ro

# Check certificate expiration
echo | openssl s_client -connect cbd.memorai.ro:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔄 Auto-Renewal Setup

### Linux (Automatic):
- Cron jobs created in `/etc/cron.d/cbd-ssl-renewal`
- Runs twice daily at random times
- Automatically reloads Nginx after renewal

### Windows (Automatic):
- Scheduled task "CBD-SSL-Renewal" created
- Runs daily at 2:00 AM
- Logs renewal attempts to `ssl-renewal.log`

### Manual Renewal:
```bash
# Linux
sudo certbot renew

# Windows
C:\Certbot\bin\certbot.exe renew
```

---

## 🔒 Security Features

### SSL/TLS Configuration:
- **TLS 1.2 and 1.3** only
- **Strong cipher suites** (ECDHE-based)
- **Perfect Forward Secrecy** enabled
- **Session resumption** for performance

### Security Headers:
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

### Certificate Management:
- **90-day validity** with auto-renewal at 60 days
- **RSA 2048-bit** or **ECDSA P-256** keys
- **Chain of trust** validation
- **OCSP stapling** support

---

## 🛠️ Troubleshooting

### Common Issues:

#### 1. Certificate Request Failed
```bash
# Check domain resolution
nslookup cbd.memorai.ro

# Check port 80 accessibility
curl -I http://cbd.memorai.ro/.well-known/acme-challenge/test

# Check Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

#### 2. HTTPS Not Working
```bash
# Test Nginx configuration
sudo nginx -t

# Check SSL certificate
sudo certbot certificates

# Verify certificate files
ls -la /etc/letsencrypt/live/cbd.memorai.ro/
```

#### 3. Auto-Renewal Not Working
```bash
# Test renewal process
sudo certbot renew --dry-run

# Check cron logs
sudo tail -f /var/log/cron

# Manual renewal test
sudo certbot renew --force-renewal
```

### Debug Commands:
```bash
# Detailed SSL test
curl -vvv https://cbd.memorai.ro/health

# Check certificate chain
openssl s_client -connect cbd.memorai.ro:443 -showcerts

# Verify ACME challenge directory
ls -la /var/www/cbd-ssl/.well-known/acme-challenge/
```

---

## 📊 Monitoring & Maintenance

### Certificate Monitoring:
```bash
# Check expiration date
openssl x509 -in /etc/letsencrypt/live/cbd.memorai.ro/cert.pem -noout -dates

# Check certificate details
openssl x509 -in /etc/letsencrypt/live/cbd.memorai.ro/cert.pem -noout -text
```

### Log Monitoring:
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Performance Monitoring:
```bash
# Test response time
time curl -s https://cbd.memorai.ro/health > /dev/null

# SSL handshake time
curl -w "@curl-format.txt" -o /dev/null -s https://cbd.memorai.ro/health
```

---

## 🎯 Production Deployment

### Pre-Deployment Checklist:
- [ ] Domain DNS pointing to server IP
- [ ] Port 80 and 443 open in firewall
- [ ] CBD service running and accessible
- [ ] Backup existing configurations
- [ ] Test certificate request in staging

### Post-Deployment Verification:
- [ ] HTTPS certificate valid and trusted
- [ ] HTTP redirects to HTTPS properly
- [ ] All CBD endpoints accessible via HTTPS
- [ ] Auto-renewal scheduled and tested
- [ ] Security headers present
- [ ] Performance within acceptable limits

---

## 🌟 Benefits of This Solution

### ✅ **Complete Independence**
- No dependency on cloud providers
- Full control over certificate lifecycle
- No vendor lock-in

### ✅ **Cost Effective**
- Free SSL certificates from Let's Encrypt
- No monthly/yearly certificate fees
- Automated renewal reduces maintenance

### ✅ **Production Ready**
- Battle-tested Nginx configuration
- Comprehensive security headers
- Monitoring and logging included

### ✅ **Scalable**
- Easy to extend to multiple domains
- Can handle high traffic loads
- Simple to replicate across environments

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks:
1. **Monthly**: Check certificate expiration dates
2. **Quarterly**: Review SSL configuration and security headers
3. **Annually**: Update Certbot and review renewal scripts

### Emergency Procedures:
1. **Certificate Expired**: Force renewal with `--force-renewal`
2. **Service Down**: Check Nginx status and CBD service
3. **Domain Issues**: Verify DNS and port accessibility

---

## 🎉 Success Indicators

After successful setup, you should see:

✅ **HTTPS Access**: `https://cbd.memorai.ro` loads without warnings  
✅ **Automatic Redirect**: `http://cbd.memorai.ro` redirects to HTTPS  
✅ **Green Lock**: Browser shows secure connection indicator  
✅ **Certificate Valid**: 90-day Let's Encrypt certificate installed  
✅ **Auto-Renewal**: Scheduled task running for automatic renewal  
✅ **All Endpoints**: CBD API accessible via HTTPS  

Your CBD Universal Database is now fully secured with independent SSL! 🔒🎯
