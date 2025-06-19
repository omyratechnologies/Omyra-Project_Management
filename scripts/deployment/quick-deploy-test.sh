#!/bin/bash

# ------------------------------------------------------------------------------
# 🚀 Quick Server Deployment & Test Script
# ------------------------------------------------------------------------------

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Quick Server Deployment & Test${NC}"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.production.yml" ]; then
    echo -e "${RED}❌ docker-compose.production.yml not found. Are you in the project directory?${NC}"
    exit 1
fi

# 1. Environment setup
echo -e "\n${YELLOW}📋 Environment Setup${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example .env
        echo "JWT_SECRET=production-jwt-secret-$(date +%s)" >> .env
        echo "FRONTEND_URL=https://pms.omyratech.com" >> .env
        echo -e "${GREEN}✅ .env file created. Please review and update as needed.${NC}"
    else
        echo -e "${RED}❌ No .env.example found${NC}"
    fi
fi

# 2. SSL Certificate Generation
echo -e "\n${YELLOW}🔐 SSL Certificate Check${NC}"
if [ ! -f "ssl/certs/server.crt" ] || [ ! -f "ssl/certs/server.key" ]; then
    echo -e "${YELLOW}⚠️  SSL certificates not found. Generating...${NC}"
    if [ -f "generate-ssl-certs.sh" ]; then
        chmod +x generate-ssl-certs.sh
        ./generate-ssl-certs.sh
    else
        echo -e "${RED}❌ generate-ssl-certs.sh not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ SSL certificates found${NC}"
fi

# 3. Docker cleanup and deployment
echo -e "\n${YELLOW}🐳 Docker Deployment${NC}"
echo "Stopping existing containers..."
docker compose -f docker-compose.production.yml down 2>/dev/null || true

echo "Cleaning up Docker resources..."
docker system prune -f

echo "Building and starting containers..."
docker compose --env-file .env -f docker-compose.production.yml up -d --build

# 4. Wait for services to start
echo -e "\n${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 15

# 5. Run comprehensive tests
echo -e "\n${YELLOW}🧪 Running deployment tests...${NC}"
if [ -f "test-server-deployment.sh" ]; then
    chmod +x test-server-deployment.sh
    ./test-server-deployment.sh
else
    echo -e "${YELLOW}⚠️  test-server-deployment.sh not found, running basic tests...${NC}"
    
    # Basic tests
    echo "Checking running containers..."
    docker ps
    
    echo -e "\nTesting HTTP->HTTPS redirect..."
    curl -I http://localhost 2>/dev/null | head -5 || echo "HTTP test failed"
    
    echo -e "\nTesting HTTPS endpoint..."
    curl -k -I https://localhost 2>/dev/null | head -5 || echo "HTTPS test failed"
    
    echo -e "\nTesting backend health..."
    curl -k -f https://localhost/api/health 2>/dev/null && echo "Backend health: OK" || echo "Backend health: FAILED"
fi

# 6. Display final information
echo -e "\n${CYAN}🎉 Deployment Summary${NC}"
echo "======================"

SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
DOMAIN="pms.omyratech.com"
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo -e "${CYAN}🌐 Access URLs:${NC}"
echo "   HTTP:  http://$DOMAIN (redirects to HTTPS)"
echo "   HTTPS: https://$DOMAIN"
echo "   Direct IP: https://$SERVER_IP"
echo ""
echo -e "${CYAN}📋 Next Steps:${NC}"
echo "1. Test the application in your browser"
echo "2. Check SSL certificate warning (expected for self-signed)"
echo "3. Verify all functionality works"
echo "4. Monitor logs: docker compose -f docker-compose.production.yml logs -f"
echo ""
echo -e "${YELLOW}⚠️  Note: Self-signed certificates will show security warnings in browsers${NC}"
