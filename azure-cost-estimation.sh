#!/bin/bash

# Azure Cost Estimation Script
# Estimates monthly costs for the Omyra Project deployment

echo "💰 Azure Cost Estimation for Omyra Project Management System"
echo "============================================================="
echo ""

# Cost calculations (USD per month, East US region)
echo "📊 Estimated Monthly Costs (East US region):"
echo ""

# MongoDB VM (Standard_B2s)
echo "🗄️ MongoDB Virtual Machine (Standard_B2s):"
echo "   - 2 vCPUs, 4GB RAM, 8GB SSD"
echo "   - Estimated cost: $62.42/month"
echo "   - With 1-year reserved instance: $39.42/month (37% savings)"
echo ""

# App Service (Basic B1)
echo "🚀 Backend App Service (Basic B1):"
echo "   - 1 vCPU, 1.75GB RAM"
echo "   - Estimated cost: $54.75/month"
echo "   - Includes: SSL, custom domains, auto-scaling"
echo ""

# Static Web Apps
echo "🌐 Frontend Static Web Apps:"
echo "   - Free tier: $0/month"
echo "   - Standard tier: $9/month (if needed for custom domains)"
echo ""

# Networking
echo "🔗 Virtual Network:"
echo "   - VNet: Free"
echo "   - VNet Peering: $0.01/GB (if needed)"
echo "   - Data transfer: $0.08/GB outbound"
echo ""

# Storage for backups
echo "💾 Storage Account (for backups):"
echo "   - Blob storage (50GB): $1.15/month"
echo "   - Transactions: ~$0.50/month"
echo ""

# Optional services
echo "📊 Optional Monitoring Services:"
echo "   - Application Insights: First 5GB free, then $2.88/GB"
echo "   - Log Analytics: First 5GB free, then $2.76/GB"
echo ""

# Total calculation
echo "💵 TOTAL ESTIMATED MONTHLY COST:"
echo "================================================"
echo "Basic deployment:"
echo "   - MongoDB VM: $62.42"
echo "   - App Service: $54.75"
echo "   - Static Web Apps: $0"
echo "   - Storage: $1.65"
echo "   - Monitoring (5GB): $0"
echo "   ------------------------"
echo "   TOTAL: ~$119/month"
echo ""

echo "Optimized deployment (with reserved instances):"
echo "   - MongoDB VM (reserved): $39.42"
echo "   - App Service: $54.75"
echo "   - Static Web Apps: $0"
echo "   - Storage: $1.65"
echo "   - Monitoring (5GB): $0"
echo "   ------------------------"
echo "   TOTAL: ~$96/month"
echo ""

echo "📈 Cost Optimization Tips:"
echo "1. Use Azure Reserved Instances for VMs (save up to 72%)"
echo "2. Auto-shutdown VMs during non-business hours"
echo "3. Use Azure Spot VMs for development/testing"
echo "4. Monitor and optimize resource usage regularly"
echo "5. Use Azure Cost Management alerts"
echo ""

echo "📋 Cost Monitoring Commands:"
echo "# Get current costs"
echo "az consumption usage list --resource-group omyra-rg"
echo ""
echo "# Set up budget alert"
echo "az consumption budget create --resource-group omyra-rg --budget-name omyra-budget --amount 150 --time-grain Monthly"
echo ""

echo "⚠️  Note: These are estimates. Actual costs may vary based on:"
echo "   - Actual usage patterns"
echo "   - Data transfer volumes"
echo "   - Additional services used"
echo "   - Regional pricing differences"
echo ""

echo "🔗 For detailed pricing, visit: https://azure.microsoft.com/en-us/pricing/calculator/"
