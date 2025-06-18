#!/bin/bash

# Production Deployment Script
# Make sure to set your environment variables before running this script

set -e

echo "🚀 Starting production deployment..."

# Check if required environment variables are set
if [ -z "$MONGODB_URI" ] || [ -z "$JWT_SECRET" ] || [ -z "$FRONTEND_URL" ]; then
    echo "❌ Missing required environment variables!"
    echo "Please set: MONGODB_URI, JWT_SECRET, FRONTEND_URL"
    exit 1
fi

# Backend deployment
echo "📦 Building backend..."
cd backend
npm ci --only=production
npm run build:production

echo "🧪 Running production health check..."
npm run health:check &
HEALTH_PID=$!
sleep 3
kill $HEALTH_PID || true

# Frontend deployment
echo "📦 Building frontend..."
cd ../frontend
npm ci --only=production
npm run build:production

echo "✅ Production build completed successfully!"
echo "📂 Backend build: ./backend/dist/"
echo "📂 Frontend build: ./frontend/dist/"
echo ""
echo "Next steps:"
echo "1. Deploy backend/dist/ to your server"
echo "2. Deploy frontend/dist/ to your static hosting"
echo "3. Set up your environment variables on the server"
echo "4. Start the backend with: npm run start:production"
