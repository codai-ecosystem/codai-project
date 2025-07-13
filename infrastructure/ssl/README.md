# SSL Certificates for Local Development

This directory contains SSL certificates for HTTPS development of the CodAI ecosystem.

## Files

- `localhost.key` - Private key for SSL certificate
- `localhost.crt` - Self-signed SSL certificate

## Domains Covered

The certificate includes the following domains:
- `localhost`
- `codai.local`
- `memorai.local`
- `logai.local`
- `bancai.local`
- `*.local` (wildcard for all .local domains)

## IP Addresses

- `127.0.0.1` (IPv4 localhost)
- `::1` (IPv6 localhost)

## Generating Certificates

To regenerate the certificates, run:

```bash
chmod +x scripts/generate-ssl-certs.sh
./scripts/generate-ssl-certs.sh
```

## Security Note

⚠️ **These are self-signed certificates for development only!**

- Browsers will show security warnings
- Do not use these certificates in production
- They are valid for 365 days from generation

## Adding to Hosts File

For local domain testing, add these entries to your hosts file:

### Windows (`C:\Windows\System32\drivers\etc\hosts`)
```
127.0.0.1 codai.local
127.0.0.1 memorai.local
127.0.0.1 logai.local
127.0.0.1 bancai.local
```

### Linux/macOS (`/etc/hosts`)
```
127.0.0.1 codai.local
127.0.0.1 memorai.local
127.0.0.1 logai.local
127.0.0.1 bancai.local
```
