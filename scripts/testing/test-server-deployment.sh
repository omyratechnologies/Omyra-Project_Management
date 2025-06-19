#!/bin/bash

# ------------------------------------------------------------------------------
# 🧪 Server Deployment Testing Script
# ------------------------------------------------------------------------------

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧪 Server Deployment Testing${NC}"
echo "=============================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test service health
test_service_health() {
    local service_name=$1
    local url=$2
    local description=$3
    
    echo -e "\n${BLUE}Testing $description...${NC}"
    if curl -f -s --max-time 10 "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name is not responding${NC}"
        return 1
    fi
}

# Function to test SSL certificate
test_ssl_certificate() {
    local domain=$1
    local port=${2:-443}
    
    echo -e "\n${BLUE}Testing SSL certificate for $domain:$port...${NC}"
    
    # Test SSL connection
    if echo | openssl s_client -connect "$domain:$port" -servername "$domain" 2>/dev/null | openssl x509 -noout -text >/dev/null 2>&1; then
        echo -e "${GREEN}✅ SSL certificate is valid${NC}"
        
        # Get certificate details
        echo -e "${CYAN}Certificate details:${NC}"
        echo | openssl s_client -connect "$domain:$port" -servername "$domain" 2>/dev/null | openssl x509 -noout -subject -issuer -dates
    else
        echo -e "${RED}❌ SSL certificate test failed${NC}"
        return 1
    fi
}

# 1. System Information
echo -e "\n${YELLOW}📋 System Information${NC}"
echo "OS: $(uname -a)"
echo "Uptime: $(uptime)"
echo "Memory: $(free -h | grep ^Mem | awk '{print $3 "/" $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"

# 2. Docker Status
echo -e "\n${YELLOW}🐳 Docker Status${NC}"
if command_exists docker; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
    echo "Docker version: $(docker --version)"
    
    if docker info >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker daemon is running${NC}"
    else
        echo -e "${RED}❌ Docker daemon is not running${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# 3. Docker Compose Status
echo -e "\n${YELLOW}🔧 Docker Compose Status${NC}"
if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker Compose is available${NC}"
    if command_exists docker-compose; then
        echo "Docker Compose version: $(docker-compose --version)"
    else
        echo "Docker Compose version: $(docker compose version)"
    fi
else
    echo -e "${RED}❌ Docker Compose is not available${NC}"
    exit 1
fi

# 4. Check running containers
echo -e "\n${YELLOW}📦 Running Containers${NC}"
CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
if [ -n "$CONTAINERS" ]; then
    echo "$CONTAINERS"
else
    echo -e "${YELLOW}⚠️  No containers are currently running${NC}"
fi

# 5. Check Docker networks
echo -e "\n${YELLOW}🌐 Docker Networks${NC}"
docker network ls

# 6. Check SSL certificates
echo -e "\n${YELLOW}🔐 SSL Certificate Check${NC}"
if [ -f "ssl/certs/server.crt" ] && [ -f "ssl/certs/server.key" ]; then
    echo -e "${GREEN}✅ SSL certificate files exist${NC}"
    
    # Check certificate validity
    echo -e "${CYAN}Certificate information:${NC}"
    openssl x509 -in ssl/certs/server.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"
    
    # Check if certificate is expired
    if openssl x509 -checkend 86400 -noout -in ssl/certs/server.crt >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Certificate is valid for at least 24 hours${NC}"
    else
        echo -e "${YELLOW}⚠️  Certificate expires within 24 hours${NC}"
    fi
else
    echo -e "${RED}❌ SSL certificate files not found${NC}"
fi

# 7. Test service endpoints
echo -e "\n${YELLOW}🌐 Service Health Tests${NC}"

# Get server domain/IP
DOMAIN="pms.omyratech.com"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
echo "Testing services on domain: $DOMAIN"
echo "Server IP: $SERVER_IP"

# Test HTTP redirect
test_service_health "HTTP->HTTPS Redirect" "http://$DOMAIN" "HTTP to HTTPS redirect"

# Test HTTPS frontend
test_service_health "HTTPS Frontend" "https://$DOMAIN" "HTTPS frontend" || true

# Test backend health endpoint
test_service_health "Backend Health" "https://$DOMAIN/api/health" "Backend health endpoint" || true

# Test backend API
test_service_health "Backend API" "https://$DOMAIN/api/auth/test" "Backend API endpoint" || true

# 8. Port availability check
echo -e "\n${YELLOW}🔌 Port Availability${NC}"
PORTS=(80 443 27017 5000)
for port in "${PORTS[@]}"; do
    if netstat -tuln | grep ":$port " >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Port $port is in use${NC}"
    else
        echo -e "${RED}❌ Port $port is not in use${NC}"
    fi
done

# 9. Test SSL with external tools
echo -e "\n${YELLOW}🔒 External SSL Test${NC}"
if command_exists openssl; then
    test_ssl_certificate "$DOMAIN" 443 || true
else
    echo -e "${YELLOW}⚠️  OpenSSL not available for SSL testing${NC}"
fi

# 10. Logs check
echo -e "\n${YELLOW}📜 Recent Container Logs${NC}"
if docker ps -q | head -5 | while read container; do
    container_name=$(docker ps --format "{{.Names}}" --filter "id=$container")
    echo -e "${CYAN}Last 10 lines from $container_name:${NC}"
    docker logs --tail 10 "$container" 2>&1 | head -10
    echo "---"
done; then
    :
else
    echo -e "${YELLOW}⚠️  No container logs available${NC}"
fi

# 11. Performance check
echo -e "\n${YELLOW}⚡ Performance Check${NC}"
echo "Load average: $(uptime | awk -F'load average:' '{print $2}')"

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo -e "${RED}❌ Disk usage is high: $DISK_USAGE%${NC}"
else
    echo -e "${GREEN}✅ Disk usage is acceptable: $DISK_USAGE%${NC}"
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEM_USAGE" -gt 80 ]; then
    echo -e "${RED}❌ Memory usage is high: $MEM_USAGE%${NC}"
else
    echo -e "${GREEN}✅ Memory usage is acceptable: $MEM_USAGE%${NC}"
fi

echo -e "\n${CYAN}🎉 Testing completed!${NC}"
echo -e "Check the results above for any issues that need attention."
