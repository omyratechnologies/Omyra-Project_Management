#!/bin/bash

# =============================================================================
# 🔐 GitHub Secrets Setup Assistant
# =============================================================================

set -e

echo "🔐 GitHub Secrets Setup Assistant"
echo "================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}This script will help you set up GitHub repository secrets for CI/CD deployment.${NC}"
echo ""

# Repository information
REPO_OWNER="omyratechnologies"
REPO_NAME="Omyra-Project_Management"
GITHUB_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/secrets/actions"

echo -e "${YELLOW}📍 Repository: ${REPO_OWNER}/${REPO_NAME}${NC}"
echo -e "${YELLOW}🔗 Secrets URL: ${GITHUB_URL}${NC}"
echo ""

echo -e "${BLUE}🚨 URGENT: Missing GitHub Secrets Detected!${NC}"
echo ""
echo "Your CI/CD pipeline is failing because the following secrets are not configured:"
echo ""

# Required secrets
echo -e "${RED}❌ HOST${NC} - Server IP address"
echo -e "${RED}❌ USERNAME${NC} - SSH username"  
echo -e "${RED}❌ SSH_KEY${NC} - Private SSH key content"
echo -e "${RED}❌ JWT_SECRET${NC} - JWT signing secret"
echo -e "${RED}❌ EMAIL_HOST${NC} - SMTP server"
echo -e "${RED}❌ EMAIL_PORT${NC} - SMTP port"
echo -e "${RED}❌ EMAIL_USER${NC} - Email username"
echo -e "${RED}❌ EMAIL_PASSWORD${NC} - Email password"
echo -e "${RED}❌ EMAIL_FROM${NC} - From email address"
echo ""

echo -e "${YELLOW}📋 STEP-BY-STEP SETUP INSTRUCTIONS:${NC}"
echo ""

echo "1. 🌐 Open your browser and go to:"
echo "   ${GITHUB_URL}"
echo ""

echo "2. 🔐 Add each secret with these exact names and values:"
echo ""

echo -e "${GREEN}HOST${NC}"
echo "   Value: 4.240.101.137"
echo ""

echo -e "${GREEN}USERNAME${NC}"
echo "   Value: azureuser"
echo ""

echo -e "${GREEN}SSH_KEY${NC}"
echo "   Value: [Complete content of your SSH private key file]"
echo "   📝 Copy the entire content of omyra-project-management_key.pem"
echo "   📝 Include -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----"
echo ""

echo -e "${GREEN}JWT_SECRET${NC}"
echo "   Value: $(openssl rand -hex 32)"
echo "   📝 Copy the random string above (generated fresh)"
echo ""

echo -e "${GREEN}EMAIL_HOST${NC}"
echo "   Value: smtp.gmail.com"
echo "   📝 Or your preferred SMTP server"
echo ""

echo -e "${GREEN}EMAIL_PORT${NC}"
echo "   Value: 587"
echo ""

echo -e "${GREEN}EMAIL_USER${NC}"
echo "   Value: your-email@gmail.com"
echo "   📝 Replace with your actual email"
echo ""

echo -e "${GREEN}EMAIL_PASSWORD${NC}"
echo "   Value: your-app-password"
echo "   📝 For Gmail, use App Password (not regular password)"
echo ""

echo -e "${GREEN}EMAIL_FROM${NC}"
echo "   Value: noreply@pms.omyratech.com"
echo "   📝 Or your preferred from address"
echo ""

echo -e "${BLUE}3. 🔄 After adding all secrets:${NC}"
echo "   - Go to Actions tab in your repository"
echo "   - Re-run the failed workflow"
echo "   - Or push a new commit to trigger deployment"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT NOTES:${NC}"
echo "   • Secret names must match exactly (case-sensitive)"
echo "   • SSH_KEY must be the complete private key file content"
echo "   • JWT_SECRET should be a strong random string"
echo "   • Email settings are required for notifications"
echo ""

echo -e "${GREEN}🎯 Quick Test Command:${NC}"
echo "After setting up secrets, test with:"
echo "git commit --allow-empty -m 'Test deployment with secrets' && git push origin main"
echo ""

echo -e "${BLUE}🔗 Useful Links:${NC}"
echo "GitHub Secrets: ${GITHUB_URL}"
echo "Gmail App Passwords: https://support.google.com/accounts/answer/185833"
echo ""

echo -e "${GREEN}✅ Ready to set up secrets? Open the GitHub URL above and follow the instructions!${NC}"
