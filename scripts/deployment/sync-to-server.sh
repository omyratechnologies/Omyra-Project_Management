#!/bin/bash

# ------------------------------------------------------------------------------
# 📤 Sync Local Files to Server
# ------------------------------------------------------------------------------

# Configuration
SERVER_USER="azureuser"
SERVER_IP="4.240.101.137"
SERVER_PATH="/home/azureuser/omyra-project-nexus"
KEY_FILE="$HOME/Downloads/omyra-project-management_key.pem"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m' 
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}📤 Syncing Files to Server${NC}"
echo "=========================="

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo -e "${RED}❌ SSH key not found at: $KEY_FILE${NC}"
    echo "Please update the KEY_FILE path in this script"
    exit 1
fi

echo -e "${BLUE}🔑 Using SSH key: $KEY_FILE${NC}"
echo -e "${BLUE}📍 Target server: $SERVER_USER@$SERVER_IP:$SERVER_PATH${NC}"

# Files and directories to sync
SYNC_ITEMS=(
    "backend/"
    "frontend/"
    "nginx/"
    "ssl/"
    "docker-compose.production.yml"
    "generate-ssl-certs.sh"
    "deploy.sh"
    ".env"
    "test-server-deployment.sh"
    "quick-deploy-test.sh"
    "test-domain.sh"
)

echo -e "\n${YELLOW}📁 Syncing files...${NC}"

# Create remote directory if it doesn't exist
echo "Creating remote directory..."
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"

# Sync each item
for item in "${SYNC_ITEMS[@]}"; do
    if [ -e "$item" ]; then
        echo -e "Syncing: ${GREEN}$item${NC}"
        if [ -d "$item" ]; then
            # Directory
            rsync -avz --delete -e "ssh -i $KEY_FILE" "$item" "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
        else
            # File
            rsync -avz -e "ssh -i $KEY_FILE" "$item" "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
        fi
    else
        echo -e "Skipping: ${YELLOW}$item${NC} (not found)"
    fi
done

echo -e "\n${GREEN}✅ Sync completed!${NC}"

# Make scripts executable on server
echo -e "\n${YELLOW}🔧 Making scripts executable...${NC}"
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" "cd $SERVER_PATH && chmod +x *.sh"

echo -e "\n${CYAN}🚀 Ready to deploy!${NC}"
echo "To connect to server and deploy:"
echo "1. ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP"
echo "2. cd $SERVER_PATH"
echo "3. ./quick-deploy-test.sh"
