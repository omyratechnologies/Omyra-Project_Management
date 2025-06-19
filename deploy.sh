#!/bin/bash

# ------------------------------------------------------------------------------
# 🛠️ Omyra Project Management - Deployment Script
# ------------------------------------------------------------------------------

echo "🚀 Starting Deployment..."

# Step 1: Load environment variables
if [ ! -f .env ]; then
  echo "❌ .env file not found. Aborting."
  exit 1
fi

export $(grep -v '^#' .env | xargs)

# Step 2: Pull latest code (optional if repo already cloned)
# git pull origin main

# Step 3: Stop existing containers (if any)
echo "🛑 Stopping any running containers..."
docker compose -f docker-compose.production.yml down

# Step 4: Clean up unused Docker resources (optional)
echo "🧹 Cleaning up dangling containers/images..."
docker system prune -f

# Step 5: Build and start containers
echo "🏗️  Building and starting Docker containers..."
docker compose --env-file .env -f docker-compose.production.yml up -d --build

# Step 6: Show running containers
echo "📦 Currently running containers:"
docker ps

# Step 7: Check connections
echo "🔍 Testing frontend-backend connections..."
sleep 10

echo "📱 Testing frontend (React app):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost/ || echo "❌ Frontend not accessible"

echo "🔧 Testing health endpoints:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost/health || echo "❌ Health endpoint failed"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost/api/health || echo "❌ API health endpoint failed"

echo "🔗 Testing API connection:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost/api/ || echo "❌ API root endpoint failed"

echo "🧪 Testing internal container connectivity:"
docker exec -it omyra-project_management-nginx-1 wget -qO- http://frontend:80 >/dev/null 2>&1 && echo "✅ nginx->frontend OK" || echo "❌ nginx->frontend failed"
docker exec -it omyra-project_management-nginx-1 wget -qO- http://backend:5000/health >/dev/null 2>&1 && echo "✅ nginx->backend OK" || echo "❌ nginx->backend failed"

echo "✅ Deployment completed."
