#!/bin/bash

# SSL Certificate Generation Script
# This script generates self-signed SSL certificates for development and testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="$SCRIPT_DIR/ssl"
CERTS_DIR="$SSL_DIR/certs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 SSL Certificate Generation Script${NC}"
echo "=================================="

# Create directories
mkdir -p "$CERTS_DIR"

# Certificate configuration
COUNTRY="US"
STATE="State"
CITY="City"
ORG="Organization"
OU="IT Department"
CN="localhost"
EMAIL="admin@localhost"

# Check if certificates already exist
if [ -f "$CERTS_DIR/server.crt" ] && [ -f "$CERTS_DIR/server.key" ]; then
    echo -e "${YELLOW}⚠️  SSL certificates already exist!${NC}"
    read -p "Do you want to regenerate them? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Using existing certificates${NC}"
        exit 0
    fi
fi

echo -e "${GREEN}📝 Generating SSL certificates...${NC}"

# Generate private key
openssl genrsa -out "$CERTS_DIR/server.key" 2048

# Generate certificate signing request
openssl req -new -key "$CERTS_DIR/server.key" -out "$CERTS_DIR/server.csr" -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=$CN/emailAddress=$EMAIL"

# Create extensions file for SAN (Subject Alternative Names)
cat > "$CERTS_DIR/server.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Generate self-signed certificate
openssl x509 -req -in "$CERTS_DIR/server.csr" -signkey "$CERTS_DIR/server.key" -out "$CERTS_DIR/server.crt" -days 365 -extensions v3_req -extfile "$CERTS_DIR/server.ext"

# Generate DH parameters (optional but recommended)
echo -e "${GREEN}🔑 Generating DH parameters (this may take a while)...${NC}"
openssl dhparam -out "$CERTS_DIR/dhparam.pem" 2048

# Set appropriate permissions
chmod 600 "$CERTS_DIR/server.key"
chmod 644 "$CERTS_DIR/server.crt"
chmod 644 "$CERTS_DIR/dhparam.pem"

# Clean up temporary files
rm -f "$CERTS_DIR/server.csr" "$CERTS_DIR/server.ext"

echo -e "${GREEN}✅ SSL certificates generated successfully!${NC}"
echo ""
echo "📁 Certificate files created:"
echo "   - Private Key: $CERTS_DIR/server.key"
echo "   - Certificate: $CERTS_DIR/server.crt"
echo "   - DH Params:   $CERTS_DIR/dhparam.pem"
echo ""
echo -e "${YELLOW}⚠️  Note: These are self-signed certificates for development only!${NC}"
echo -e "${YELLOW}   For production, use certificates from a trusted CA like Let's Encrypt.${NC}"
echo ""
echo -e "${GREEN}🚀 You can now start your application with SSL support!${NC}"
echo "   Run: docker-compose -f docker-compose.production.yml up -d"
echo ""
echo -e "${YELLOW}🌐 Access your application at: https://localhost${NC}"
echo -e "${YELLOW}   (You'll need to accept the security warning for self-signed certs)${NC}"
