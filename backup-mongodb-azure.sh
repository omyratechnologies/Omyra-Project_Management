#!/bin/bash

# MongoDB Backup Script for Azure
# Run this script daily to backup your MongoDB database

set -e

MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_USER="omyra-app"
MONGODB_PASSWORD="your-app-password"
MONGODB_DATABASE="omyra-project-nexus"

# Azure Storage configuration
AZURE_STORAGE_ACCOUNT="omyrabackups"
AZURE_STORAGE_CONTAINER="mongodb-backups"

# Backup directory
BACKUP_DIR="/tmp/mongodb-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="omyra-backup-$DATE"

echo "🗄️ Starting MongoDB backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Create MongoDB dump
echo "📦 Creating database dump..."
mongodump \
  --host $MONGODB_HOST:$MONGODB_PORT \
  --username $MONGODB_USER \
  --password $MONGODB_PASSWORD \
  --authenticationDatabase $MONGODB_DATABASE \
  --db $MONGODB_DATABASE \
  --out $BACKUP_DIR/$BACKUP_NAME

# Compress backup
echo "🗜️ Compressing backup..."
cd $BACKUP_DIR
tar -czf "$BACKUP_NAME.tar.gz" $BACKUP_NAME

# Upload to Azure Storage (requires Azure CLI)
echo "☁️ Uploading to Azure Storage..."
az storage blob upload \
  --account-name $AZURE_STORAGE_ACCOUNT \
  --container-name $AZURE_STORAGE_CONTAINER \
  --name "$BACKUP_NAME.tar.gz" \
  --file "$BACKUP_NAME.tar.gz" \
  --auth-mode login

# Clean up local files older than 7 days
echo "🧹 Cleaning up old local backups..."
find $BACKUP_DIR -name "omyra-backup-*.tar.gz" -mtime +7 -delete
rm -rf $BACKUP_DIR/$BACKUP_NAME

# Clean up old Azure backups (keep last 30 days)
echo "🗑️ Cleaning up old Azure backups..."
CUTOFF_DATE=$(date -d '30 days ago' +%Y%m%d)

az storage blob list \
  --account-name $AZURE_STORAGE_ACCOUNT \
  --container-name $AZURE_STORAGE_CONTAINER \
  --query "[?properties.lastModified < '$CUTOFF_DATE'].name" \
  --output tsv | while read blob; do
    if [ ! -z "$blob" ]; then
        echo "Deleting old backup: $blob"
        az storage blob delete \
          --account-name $AZURE_STORAGE_ACCOUNT \
          --container-name $AZURE_STORAGE_CONTAINER \
          --name "$blob" \
          --auth-mode login
    fi
done

echo "✅ Backup completed successfully!"
echo "Backup name: $BACKUP_NAME.tar.gz"

# Optional: Send notification (requires additional setup)
# curl -X POST "https://your-notification-webhook" \
#   -H "Content-Type: application/json" \
#   -d "{\"message\": \"MongoDB backup completed: $BACKUP_NAME.tar.gz\"}"
