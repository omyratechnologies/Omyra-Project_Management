#!/bin/bash

# =============================================================================
# 🔒 SSL Certificate Quick Fix Script
# =============================================================================

set -e

echo "🔒 SSL Certificate Quick Fix for CI/CD Deployment"
echo "================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Checking current SSL status...${NC}"

# Check if SSL directory exists
if [ ! -d "ssl/certs" ]; then
    echo -e "${YELLOW}📁 Creating SSL directory...${NC}"
    mkdir -p ssl/certs
fi

# Generate new SSL certificates
echo -e "${BLUE}🔐 Generating new SSL certificates...${NC}"

# Create SSL config
cat > ssl_config_temp.conf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
CN = pms.omyratech.com

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = pms.omyratech.com
DNS.2 = www.pms.omyratech.com
DNS.3 = localhost
IP.1 = 127.0.0.1
IP.2 = 4.240.101.137
EOF

# Generate SSL certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/certs/server.key \
    -out ssl/certs/server.crt \
    -config ssl_config_temp.conf \
    -extensions v3_req

# Set proper permissions
chmod 600 ssl/certs/server.key
chmod 644 ssl/certs/server.crt

# Clean up temp config
rm ssl_config_temp.conf

echo -e "${GREEN}✅ SSL certificates generated successfully!${NC}"

# Verify certificates
echo -e "${BLUE}🔍 Verifying SSL certificates...${NC}"
openssl x509 -in ssl/certs/server.crt -text -noout | grep -E "(Subject:|DNS:|IP Address:)" || true

# Restart containers if running
if [ "$(docker ps -q -f name=nginx)" ]; then
    echo -e "${BLUE}🔄 Restarting containers to apply SSL changes...${NC}"
    docker compose -f docker-compose.production.yml restart nginx
    sleep 10
    echo -e "${GREEN}✅ Containers restarted!${NC}"
else
    echo -e "${YELLOW}⚠️  No containers running. Start with: docker compose -f docker-compose.production.yml up -d${NC}"
fi

echo ""
echo -e "${GREEN}🎉 SSL fix completed!${NC}"
echo -e "${BLUE}📍 Test your site:${NC}"
echo "   HTTP:  http://pms.omyratech.com"
echo "   HTTPS: https://pms.omyratech.com (self-signed warning expected)"
echo ""
echo -e "${YELLOW}📝 Note: Self-signed certificates will show a browser warning.${NC}"
echo -e "${YELLOW}   This is expected and safe for testing purposes.${NC}"
