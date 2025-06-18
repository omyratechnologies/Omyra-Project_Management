#!/bin/bash

# Quick Production Setup Script
# This script sets up the production environment quickly

set -e

echo "🚀 Omyra Project Management System - Production Setup"
echo "=================================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run this script as root"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "🟢 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
echo "⚡ Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install nginx -y

# Install MongoDB tools (optional)
echo "🗄️ Installing MongoDB tools..."
sudo apt install mongodb-clients -y

# Create directory structure
echo "📁 Setting up directories..."
sudo mkdir -p /var/www/html
sudo mkdir -p /var/log/omyra
sudo chown -R $USER:$USER /var/www/html

# Set up firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create logs directory
mkdir -p logs

echo "✅ Base system setup completed!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone your-repo-url"
echo "2. Set up environment variables in backend/.env"
echo "3. Run: ./deploy.sh"
echo "4. Configure Nginx with your domain"
echo "5. Set up SSL certificate"
echo ""
echo "📖 See PRODUCTION-DEPLOYMENT-GUIDE.md for detailed instructions"
