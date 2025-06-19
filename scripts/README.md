# 🛠️ Scripts Directory

This directory contains all operational scripts for the Omyra Project Management System, organized by function for easy maintenance and execution.

## 📁 Directory Structure

### 🚀 `/deployment/`
Scripts for deploying and managing the application across environments.

**Files:**
- `deploy-advanced.sh` - Advanced deployment script with additional features
- `deploy.sh` - Standard deployment script for production
- `quick-deploy-test.sh` - Quick deployment testing script
- `setup-github-secrets.sh` - Script to configure GitHub repository secrets
- `sync-to-server.sh` - Server synchronization script

### 🔒 `/ssl/`
SSL certificate management and security configuration scripts.

**Files:**
- `fix-ssl.sh` - SSL configuration fix and repair script
- `generate-ssl-certs.sh` - SSL certificate generation script
- `renew-certs.sh` - SSL certificate renewal automation
- `setup-letsencrypt.sh` - Let's Encrypt SSL setup script
- `setup-ssl.sh` - General SSL configuration setup
- `test-ssl.sh` - SSL configuration testing and validation

### 🧪 `/testing/`
Scripts for testing system functionality and validating deployments.

**Files:**
- `diagnose-500-error.sh` - Diagnostic script for HTTP 500 errors
- `test-ci-cd.sh` - CI/CD pipeline testing script
- `test-deployment.sh` - Deployment validation script
- `test-domain.sh` - Domain configuration testing script
- `test-server-deployment.sh` - Server deployment testing script

### 📊 `/monitoring/`
System monitoring and health check scripts.

**Files:**
- `monitor.sh` - System monitoring and health check script

## 🎯 Script Categories

### **Deployment Scripts**
Automate the deployment process, environment setup, and configuration management.

**Key Features:**
- Environment variable configuration
- Docker container management
- Service orchestration
- Database initialization
- File synchronization

### **SSL Management Scripts**
Handle SSL certificate lifecycle and security configuration.

**Key Features:**
- Certificate generation (self-signed and Let's Encrypt)
- Automatic renewal setup
- SSL configuration validation
- Certificate installation and deployment
- Security hardening

### **Testing Scripts**
Validate system functionality and deployment success.

**Key Features:**
- Health check validations
- API endpoint testing
- Service connectivity verification
- Error diagnosis and reporting
- Performance validation

### **Monitoring Scripts**
Continuous system monitoring and alerting.

**Key Features:**
- Service status monitoring
- Resource usage tracking
- Log analysis and alerting
- Performance metrics collection
- Automated reporting

## 🚀 Quick Reference

| Task | Script |
|------|--------|
| Deploy to production | `./scripts/deployment/deploy.sh` |
| Set up SSL certificates | `./scripts/ssl/setup-letsencrypt.sh` |
| Test deployment | `./scripts/testing/test-deployment.sh` |
| Monitor system | `./scripts/monitoring/monitor.sh` |
| Diagnose 500 errors | `./scripts/testing/diagnose-500-error.sh` |
| Renew SSL certificates | `./scripts/ssl/renew-certs.sh` |

## 📋 Script Usage Guidelines

### **Before Running Scripts:**
1. Ensure you have appropriate permissions
2. Review script configuration variables
3. Test in development environment first
4. Have backup/rollback plan ready

### **Environment Variables:**
Most scripts rely on environment variables. Ensure these are properly configured:
- `HOST` - Server hostname/IP
- `USERNAME` - SSH username
- `SSH_KEY` - SSH private key path
- `JWT_SECRET` - JWT signing secret
- `MONGODB_URI` - MongoDB connection string

### **Execution Permissions:**
Make scripts executable before running:
```bash
chmod +x scripts/deployment/deploy.sh
chmod +x scripts/ssl/setup-ssl.sh
chmod +x scripts/testing/test-deployment.sh
```

### **Logging:**
Scripts generate logs in their respective directories. Always check logs after execution:
```bash
# View recent deployment logs
tail -f /var/log/deployment.log

# Check SSL setup logs
tail -f /var/log/ssl-setup.log
```

## 🔧 Script Maintenance

### **Regular Updates:**
- Update scripts when system architecture changes
- Test scripts after infrastructure modifications
- Keep documentation synchronized with script changes
- Version control all script modifications

### **Security Considerations:**
- Regularly review scripts for security vulnerabilities
- Update credentials and secrets periodically
- Audit script permissions and access controls
- Implement proper error handling and logging

### **Testing:**
- Test scripts in staging environment before production
- Validate error handling and rollback procedures
- Document expected outputs and failure scenarios
- Maintain comprehensive test coverage

## ⚠️ Important Notes

1. **Production Safety:** Always test scripts in development/staging first
2. **Backups:** Ensure proper backups before running deployment scripts
3. **Monitoring:** Monitor system during and after script execution
4. **Documentation:** Keep execution logs and document any issues
5. **Access Control:** Restrict script access to authorized personnel only

---

*Last updated: June 19, 2025*  
*Maintained by: Omyra Technologies DevOps Team*
