#!/bin/bash

# Generate self-signed certificates for local development
# Run this script to create SSL certificates for HTTPS development

set -e

echo "🔐 Generating SSL certificates for local development..."

# Create certificates directory if it doesn't exist
mkdir -p ./infrastructure/ssl

# Generate private key
openssl genrsa -out ./infrastructure/ssl/localhost.key 2048

# Generate certificate signing request
openssl req -new -key ./infrastructure/ssl/localhost.key -out ./infrastructure/ssl/localhost.csr -config <(
cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C=US
ST=Development
L=Local
O=CodAI Development
CN=localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = codai.local
DNS.3 = memorai.local
DNS.4 = logai.local
DNS.5 = bancai.local
DNS.6 = *.local
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
)

# Generate self-signed certificate
openssl x509 -req -in ./infrastructure/ssl/localhost.csr -signkey ./infrastructure/ssl/localhost.key -out ./infrastructure/ssl/localhost.crt -days 365 -extensions v3_req -extfile <(
cat <<EOF
[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = codai.local
DNS.3 = memorai.local
DNS.4 = logai.local
DNS.5 = bancai.local
DNS.6 = *.local
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
)

# Clean up CSR file
rm ./infrastructure/ssl/localhost.csr

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates location: ./infrastructure/ssl/"
echo "🔑 Private key: localhost.key"
echo "📜 Certificate: localhost.crt"
echo ""
echo "🚨 Note: These are self-signed certificates for development only!"
echo "   Browsers will show security warnings - this is expected."
