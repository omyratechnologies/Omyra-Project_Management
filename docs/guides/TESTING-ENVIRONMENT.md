# 🌐 Omyra Project Nexus - Testing Environment Configuration

## 📋 **Environment Details**

### 🖥️ **Server Information**
- **Provider**: Microsoft Azure
- **OS**: Ubuntu 24.04.2 LTS
- **IP Address**: 4.240.101.137
- **Region**: [Your Azure region]

### 🏗️ **Application Stack**
- **Frontend**: React 18+ with TypeScript, Vite
- **Backend**: Node.js 18+ with Express, TypeScript
- **Database**: MongoDB 6
- **Web Server**: Nginx 1.27.5
- **SSL**: Let's Encrypt (Auto-renewal enabled)

### 🐳 **Docker Services**
```
CONTAINER                        STATUS
omyra-project-nexus-nginx-1      Up (Ports: 80->80, 443->443)
omyra-project-nexus-frontend-1   Up (Internal: 80)
omyra-project-nexus-backend-1    Up (Internal: 5000, Health: OK)
omyra-project-nexus-mongodb-1    Up (Ports: 27017->27017)
```

## 🌐 **URLs & Endpoints**

### 🔗 **Application URLs**
- **Production**: `https://pms.omyratech.com`
- **HTTP Redirect**: `http://pms.omyratech.com` → `https://pms.omyratech.com`

### 🔌 **API Endpoints**
- **Base API**: `https://pms.omyratech.com/api`
- **Health Check**: `https://pms.omyratech.com/api/health`
- **Authentication**: `https://pms.omyratech.com/api/auth/*`
- **Admin Panel**: `https://pms.omyratech.com/api/admin/*`

## 🔐 **Security Configuration**

### 🛡️ **SSL/TLS**
- **Certificate Authority**: Let's Encrypt
- **Certificate Status**: ✅ Valid until September 17, 2025
- **Auto-Renewal**: ✅ Enabled (runs twice daily)
- **HSTS**: Enabled with preload
- **Protocols**: TLS 1.2, TLS 1.3

### 🔒 **Security Headers**
```
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer-when-downgrade
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self' http: https: data: blob: 'unsafe-inline'
```

## 💾 **Database Configuration**

### 🗄️ **MongoDB**
- **Version**: 6.x
- **Database Name**: `omyra-project`
- **Connection**: Internal Docker network
- **Port**: 27017 (accessible for testing)
- **Collections**: users, profiles, projects, tasks, clients, etc.

## 📊 **System Resources**

### 🖥️ **Server Specifications**
- **CPU**: [Azure VM specs]
- **RAM**: [Azure VM specs]
- **Storage**: [Azure VM specs]
- **Network**: High-speed Azure network

### 📈 **Performance Targets**
- **Page Load**: < 3 seconds
- **API Response**: < 500ms
- **Database Query**: < 200ms
- **Concurrent Users**: 50+

## 🔧 **Development Tools**

### 🛠️ **Recommended Testing Tools**
1. **Browser Developer Tools**
   - Chrome DevTools
   - Firefox Developer Tools
   - Safari Web Inspector

2. **API Testing**
   - Postman (collection provided)
   - curl commands
   - Insomnia

3. **Performance Testing**
   - Lighthouse
   - GTmetrix
   - WebPageTest

4. **Security Testing**
   - OWASP ZAP
   - SSL Labs Test
   - Security Headers check

## 📧 **Email Configuration**

### 📮 **SMTP Settings**
- **Host**: smtp.omyratech.com
- **Port**: 465 (SSL)
- **From Address**: noreply@omyratech.com
- **Status**: ✅ Configured and working

## 🔄 **Backup & Recovery**

### 💾 **Data Backup**
- **Database**: Automated daily backups
- **Application**: Git repository backup
- **SSL Certificates**: Auto-renewal with backup

### 🔄 **Recovery Procedures**
- **Application Restart**: Docker compose restart
- **Database Recovery**: MongoDB backup restoration
- **SSL Recovery**: Let's Encrypt re-issuance

## 📞 **Monitoring & Logging**

### 📊 **Available Logs**
```bash
# Application logs
docker logs omyra-project-nexus-backend-1
docker logs omyra-project-nexus-frontend-1
docker logs omyra-project-nexus-nginx-1
docker logs omyra-project-nexus-mongodb-1

# System logs
/var/log/syslog
/var/log/nginx/
```

### 🚨 **Health Monitoring**
- **Application Health**: `GET /api/health`
- **Docker Health**: `docker ps` status
- **SSL Health**: Certificate expiry monitoring

## 🧪 **Testing Data**

### 👥 **Pre-configured Accounts**
```
Admin Account 1:
- Email: admin@omyratech.com
- Password: admin123
- Role: admin

Admin Account 2:
- Email: superadmin@omyratech.com  
- Password: superadmin123
- Role: admin
```

### 📊 **Sample Data**
- **Users**: 2 admin users created
- **Projects**: None (to be created during testing)
- **Tasks**: None (to be created during testing)
- **Clients**: None (to be created during testing)

## ⚠️ **Testing Limitations**

### 🚫 **Restrictions**
- Do not modify server configuration
- Do not delete admin accounts
- Do not perform destructive operations on production data
- Limit file uploads to reasonable sizes

### 🎯 **Focus Areas**
- Functional testing of all features
- User interface and experience
- API functionality and responses  
- Security and authentication
- Performance and responsiveness

## 📋 **Testing Checklist**

### ✅ **Pre-Testing Setup**
- [ ] Verify application accessibility
- [ ] Confirm admin login works
- [ ] Check SSL certificate validity
- [ ] Test API health endpoint
- [ ] Verify email functionality (if applicable)

### 🔄 **Post-Testing Cleanup**
- [ ] Remove test data created
- [ ] Reset any modified settings
- [ ] Document issues found
- [ ] Prepare final testing report

---

**Environment Status**: ✅ Ready for Testing  
**Last Updated**: June 19, 2025  
**Next Review**: [Schedule regular reviews]
