#!/bin/bash

# Production Testing Script
# This script runs comprehensive tests before deployment

set -e

echo "🧪 Starting production testing..."

# Test environment variables
echo "📋 Testing environment configuration..."
if [ -z "$MONGODB_URI" ]; then
    echo "❌ MONGODB_URI not set"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET not set"
    exit 1
fi

if [ -z "$FRONTEND_URL" ]; then
    echo "❌ FRONTEND_URL not set"
    exit 1
fi

echo "✅ Environment variables configured"

# Test backend build
echo "🔨 Testing backend build..."
cd backend
npm run build:production

if [ ! -d "dist" ]; then
    echo "❌ Backend build failed - dist directory not found"
    exit 1
fi

echo "✅ Backend build successful"

# Test frontend build
echo "🔨 Testing frontend build..."
cd ../frontend
npm run build:production

if [ ! -d "dist" ]; then
    echo "❌ Frontend build failed - dist directory not found"
    exit 1
fi

echo "✅ Frontend build successful"

# Start backend in background for testing
echo "🚀 Starting backend for testing..."
cd ../backend
NODE_ENV=production npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Test health endpoint
echo "🏥 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)

if [ "$HEALTH_RESPONSE" != "200" ]; then
    echo "❌ Health check failed (HTTP $HEALTH_RESPONSE)"
    kill $BACKEND_PID
    exit 1
fi

echo "✅ Health endpoint working"

# Test API endpoints
echo "🔍 Testing API endpoints..."

# Test registration endpoint
REGISTER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}')

if [ "$REGISTER_RESPONSE" != "201" ] && [ "$REGISTER_RESPONSE" != "409" ]; then
    echo "❌ Registration endpoint failed (HTTP $REGISTER_RESPONSE)"
    kill $BACKEND_PID
    exit 1
fi

echo "✅ Registration endpoint working"

# Clean up
kill $BACKEND_PID

echo "🎉 All production tests passed!"
echo "✅ Ready for deployment"
