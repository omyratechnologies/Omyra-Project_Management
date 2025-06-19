# 🧪 Docker & SSL Testing Guide for pms.omyratech.com

This guide provides comprehensive testing procedures for your Docker deployment with SSL configuration.

## 📋 Prerequisites

Before testing, ensure:
- Domain `pms.omyratech.com` points to your server IP `4.240.101.137`
- DNS propagation is complete (use `nslookup pms.omyratech.com`)
- Server has Docker and Docker Compose installed
- All necessary files are synced to the server

## 🚀 Quick Start Testing

### Method 1: Complete Deployment & Test
```bash
# From your local machine, sync files to server
./sync-to-server.sh

# SSH to server
ssh -i ~/Downloads/omyra-project-management_key.pem azureuser@4.240.101.137

# Run complete deployment and testing
cd omyra-project-nexus
./quick-deploy-test.sh
```

### Method 2: Step-by-Step Testing
```bash
# SSH to server
ssh -i ~/Downloads/omyra-project-management_key.pem azureuser@4.240.101.137
cd omyra-project-nexus

# Test domain connectivity first
./test-domain.sh

# Run server deployment tests
./test-server-deployment.sh

# Deploy application
./deploy.sh
```

## 🔍 Individual Test Scripts

### 1. Domain Testing (`test-domain.sh`)
Tests domain-specific functionality:
- DNS resolution for `pms.omyratech.com`
- Domain connectivity (ping, HTTP, HTTPS)
- SSL certificate validation for domain
- Application endpoint testing
- Domain pointing verification

### 2. Server Deployment Testing (`test-server-deployment.sh`)
Comprehensive server testing:
- System health (memory, disk, uptime)
- Docker installation and status
- Container and network status
- SSL certificate validation
- Service endpoint health checks
- Port availability
- Performance metrics
- Container logs

### 3. Quick Deploy & Test (`quick-deploy-test.sh`)
One-command deployment:
- Environment setup
- SSL certificate generation
- Docker deployment
- Comprehensive testing
- Results summary

## 🌐 Expected Results

After successful deployment:

### URLs to Test:
- **Primary Domain**: https://pms.omyratech.com
- **HTTP Redirect**: http://pms.omyratech.com → https://pms.omyratech.com
- **API Health**: https://pms.omyratech.com/api/health
- **Direct IP**: https://4.240.101.137

### Expected Behaviors:
1. **HTTP requests** should redirect to HTTPS (301 redirect)
2. **HTTPS requests** should serve the application
3. **SSL certificate warning** is expected (self-signed certificate)
4. **API endpoints** should respond correctly
5. **Frontend** should load properly

## 🔒 SSL Certificate Notes

### Self-Signed Certificate
- Domain: `pms.omyratech.com`
- Organization: `Omyra Technologies`
- Browser will show security warning
- Click "Advanced" → "Proceed to pms.omyratech.com (unsafe)"

### Production SSL (Let's Encrypt)
For production, use:
```bash
./setup-letsencrypt.sh
```

## 🐳 Docker Commands for Troubleshooting

### View Running Containers
```bash
docker ps
```

### View Container Logs
```bash
docker compose -f docker-compose.production.yml logs -f
docker compose -f docker-compose.production.yml logs backend
docker compose -f docker-compose.production.yml logs frontend
docker compose -f docker-compose.production.yml logs nginx
```

### Restart Services
```bash
docker compose -f docker-compose.production.yml restart
```

### Rebuild and Restart
```bash
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
```

## 🔧 Common Issues & Solutions

### 1. Domain Not Resolving
- Check DNS settings at your domain registrar
- Verify A record points to `4.240.101.137`
- Wait for DNS propagation (up to 48 hours)

### 2. SSL Connection Fails
- Check if certificates exist: `ls -la ssl/certs/`
- Regenerate certificates: `./generate-ssl-certs.sh`
- Verify nginx configuration

### 3. Application Not Loading
- Check container status: `docker ps`
- View logs: `docker compose logs`
- Test backend directly: `curl -k https://localhost:5000/health`

### 4. API Endpoints Not Working
- Check backend container logs
- Verify environment variables
- Test database connection

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Quick health check
curl -k https://pms.omyratech.com/api/health

# Comprehensive test
./test-server-deployment.sh
```

### Performance Monitoring
```bash
# System resources
htop
df -h
free -h

# Docker stats
docker stats
```

### Log Monitoring
```bash
# Real-time logs
docker compose -f docker-compose.production.yml logs -f

# Nginx access logs
docker compose -f docker-compose.production.yml exec nginx tail -f /var/log/nginx/access.log
```

## 🎯 Testing Checklist

- [ ] Domain resolves to correct IP
- [ ] HTTP redirects to HTTPS
- [ ] HTTPS serves application
- [ ] SSL certificate is valid for domain
- [ ] API endpoints respond correctly
- [ ] Frontend loads and functions
- [ ] Database connectivity works
- [ ] All containers are running
- [ ] No critical errors in logs
- [ ] Performance is acceptable

## 📞 Support

If you encounter issues:
1. Run the comprehensive test: `./test-server-deployment.sh`
2. Check container logs: `docker compose logs`
3. Verify domain DNS settings
4. Check firewall and security group settings
5. Review nginx configuration
