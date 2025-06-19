#!/bin/bash

# SSL Configuration Test Script
# This script tests the SSL configuration and provides detailed information

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="$SCRIPT_DIR/ssl"
CERTS_DIR="$SSL_DIR/certs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 SSL Configuration Test${NC}"
echo "========================="

# Check if certificates exist
if [ ! -f "$CERTS_DIR/server.crt" ] || [ ! -f "$CERTS_DIR/server.key" ]; then
    echo -e "${RED}❌ SSL certificates not found!${NC}"
    echo "Run: ./generate-ssl-certs.sh"
    exit 1
fi

echo -e "${GREEN}✅ SSL certificates found${NC}"

# Certificate information
echo -e "\n${BLUE}📋 Certificate Information:${NC}"
echo "Certificate: $CERTS_DIR/server.crt"
echo "Private Key: $CERTS_DIR/server.key"

# Check certificate validity
echo -e "\n${BLUE}📅 Certificate Validity:${NC}"
openssl x509 -in "$CERTS_DIR/server.crt" -noout -dates

# Check certificate details
echo -e "\n${BLUE}🏷️  Certificate Details:${NC}"
openssl x509 -in "$CERTS_DIR/server.crt" -noout -subject -issuer

# Check Subject Alternative Names
echo -e "\n${BLUE}🌐 Subject Alternative Names:${NC}"
openssl x509 -in "$CERTS_DIR/server.crt" -noout -text | grep -A5 "Subject Alternative Name" || echo "No SAN found"

# Test SSL connection (if server is running)
echo -e "\n${BLUE}🔌 Testing SSL Connection:${NC}"
if curl -I -k https://localhost --connect-timeout 5 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTPS connection successful${NC}"
    
    # Get SSL certificate info from server
    echo -e "\n${BLUE}🔍 Server SSL Information:${NC}"
    echo | openssl s_client -connect localhost:443 -servername localhost 2>/dev/null | \
        openssl x509 -noout -dates -subject -issuer 2>/dev/null || echo "Could not retrieve server certificate info"
    
    # Check SSL rating
    echo -e "\n${BLUE}⭐ SSL Security Check:${NC}"
    if command -v testssl.sh >/dev/null 2>&1; then
        testssl.sh --brief https://localhost
    else
        echo "Install testssl.sh for detailed SSL security analysis"
        echo "curl -I -k https://localhost shows:"
        curl -I -k https://localhost 2>/dev/null | head -10
    fi
else
    echo -e "${YELLOW}⚠️  HTTPS server not running${NC}"
    echo "Start the server with: docker-compose -f docker-compose.production.yml up -d"
fi

# Check HTTP to HTTPS redirect
echo -e "\n${BLUE}🔄 HTTP to HTTPS Redirect Test:${NC}"
if curl -I http://localhost --connect-timeout 5 2>/dev/null | grep -q "301\|302"; then
    echo -e "${GREEN}✅ HTTP to HTTPS redirect working${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP to HTTPS redirect not working or server not running${NC}"
fi

# Check file permissions
echo -e "\n${BLUE}🔒 File Permissions:${NC}"
ls -la "$CERTS_DIR/" | grep -E '\.(crt|key|pem)$'

# Security recommendations
echo -e "\n${BLUE}💡 Security Recommendations:${NC}"
echo "• Use Let's Encrypt certificates for production"
echo "• Keep certificates updated"
echo "• Monitor certificate expiration"
echo "• Use strong cipher suites"
echo "• Enable HSTS headers"

# Check for common issues
echo -e "\n${BLUE}🔍 Common Issues Check:${NC}"

# Check if private key is protected
if [ -r "$CERTS_DIR/server.key" ]; then
    KEY_PERMS=$(stat -f "%A" "$CERTS_DIR/server.key" 2>/dev/null || stat -c "%a" "$CERTS_DIR/server.key" 2>/dev/null)
    if [ "$KEY_PERMS" != "600" ]; then
        echo -e "${YELLOW}⚠️  Private key permissions should be 600${NC}"
        echo "Fix with: chmod 600 $CERTS_DIR/server.key"
    else
        echo -e "${GREEN}✅ Private key permissions are correct${NC}"
    fi
fi

# Check certificate and key match
echo -e "\n${BLUE}🔐 Certificate/Key Match:${NC}"
CERT_HASH=$(openssl x509 -noout -modulus -in "$CERTS_DIR/server.crt" | openssl md5)
KEY_HASH=$(openssl rsa -noout -modulus -in "$CERTS_DIR/server.key" | openssl md5)

if [ "$CERT_HASH" = "$KEY_HASH" ]; then
    echo -e "${GREEN}✅ Certificate and private key match${NC}"
else
    echo -e "${RED}❌ Certificate and private key do not match!${NC}"
fi

echo -e "\n${GREEN}🏁 SSL test completed${NC}"
echo -e "${BLUE}For production SSL setup, use: sudo ./setup-letsencrypt.sh yourdomain.com${NC}"
