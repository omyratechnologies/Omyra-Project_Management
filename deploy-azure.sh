#!/bin/bash

# Azure Deployment Script
# Deploys the Omyra Project Management System to Azure

set -e

echo "☁️ Azure Deployment Script for Omyra Project Management System"
echo "============================================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔐 Please login to Azure first:"
    az login
fi

# Configuration
RESOURCE_GROUP="omyra-rg"
LOCATION="eastus"
MONGODB_VM_NAME="mongodb-vm"
BACKEND_APP_NAME="omyra-backend-api"
FRONTEND_APP_NAME="omyra-frontend"

echo "📋 Using configuration:"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "MongoDB VM: $MONGODB_VM_NAME"
echo "Backend App: $BACKEND_APP_NAME"
echo "Frontend App: $FRONTEND_APP_NAME"
echo ""

read -p "Continue with deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Create resource group
echo "🏗️ Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create virtual network
echo "🌐 Creating virtual network..."
az network vnet create \
  --resource-group $RESOURCE_GROUP \
  --name omyra-vnet \
  --address-prefix 10.1.0.0/16 \
  --subnet-name mongodb-subnet \
  --subnet-prefix 10.1.1.0/24

# Create backend subnet
az network vnet subnet create \
  --resource-group $RESOURCE_GROUP \
  --vnet-name omyra-vnet \
  --name backend-subnet \
  --address-prefix 10.1.2.0/24

# Create network security group for MongoDB
echo "🔒 Creating network security group..."
az network nsg create \
  --resource-group $RESOURCE_GROUP \
  --name mongodb-nsg

# Allow MongoDB port from backend subnet only
az network nsg rule create \
  --resource-group $RESOURCE_GROUP \
  --nsg-name mongodb-nsg \
  --name AllowMongoDB \
  --protocol tcp \
  --priority 1000 \
  --destination-port-range 27017 \
  --source-address-prefixes 10.1.2.0/24

# Allow SSH
az network nsg rule create \
  --resource-group $RESOURCE_GROUP \
  --nsg-name mongodb-nsg \
  --name AllowSSH \
  --protocol tcp \
  --priority 1100 \
  --destination-port-range 22

# Create MongoDB VM
echo "🗄️ Creating MongoDB virtual machine..."
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name $MONGODB_VM_NAME \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --vnet-name omyra-vnet \
  --subnet mongodb-subnet \
  --nsg mongodb-nsg \
  --generate-ssh-keys \
  --admin-username azureuser

# Get MongoDB VM private IP
MONGODB_PRIVATE_IP=$(az vm list-ip-addresses \
  --resource-group $RESOURCE_GROUP \
  --name $MONGODB_VM_NAME \
  --query '[0].virtualMachine.network.privateIpAddresses[0]' \
  --output tsv)

echo "📝 MongoDB VM created with private IP: $MONGODB_PRIVATE_IP"

# Create App Service Plan
echo "🚀 Creating App Service Plan..."
az appservice plan create \
  --name omyra-backend-plan \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Create Web App for backend
echo "🌐 Creating backend web app..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan omyra-backend-plan \
  --name $BACKEND_APP_NAME \
  --runtime "NODE|18-lts"

# Enable VNet integration for backend
echo "🔗 Enabling VNet integration..."
az webapp vnet-integration add \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --vnet omyra-vnet \
  --subnet backend-subnet

# Build backend
echo "🔨 Building backend..."
cd backend
npm ci --only=production
npm run build:production
cd ..

# Create deployment zip
echo "📦 Creating deployment package..."
cd backend
zip -r ../backend-deploy.zip . -x "node_modules/*" "src/*" "*.ts" "tsconfig*.json"
cd ..

# Deploy backend
echo "🚀 Deploying backend to Azure App Service..."
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --src backend-deploy.zip

# Configure backend app settings
echo "⚙️ Configuring backend application settings..."
read -p "Enter your JWT secret: " JWT_SECRET
read -p "Enter your SendGrid API key: " EMAIL_PASSWORD
read -p "Enter your email from address: " EMAIL_FROM

az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --settings \
    NODE_ENV=production \
    MONGODB_URI="mongodb://omyra-app:app-password-change-this@$MONGODB_PRIVATE_IP:27017/omyra-project-nexus?authSource=omyra-project-nexus&replicaSet=rs0" \
    JWT_SECRET="$JWT_SECRET" \
    FRONTEND_URL="https://$FRONTEND_APP_NAME.azurestaticapps.net" \
    EMAIL_HOST="smtp.sendgrid.net" \
    EMAIL_PORT="587" \
    EMAIL_USER="apikey" \
    EMAIL_PASSWORD="$EMAIL_PASSWORD" \
    EMAIL_FROM="$EMAIL_FROM" \
    PORT="8000" \
    WEBSITES_PORT="8000"

# Set startup command
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --startup-file "npm run start:production"

# Get backend URL
BACKEND_URL="https://$BACKEND_APP_NAME.azurewebsites.net"

echo "✅ Backend deployed successfully!"
echo "Backend URL: $BACKEND_URL"

# Build frontend with correct API URL
echo "🔨 Building frontend..."
cd frontend
cat > .env.production << EOF
VITE_API_URL=$BACKEND_URL/api
VITE_ENVIRONMENT=production
VITE_ENABLE_DEVTOOLS=false
EOF

npm ci --only=production
npm run build:production
cd ..

echo "🎉 Deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. SSH into MongoDB VM and run the setup script:"
echo "   ssh azureuser@\$(az vm list-ip-addresses -g $RESOURCE_GROUP -n $MONGODB_VM_NAME --query '[0].virtualMachine.network.publicIpAddresses[0].ipAddress' -o tsv)"
echo "   # Then run: curl -O https://raw.githubusercontent.com/yourusername/omyra-project-nexus/main/setup-mongodb-azure.sh && chmod +x setup-mongodb-azure.sh && ./setup-mongodb-azure.sh"
echo ""
echo "2. Update MongoDB connection string with real passwords"
echo ""
echo "3. Set up Static Web App for frontend:"
echo "   az staticwebapp create --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP --source https://github.com/yourusername/omyra-project-nexus --branch main --app-location '/frontend' --output-location '/frontend/dist'"
echo ""
echo "4. Test your deployment:"
echo "   Backend: $BACKEND_URL/health"
echo "   Frontend: https://$FRONTEND_APP_NAME.azurestaticapps.net"

# Clean up
rm -f backend-deploy.zip
