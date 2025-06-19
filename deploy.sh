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

# Step 7: Check backend health
echo "🔍 Checking backend health endpoint..."
sleep 5
curl http://localhost:5000/health || echo "⚠️  Backend health check failed"

echo "✅ Deployment completed."
