#!/bin/bash

# =============================================================================
# 🔍 Emergency Diagnostic Script for 500 Error
# =============================================================================

echo "🔍 Diagnosing 500 Internal Server Error..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test domain response
echo -e "${BLUE}📡 Testing domain response...${NC}"
curl -I http://pms.omyratech.com || echo "Domain connection failed"

echo ""
echo -e "${BLUE}🐳 Checking Docker container status...${NC}"
echo "Container list:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${BLUE}🔍 Checking container logs for errors...${NC}"

# Check nginx logs
echo -e "${YELLOW}📋 Nginx logs (last 10 lines):${NC}"
docker logs omyra-project_management-nginx-1 --tail 10 2>&1 || echo "No nginx logs"

echo ""
# Check backend logs  
echo -e "${YELLOW}📋 Backend logs (last 10 lines):${NC}"
docker logs omyra-project_management-backend-1 --tail 10 2>&1 || echo "No backend logs"

echo ""
# Check frontend logs
echo -e "${YELLOW}📋 Frontend logs (last 10 lines):${NC}"
docker logs omyra-project_management-frontend-1 --tail 10 2>&1 || echo "No frontend logs"

echo ""
echo -e "${BLUE}🌐 Testing internal container connectivity...${NC}"

# Test backend health directly
echo "Testing backend container directly:"
docker exec omyra-project_management-backend-1 curl -f http://localhost:5000/health 2>/dev/null || echo "Backend health check failed"

# Test frontend container directly  
echo "Testing frontend container directly:"
docker exec omyra-project_management-frontend-1 curl -f http://localhost:80 2>/dev/null || echo "Frontend check failed"

echo ""
echo -e "${BLUE}🔧 Checking nginx configuration...${NC}"
docker exec omyra-project_management-nginx-1 nginx -t || echo "Nginx config test failed"

echo ""
echo -e "${BLUE}📊 Container resource usage...${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo -e "${BLUE}🔍 Checking environment variables...${NC}"
echo "Backend environment:"
docker exec omyra-project_management-backend-1 env | grep -E "(NODE_ENV|PORT|MONGODB_URI)" || echo "Env check failed"

echo ""
echo -e "${YELLOW}💡 Potential fixes to try:${NC}"
echo "1. Restart containers: docker compose -f docker-compose.production.yml restart"
echo "2. Check environment file: cat .env"
echo "3. Rebuild containers: docker compose -f docker-compose.production.yml up -d --build"
echo "4. Check disk space: df -h"
echo "5. Check memory: free -h"
