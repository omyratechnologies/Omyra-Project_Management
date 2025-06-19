#!/bin/bash

# =============================================================================
# 🧪 Omyra Project Management - Deployment Test Script
# =============================================================================

set -e

echo "🧪 Testing Omyra PMS Deployment..."
echo "=================================="

# Test 1: Check if containers are running
echo "📦 Checking Docker containers..."
if docker ps | grep -q "omyra-project_management"; then
    echo "✅ Containers are running"
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep omyra-project_management
else
    echo "❌ Containers not found"
    exit 1
fi

echo ""

# Test 2: Check backend health
echo "🏥 Testing backend health..."
if curl -f -s http://localhost/health > /dev/null 2>&1; then
    response=$(curl -s http://localhost/health)
    echo "✅ Backend is healthy"
    echo "   Response: $response"
else
    echo "❌ Backend health check failed"
    exit 1
fi

echo ""

# Test 3: Check frontend
echo "🌐 Testing frontend..."
if curl -f -s -I http://localhost | grep -q "200 OK"; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
    exit 1
fi

echo ""

# Test 4: Check database
echo "🗄️  Testing database..."
if docker exec omyra-project_management-mongodb-1 mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    echo "✅ Database is responsive"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo ""

# Test 5: Check API endpoints
echo "🔌 Testing API endpoints..."
api_tests=(
    "/health"
    "/api"
)

for endpoint in "${api_tests[@]}"; do
    if curl -f -s "http://localhost$endpoint" > /dev/null 2>&1; then
        echo "✅ $endpoint - OK"
    else
        echo "⚠️  $endpoint - Failed (may be expected for some endpoints)"
    fi
done

echo ""
echo "🎉 All critical tests passed!"
echo "✅ Deployment is successful and healthy!"
