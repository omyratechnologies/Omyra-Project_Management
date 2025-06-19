#!/bin/bash

# ------------------------------------------------------------------------------
# 🌐 Domain-Specific Testing Script for pms.omyratech.com
# ------------------------------------------------------------------------------

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

DOMAIN="pms.omyratech.com"

echo -e "${CYAN}🌐 Domain Testing for $DOMAIN${NC}"
echo "================================="

# Function to test DNS resolution
test_dns() {
    echo -e "\n${YELLOW}🔍 DNS Resolution Test${NC}"
    
    if command -v nslookup >/dev/null 2>&1; then
        echo "Testing DNS resolution for $DOMAIN..."
        if nslookup "$DOMAIN" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ DNS resolution successful${NC}"
            nslookup "$DOMAIN" | grep -A 2 "Name:"
        else
            echo -e "${RED}❌ DNS resolution failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  nslookup not available${NC}"
    fi
    
    # Alternative with host command
    if command -v host >/dev/null 2>&1; then
        echo "Alternative DNS test with host command:"
        host "$DOMAIN" && echo -e "${GREEN}✅ Host command successful${NC}" || echo -e "${RED}❌ Host command failed${NC}"
    fi
}

# Function to test domain connectivity
test_domain_connectivity() {
    echo -e "\n${YELLOW}🔗 Domain Connectivity Test${NC}"
    
    # Test ping
    if command -v ping >/dev/null 2>&1; then
        echo "Testing ping to $DOMAIN..."
        if ping -c 3 "$DOMAIN" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Ping successful${NC}"
        else
            echo -e "${RED}❌ Ping failed${NC}"
        fi
    fi
    
    # Test HTTP connection
    echo "Testing HTTP connection..."
    if curl -I -s --max-time 10 "http://$DOMAIN" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ HTTP connection successful${NC}"
        echo "HTTP response headers:"
        curl -I -s --max-time 10 "http://$DOMAIN" | head -3
    else
        echo -e "${RED}❌ HTTP connection failed${NC}"
    fi
    
    # Test HTTPS connection
    echo "Testing HTTPS connection..."
    if curl -I -s -k --max-time 10 "https://$DOMAIN" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ HTTPS connection successful${NC}"
        echo "HTTPS response headers:"
        curl -I -s -k --max-time 10 "https://$DOMAIN" | head -3
    else
        echo -e "${RED}❌ HTTPS connection failed${NC}"
    fi
}

# Function to test SSL certificate for domain
test_domain_ssl() {
    echo -e "\n${YELLOW}🔒 SSL Certificate Test for $DOMAIN${NC}"
    
    if command -v openssl >/dev/null 2>&1; then
        echo "Testing SSL connection to $DOMAIN:443..."
        
        # Get SSL certificate info
        SSL_INFO=$(echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ SSL connection successful${NC}"
            
            # Extract certificate details
            echo -e "${CYAN}Certificate Information:${NC}"
            echo "$SSL_INFO" | openssl x509 -noout -subject -issuer -dates 2>/dev/null || echo "Could not parse certificate"
            
            # Check if certificate matches domain
            CERT_CN=$(echo "$SSL_INFO" | openssl x509 -noout -subject 2>/dev/null | grep -o "CN=[^,]*" | cut -d= -f2)
            if [ "$CERT_CN" = "$DOMAIN" ]; then
                echo -e "${GREEN}✅ Certificate CN matches domain${NC}"
            else
                echo -e "${YELLOW}⚠️  Certificate CN ($CERT_CN) doesn't match domain ($DOMAIN)${NC}"
            fi
            
        else
            echo -e "${RED}❌ SSL connection failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  OpenSSL not available${NC}"
    fi
}

# Function to test application endpoints
test_application_endpoints() {
    echo -e "\n${YELLOW}🎯 Application Endpoints Test${NC}"
    
    ENDPOINTS=(
        "https://$DOMAIN"
        "https://$DOMAIN/api/health"
        "https://$DOMAIN/api/auth/test"
        "http://$DOMAIN"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        echo "Testing: $endpoint"
        
        RESPONSE=$(curl -s -k -w "%{http_code}" --max-time 10 "$endpoint" -o /dev/null 2>/dev/null)
        
        case $RESPONSE in
            200)
                echo -e "${GREEN}✅ $endpoint - OK (200)${NC}"
                ;;
            301|302)
                echo -e "${BLUE}🔄 $endpoint - Redirect ($RESPONSE)${NC}"
                ;;
            404)
                echo -e "${YELLOW}⚠️  $endpoint - Not Found (404)${NC}"
                ;;
            *)
                if [ -n "$RESPONSE" ]; then
                    echo -e "${RED}❌ $endpoint - Error ($RESPONSE)${NC}"
                else
                    echo -e "${RED}❌ $endpoint - Connection failed${NC}"
                fi
                ;;
        esac
    done
}

# Function to check if domain points to current server
check_domain_pointing() {
    echo -e "\n${YELLOW}📍 Domain Pointing Check${NC}"
    
    # Get domain IP
    DOMAIN_IP=$(nslookup "$DOMAIN" 2>/dev/null | grep -A 1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
    
    # Get server public IP
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "unknown")
    
    echo "Domain ($DOMAIN) resolves to: $DOMAIN_IP"
    echo "Server public IP: $SERVER_IP"
    
    if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
        echo -e "${GREEN}✅ Domain points to this server${NC}"
    else
        echo -e "${YELLOW}⚠️  Domain does not point to this server${NC}"
        echo "This could be normal if using a load balancer or CDN"
    fi
}

# Run all tests
echo -e "${BLUE}Starting comprehensive domain tests...${NC}\n"

test_dns
test_domain_connectivity
check_domain_pointing
test_domain_ssl
test_application_endpoints

echo -e "\n${CYAN}🎉 Domain testing completed!${NC}"
echo ""
echo -e "${CYAN}📋 Summary for $DOMAIN:${NC}"
echo "- If DNS resolution failed, check domain registration and DNS settings"
echo "- If connectivity failed, check server firewall and domain pointing"
echo "- If SSL failed, check certificate configuration and validity"
echo "- If endpoints failed, check application deployment and nginx config"
