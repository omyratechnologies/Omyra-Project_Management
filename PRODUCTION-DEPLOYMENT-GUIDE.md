# 🚀 Production Deployment Guide

This guide will help you deploy your Omyra Project Management System to production.

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Production MongoDB database ready (MongoDB Atlas recommended)
- [ ] Domain name configured with DNS pointing to your server
- [ ] SSL certificate obtained (Let's Encrypt recommended) **✨ Now automated!**
- [ ] Email service provider configured (SendGrid, AWS SES, or Gmail)
- [ ] Server with Node.js 18+ installed
- [ ] Docker and Docker Compose installed

### 2. SSL Certificate Setup
**Option 1: Let's Encrypt (Recommended for Production)**
```bash
# Set up Let's Encrypt SSL certificates (requires sudo)
sudo ./setup-letsencrypt.sh yourdomain.com admin@yourdomain.com
```

**Option 2: Self-signed (Development/Testing)**
```bash
# Generate self-signed certificates
./generate-ssl-certs.sh
```

### 3. Security Configuration
- [ ] Strong JWT secret generated (256-bit recommended)
- [ ] Environment variables configured
- [ ] Firewall configured (ports 80, 443, and your backend port)
- [ ] Regular backups scheduled for database

## 🔧 Environment Variables

### Backend (.env.production)
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your-super-secure-256-bit-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Security
TRUST_PROXY=true
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
```

### Frontend (.env.production)
```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_ENVIRONMENT=production
```

## 🚀 Deployment Options

### Option 1: Traditional Server Deployment

#### Step 1: Prepare the Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### Step 2: Deploy Backend
```bash
# Clone your repository
git clone your-repo-url
cd omyra-project-nexus

# Set up environment variables
cp backend/.env.production backend/.env
# Edit the .env file with your production values

# Build and start backend
cd backend
npm ci --only=production
npm run build:production

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Step 3: Deploy Frontend
```bash
# Build frontend
cd ../frontend
cp .env.production .env
npm ci --only=production
npm run build:production

# Copy to web server directory
sudo cp -r dist/* /var/www/html/
```

#### Step 4: Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/omyra

# Add configuration (see nginx.production.conf)
# Enable site
sudo ln -s /etc/nginx/sites-available/omyra /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Docker Deployment

#### Step 1: Build and Run with Docker Compose
```bash
# Set environment variables
export MONGODB_URI="your-mongodb-uri"
export JWT_SECRET="your-jwt-secret"
export FRONTEND_URL="https://yourdomain.com"
# ... set other variables

# Build and start
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml logs
```

## 🔍 Testing Production Deployment

### 1. Run Pre-deployment Tests
```bash
# Set your environment variables first
export MONGODB_URI="your-mongodb-uri"
export JWT_SECRET="your-jwt-secret"
export FRONTEND_URL="https://yourdomain.com"

# Run tests
./test-production.sh
```

### 2. Manual Testing Checklist
- [ ] Website loads at your domain
- [ ] User registration works
- [ ] User login works
- [ ] Email notifications work
- [ ] All major features functional
- [ ] API endpoints respond correctly
- [ ] WebSocket connections work
- [ ] File uploads work (if applicable)

## 📊 Monitoring and Maintenance

### 1. Application Monitoring
```bash
# Check PM2 status
pm2 status
pm2 logs

# Check system resources
htop
df -h
```

### 2. Database Monitoring
- Monitor MongoDB Atlas dashboard
- Set up alerts for high CPU/memory usage
- Regular database backups

### 3. Log Management
```bash
# View application logs
tail -f backend/logs/production.log

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔐 Security Best Practices

### 1. Server Security
- Keep system updated
- Use firewall (ufw recommended)
- Disable root SSH login
- Use SSH keys instead of passwords
- Regular security updates

### 2. Application Security
- Strong JWT secrets
- HTTPS only in production
- Security headers configured
- Rate limiting enabled
- Input validation on all endpoints

### 3. Database Security
- Use MongoDB Atlas with IP whitelist
- Strong database passwords
- Enable database encryption
- Regular backups

## 🆘 Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check logs
pm2 logs
# Check environment variables
pm2 env 0
# Restart application
pm2 restart all
```

#### Frontend not loading
```bash
# Check Nginx configuration
sudo nginx -t
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
# Check file permissions
ls -la /var/www/html/
```

#### Database connection issues
- Verify MONGODB_URI format
- Check MongoDB Atlas IP whitelist
- Verify network connectivity
- Check database credentials

#### Email not working
- Verify email service credentials
- Check email service quotas
- Test SMTP connection
- Check spam filters

## 📞 Support

If you encounter issues during deployment:

1. Check the logs first
2. Verify all environment variables
3. Test individual components
4. Review the production checklist
5. Check firewall and network settings

## 🔄 Updates and Maintenance

### Deploying Updates
```bash
# Pull latest changes
git pull origin main

# Backend updates
cd backend
npm ci --only=production
npm run build:production
pm2 restart all

# Frontend updates
cd ../frontend
npm ci --only=production
npm run build:production
sudo cp -r dist/* /var/www/html/
```

### Backup Strategy
- Daily database backups
- Weekly full system backups
- Test backup restoration regularly
- Store backups in multiple locations
