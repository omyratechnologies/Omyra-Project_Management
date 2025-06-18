#!/bin/bash

# Azure MongoDB Setup Script
# Run this script on your Azure VM to set up MongoDB

set -e

echo "🗄️ Setting up MongoDB on Azure VM..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install MongoDB 6.0
echo "🚀 Installing MongoDB 6.0..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Create MongoDB configuration
echo "⚙️ Configuring MongoDB..."
sudo tee /etc/mongod.conf > /dev/null <<EOF
# mongod.conf for Azure production

# Where to store data
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1  # Adjust based on your VM size

# Logging
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  logRotate: reopen

# Network
net:
  port: 27017
  bindIp: 0.0.0.0
  maxIncomingConnections: 100

# Process management
processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid

# Security
security:
  authorization: enabled

# Replica Set
replication:
  replSetName: "rs0"

# Operation Profiling (optional)
operationProfiling:
  slowOpThresholdMs: 100
  mode: slowOp
EOF

# Start MongoDB
echo "🚀 Starting MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Wait for MongoDB to start
sleep 10

# Check if MongoDB is running
if ! sudo systemctl is-active --quiet mongod; then
    echo "❌ MongoDB failed to start"
    exit 1
fi

echo "✅ MongoDB installed and started successfully"

# Create admin user
echo "👤 Creating admin user..."
mongosh --eval "
use admin;
db.createUser({
  user: 'admin',
  pwd: 'admin-password-change-this',
  roles: ['userAdminAnyDatabase', 'dbAdminAnyDatabase', 'readWriteAnyDatabase']
});
print('Admin user created');
"

# Initialize replica set
echo "🔄 Initializing replica set..."
mongosh --eval "
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'localhost:27017' }
  ]
});
print('Replica set initialized');
"

# Create application database and user
echo "🗃️ Creating application database and user..."
mongosh -u admin -p admin-password-change-this --authenticationDatabase admin --eval "
use omyra-project-nexus;
db.createUser({
  user: 'omyra-app',
  pwd: 'app-password-change-this',
  roles: ['readWrite']
});
print('Application user created');
"

# Set up log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/mongodb > /dev/null <<EOF
/var/log/mongodb/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 640 mongodb mongodb
    postrotate
        /bin/kill -SIGUSR1 \$(cat /var/run/mongodb/mongod.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
EOF

# Configure firewall (if ufw is enabled)
if sudo ufw status | grep -q "Status: active"; then
    echo "🔥 Configuring firewall..."
    sudo ufw allow from 10.1.2.0/24 to any port 27017
    echo "Firewall configured to allow MongoDB access from backend subnet"
fi

echo "🎉 MongoDB setup completed!"
echo ""
echo "⚠️  IMPORTANT: Change the default passwords!"
echo "Admin password: admin-password-change-this"
echo "App password: app-password-change-this"
echo ""
echo "Connection string for your application:"
echo "mongodb://omyra-app:app-password-change-this@<this-vm-private-ip>:27017/omyra-project-nexus?authSource=omyra-project-nexus&replicaSet=rs0"
echo ""
echo "Next steps:"
echo "1. Change the default passwords"
echo "2. Test the connection from your backend"
echo "3. Set up regular backups"
