# Azure Deployment Guide for Omyra Project Management System

## 🌐 Azure Deployment Overview

This guide covers deploying your Omyra Project Management System to Azure with:
- **Azure App Service** for backend API
- **Azure Static Web Apps** for frontend
- **Azure Virtual Machine** with self-hosted MongoDB
- **Azure Application Gateway** for load balancing and SSL

## 📋 Prerequisites

- Azure CLI installed
- Azure subscription with appropriate permissions
- Domain name (optional but recommended)
- Basic knowledge of Azure services

## 🗄️ MongoDB Setup on Azure VM

### Step 1: Create Azure Virtual Machine for MongoDB

```bash
# Login to Azure
az login

# Create resource group
az group create --name omyra-rg --location eastus

# Create virtual network
az network vnet create \
  --resource-group omyra-rg \
  --name omyra-vnet \
  --address-prefix 10.1.0.0/16 \
  --subnet-name mongodb-subnet \
  --subnet-prefix 10.1.1.0/24

# Create network security group
az network nsg create \
  --resource-group omyra-rg \
  --name mongodb-nsg

# Allow MongoDB port (27017) only from backend subnet
az network nsg rule create \
  --resource-group omyra-rg \
  --nsg-name mongodb-nsg \
  --name AllowMongoDB \
  --protocol tcp \
  --priority 1000 \
  --destination-port-range 27017 \
  --source-address-prefixes 10.1.2.0/24

# Allow SSH
az network nsg rule create \
  --resource-group omyra-rg \
  --nsg-name mongodb-nsg \
  --name AllowSSH \
  --protocol tcp \
  --priority 1100 \
  --destination-port-range 22

# Create VM for MongoDB
az vm create \
  --resource-group omyra-rg \
  --name mongodb-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --vnet-name omyra-vnet \
  --subnet mongodb-subnet \
  --nsg mongodb-nsg \
  --generate-ssh-keys \
  --admin-username azureuser
```

### Step 2: Install and Configure MongoDB

```bash
# SSH into the VM
ssh azureuser@<vm-public-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Configure MongoDB for production
sudo nano /etc/mongod.conf
```

### MongoDB Configuration (/etc/mongod.conf)
```yaml
# mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 0.0.0.0  # Allow connections from other machines

processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid

security:
  authorization: enabled

replication:
  replSetName: "rs0"
```

### Step 3: Secure MongoDB
```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create admin user
mongosh
```

```javascript
// In MongoDB shell
use admin
db.createUser({
  user: "admin",
  pwd: "your-strong-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

// Create application user
use omyra-project-nexus
db.createUser({
  user: "omyra-app",
  pwd: "your-app-password",
  roles: ["readWrite"]
})

// Initialize replica set
rs.initiate()
exit
```

```bash
# Restart MongoDB with authentication
sudo systemctl restart mongod

# Test connection
mongosh -u admin -p your-strong-password --authenticationDatabase admin
```

## 🚀 Backend Deployment to Azure App Service

### Step 1: Create App Service Plan and Web App

```bash
# Create App Service Plan
az appservice plan create \
  --name omyra-backend-plan \
  --resource-group omyra-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group omyra-rg \
  --plan omyra-backend-plan \
  --name omyra-backend-api \
  --runtime "NODE|18-lts"
```

### Step 2: Configure Application Settings

```bash
# Set application settings
az webapp config appsettings set \
  --resource-group omyra-rg \
  --name omyra-backend-api \
  --settings \
    NODE_ENV=production \
    MONGODB_URI="mongodb://omyra-app:your-app-password@<mongodb-vm-private-ip>:27017/omyra-project-nexus?authSource=omyra-project-nexus" \
    JWT_SECRET="your-super-secure-jwt-secret" \
    FRONTEND_URL="https://omyra-frontend.azurestaticapps.net" \
    EMAIL_HOST="smtp.sendgrid.net" \
    EMAIL_PORT="587" \
    EMAIL_USER="apikey" \
    EMAIL_PASSWORD="your-sendgrid-api-key" \
    EMAIL_FROM="noreply@yourdomain.com" \
    PORT="8000" \
    WEBSITES_PORT="8000"

# Configure startup command
az webapp config set \
  --resource-group omyra-rg \
  --name omyra-backend-api \
  --startup-file "npm run start:production"
```

## 🌐 Frontend Deployment to Azure Static Web Apps

### Step 1: Create Static Web App

```bash
# Create Static Web App
az staticwebapp create \
  --name omyra-frontend \
  --resource-group omyra-rg \
  --source https://github.com/yourusername/omyra-project-nexus \
  --branch main \
  --app-location "/frontend" \
  --api-location "/backend" \
  --output-location "/frontend/dist" \
  --login-with-github
```

### Step 2: Configure Build Settings

Create `/.github/workflows/azure-static-web-apps-<name>.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          output_location: "dist"
        env:
          VITE_API_URL: "https://omyra-backend-api.azurewebsites.net/api"
          VITE_ENVIRONMENT: "production"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

## 🔄 CI/CD Pipeline for Backend

Create `/.github/workflows/azure-backend-deploy.yml`:

```yaml
name: Deploy Backend to Azure App Service

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend
        npm ci --only=production
        
    - name: Build application
      run: |
        cd backend
        npm run build:production
        
    - name: Deploy to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'omyra-backend-api'
        slot-name: 'production'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: './backend'
```

## 🔒 Network Security and VNet Integration

### Step 1: Create Backend Subnet

```bash
# Create subnet for backend
az network vnet subnet create \
  --resource-group omyra-rg \
  --vnet-name omyra-vnet \
  --name backend-subnet \
  --address-prefix 10.1.2.0/24

# Enable VNet integration for App Service
az webapp vnet-integration add \
  --resource-group omyra-rg \
  --name omyra-backend-api \
  --vnet omyra-vnet \
  --subnet backend-subnet
```

### Step 2: Update MongoDB Security

```bash
# Update MongoDB NSG to only allow backend subnet
az network nsg rule update \
  --resource-group omyra-rg \
  --nsg-name mongodb-nsg \
  --name AllowMongoDB \
  --source-address-prefixes 10.1.2.0/24
```

## 📊 Monitoring and Logging

### Step 1: Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app omyra-monitoring \
  --location eastus \
  --resource-group omyra-rg

# Link to App Service
az webapp config appsettings set \
  --resource-group omyra-rg \
  --name omyra-backend-api \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY="your-instrumentation-key"
```

### Step 2: Set up Log Analytics

```bash
# Create Log Analytics Workspace
az monitor log-analytics workspace create \
  --resource-group omyra-rg \
  --workspace-name omyra-logs
```

## 💰 Cost Optimization

### Resource Sizing Recommendations:
- **MongoDB VM**: Standard_B2s (2 vCPUs, 4GB RAM) - ~$60/month
- **App Service**: Basic B1 (1 vCPU, 1.75GB RAM) - ~$55/month  
- **Static Web App**: Free tier (sufficient for most use cases)
- **Application Gateway**: Standard_v2 - ~$25/month + data processing

### Cost-Saving Tips:
1. Use Azure Reserved Instances for VMs (up to 72% savings)
2. Auto-shutdown VMs during non-business hours
3. Use Azure Cost Management alerts
4. Consider Azure Container Instances for development/testing

## 🔧 Production Configuration Files

Let me create Azure-specific configuration files for you...
```
