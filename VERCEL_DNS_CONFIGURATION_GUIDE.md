# Vercel DNS Configuration Guide for CODAI Ecosystem

## Overview

This guide provides step-by-step instructions to configure Vercel DNS for all CODAI ecosystem domains to point to the AWS EKS load balancer.

## Prerequisites

- EKS cluster deployed and running
- NGINX Ingress Controller installed
- Load balancer external IP address available

## Step 1: Get Load Balancer IP Address

After the EKS cluster is ready and services are deployed, get the external IP:

```bash
kubectl get service nginx-ingress-controller -n ingress-nginx
```

Look for the `EXTERNAL-IP` column - this will be your load balancer address.

## Step 2: Vercel DNS Records Configuration

Log into your Vercel dashboard and configure these DNS records:

### A Records (Point to Load Balancer IP)

| Name  | Type | Value                | TTL |
| ----- | ---- | -------------------- | --- |
| @     | A    | `<LOAD_BALANCER_IP>` | 300 |
| api   | A    | `<LOAD_BALANCER_IP>` | 300 |
| id    | A    | `<LOAD_BALANCER_IP>` | 300 |
| auth  | A    | `<LOAD_BALANCER_IP>` | 300 |
| hub   | A    | `<LOAD_BALANCER_IP>` | 300 |
| admin | A    | `<LOAD_BALANCER_IP>` | 300 |
| docs  | A    | `<LOAD_BALANCER_IP>` | 300 |

### Domain-Specific Records

#### CODAI.RO

```
api.codai.ro      A    <LOAD_BALANCER_IP>
id.codai.ro       A    <LOAD_BALANCER_IP>
auth.codai.ro     A    <LOAD_BALANCER_IP>
hub.codai.ro      A    <LOAD_BALANCER_IP>
admin.codai.ro    A    <LOAD_BALANCER_IP>
docs.codai.ro     A    <LOAD_BALANCER_IP>
www.codai.ro      A    <LOAD_BALANCER_IP>
```

#### MEMORAI.RO

```
memorai.ro        A    <LOAD_BALANCER_IP>
mcp.memorai.ro    A    <LOAD_BALANCER_IP>
cbd.memorai.ro    A    <LOAD_BALANCER_IP>
api.memorai.ro    A    <LOAD_BALANCER_IP>
docs.memorai.ro   A    <LOAD_BALANCER_IP>
www.memorai.ro    A    <LOAD_BALANCER_IP>
```

#### CONTROLAI.RO

```
controlai.ro      A    <LOAD_BALANCER_IP>
mcp.controlai.ro  A    <LOAD_BALANCER_IP>
api.controlai.ro  A    <LOAD_BALANCER_IP>
docs.controlai.ro A    <LOAD_BALANCER_IP>
www.controlai.ro  A    <LOAD_BALANCER_IP>
```

#### ROMAI.RO

```
romai.ro          A    <LOAD_BALANCER_IP>
mcp.romai.ro      A    <LOAD_BALANCER_IP>
api.romai.ro      A    <LOAD_BALANCER_IP>
docs.romai.ro     A    <LOAD_BALANCER_IP>
www.romai.ro      A    <LOAD_BALANCER_IP>
```

## Step 3: Verification

After configuring DNS records, verify they're working:

```bash
# Check DNS resolution
nslookup api.codai.ro
nslookup memorai.ro
nslookup controlai.ro
nslookup romai.ro

# Test HTTP response
curl -I http://api.codai.ro
curl -I https://memorai.ro
```

## Step 4: SSL Certificate Verification

Cert-manager will automatically provision SSL certificates for all domains. Check certificate status:

```bash
kubectl get certificates -A
kubectl describe certificate codai-ro-tls
```

## DNS Propagation Notes

- DNS changes typically propagate within 5-15 minutes
- TTL is set to 300 seconds (5 minutes) for faster updates
- Use online DNS checkers to verify global propagation:
  - whatsmydns.net
  - dnschecker.org

## Troubleshooting

### DNS Not Resolving

1. Check TTL settings in Vercel
2. Verify load balancer IP is correct
3. Use `dig` or `nslookup` to test resolution

### SSL Certificate Issues

1. Check cert-manager logs: `kubectl logs -n cert-manager deployment/cert-manager`
2. Verify cluster issuer: `kubectl get clusterissuer letsencrypt-prod`
3. Check certificate status: `kubectl describe certificate <cert-name>`

### Load Balancer Issues

1. Verify NGINX ingress is running: `kubectl get pods -n ingress-nginx`
2. Check service status: `kubectl get svc -n ingress-nginx`
3. Review ingress configuration: `kubectl describe ingress codai-ecosystem-ingress`

## Advanced Configuration

### Custom Headers

Add these annotations to ingress for security:

```yaml
nginx.ingress.kubernetes.io/configuration-snippet: |
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-Content-Type-Options "nosniff";
  add_header X-XSS-Protection "1; mode=block";
```

### Rate Limiting

```yaml
nginx.ingress.kubernetes.io/rate-limit: '100'
nginx.ingress.kubernetes.io/rate-limit-window: '1m'
```

## Monitoring

Set up monitoring for DNS and SSL:

```bash
# Monitor certificate expiration
kubectl get certificates -A -o custom-columns="NAMESPACE:.metadata.namespace,NAME:.metadata.name,READY:.status.conditions[?(@.type==\"Ready\")].status,EXPIRY:.status.notAfter"

# Check ingress health
kubectl get ingress -A
```

## Backup DNS Configuration

Document your current Vercel DNS settings before making changes:

```bash
# Export current DNS records (manual documentation)
# Keep a record of:
# - Current A records
# - CNAME records
# - MX records
# - TXT records
```

This ensures you can rollback if needed.

## Contact Information

For support with this configuration:

- Review AWS EKS documentation
- Check NGINX Ingress Controller docs
- Consult cert-manager troubleshooting guides
- Monitor cluster logs for issues

## Post-Deployment Checklist

- [ ] All A records configured in Vercel
- [ ] DNS resolution verified for all domains
- [ ] SSL certificates issued and valid
- [ ] HTTP redirects to HTTPS working
- [ ] All services responding correctly
- [ ] Monitoring and logging configured
- [ ] Backup and disaster recovery plan documented
