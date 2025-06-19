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

# Step 3: Check and generate SSL certificates if needed
echo "🔐 Checking SSL certificates..."
if [ ! -f "ssl/certs/server.crt" ] || [ ! -f "ssl/certs/server.key" ]; then
  echo "📜 SSL certificates not found. Generating self-signed certificates..."
  ./generate-ssl-certs.sh
else
  echo "✅ SSL certificates found."
fi

# Step 4: Stop existing containers (if any)
echo "🛑 Stopping any running containers..."
docker compose -f docker-compose.production.yml down

# Step 5: Clean up unused Docker resources (optional)
echo "🧹 Cleaning up dangling containers/images..."
docker system prune -f

# Step 6: Build and start containers
echo "🏗️  Building and starting Docker containers..."
docker compose --env-file .env -f docker-compose.production.yml up -d --build

# Step 7: Show running containers
echo "📦 Currently running containers:"
docker ps

# Step 8: Check backend health (try both HTTP and HTTPS)
echo "🔍 Checking backend health endpoint..."
sleep 10
echo "Trying HTTP health check..."
curl -f http://localhost/health || echo "⚠️  HTTP health check failed"
echo "Trying HTTPS health check..."
curl -f -k https://localhost/health || echo "⚠️  HTTPS health check failed"

echo "✅ Deployment completed."
echo ""
echo "🌐 Application URLs:"
echo "   HTTP:  http://localhost (redirects to HTTPS)"
echo "   HTTPS: https://localhost"
echo ""
echo "⚠️  Note: For self-signed certificates, your browser will show a security warning."
echo "   Click 'Advanced' → 'Proceed to localhost (unsafe)' to continue."
