# 🚀 Omyra Project Nexus - Live Application Testing Package

## 📋 **Application Information**

### 🌐 **Live Application Access**
- **Production URL**: `https://pms.omyratech.com`
- **Deployment Date**: June 19, 2025
- **Status**: ✅ Live and Ready for Testing
- **SSL Certificate**: ✅ Let's Encrypt (Trusted)

### 🏗️ **System Architecture**
- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express API
- **Database**: MongoDB
- **Server**: Azure VM (Ubuntu 24.04.2 LTS)
- **Web Server**: Nginx with SSL termination

---

## 👤 **Test Accounts**

### 🔐 **Admin Accounts**
1. **Primary Administrator**
   - **Email**: `admin@omyratech.com`
   - **Password**: `admin123`
   - **Role**: Admin
   - **Access**: Full system administration

2. **Super Administrator**
   - **Email**: `superadmin@omyratech.com`
   - **Password**: `superadmin123`
   - **Role**: Admin
   - **Access**: Full system administration

### ℹ️ **Additional Test Users**
*Note: Additional test users can be created by admins during testing*

---

## 🧪 **Testing Scope**

### 🎯 **Core Features to Test**

#### 1. **Authentication & Authorization**
- [ ] User registration (if enabled)
- [ ] User login/logout
- [ ] Password reset functionality
- [ ] Role-based access control
- [ ] Session management

#### 2. **Admin Dashboard**
- [ ] Dashboard statistics and metrics
- [ ] User management (create, edit, delete users)
- [ ] Role management and permissions
- [ ] System configuration
- [ ] Analytics and reporting

#### 3. **Project Management**
- [ ] Create new projects
- [ ] Edit project details
- [ ] Project status updates
- [ ] Project member assignment
- [ ] Project deletion

#### 4. **Task Management**
- [ ] Create tasks within projects
- [ ] Assign tasks to team members
- [ ] Update task status
- [ ] Task comments and collaboration
- [ ] Task deadlines and reminders

#### 5. **Team Management**
- [ ] Team member invitations
- [ ] Team roles and permissions
- [ ] Team communication features
- [ ] Member activity tracking

#### 6. **Client Management**
- [ ] Client account creation
- [ ] Client project assignments
- [ ] Client feedback system
- [ ] Client communication

#### 7. **Notification System**
- [ ] Email notifications
- [ ] In-app notifications
- [ ] Notification preferences
- [ ] Real-time updates

#### 8. **Confluence Integration**
- [ ] Confluence page creation
- [ ] Document management
- [ ] Integration functionality

---

## 🔍 **Testing Guidelines**

### ✅ **Functional Testing**
1. **Login Process**
   - Test with valid credentials
   - Test with invalid credentials
   - Test password reset flow

2. **Navigation**
   - Test all menu items
   - Verify proper page loading
   - Check responsive design

3. **CRUD Operations**
   - Create, Read, Update, Delete for all entities
   - Data validation
   - Error handling

4. **User Permissions**
   - Test role-based access
   - Verify admin-only features
   - Check unauthorized access prevention

### 🛡️ **Security Testing**
- [ ] HTTPS enforcement
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Authentication bypass attempts

### 📱 **UI/UX Testing**
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] User interface consistency
- [ ] Loading times and performance

### 🔄 **Integration Testing**
- [ ] API endpoints functionality
- [ ] Database operations
- [ ] Email service integration
- [ ] File upload/download

---

## 🐛 **Bug Reporting**

### 📝 **Bug Report Template**
```
**Bug Title**: [Brief description]
**Severity**: Critical/High/Medium/Low
**Browser**: [Chrome/Firefox/Safari/Edge + Version]
**Device**: [Desktop/Mobile/Tablet]
**URL**: [Page where bug occurred]
**User Account**: [Which test account was used]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Videos**:
[Attach if applicable]

**Additional Notes**:
[Any other relevant information]
```

---

## 🔧 **API Testing**

### 🌐 **Base API URL**
`https://pms.omyratech.com/api`

### 📋 **Key API Endpoints**

#### Authentication
```bash
# Login
POST /api/auth/login
Content-Type: application/json
{
  "email": "admin@omyratech.com",
  "password": "admin123"
}

# Get Profile
GET /api/auth/profile
Authorization: Bearer {token}
```

#### Admin Operations
```bash
# Dashboard Stats
GET /api/admin/dashboard/stats
Authorization: Bearer {token}

# Get All Users
GET /api/admin/users
Authorization: Bearer {token}

# Create User
POST /api/admin/users
Authorization: Bearer {token}
Content-Type: application/json
{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User",
  "role": "team_member"
}
```

### 🧪 **API Testing Tools**
- **Postman Collection**: Available upon request
- **curl Commands**: Provided above
- **Browser Developer Tools**: For manual testing

---

## 📊 **Performance Benchmarks**

### ⚡ **Expected Performance**
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms
- **Database Query Time**: < 200ms
- **File Upload**: < 10 seconds for files < 5MB

### 📈 **Load Testing**
- **Concurrent Users**: Test with 10-50 simultaneous users
- **Peak Load**: Monitor system behavior under stress
- **Memory Usage**: Monitor server resources

---

## 🚨 **Critical Issues to Report Immediately**

1. **Security Vulnerabilities**
   - Unauthorized access to admin features
   - Data exposure or leaks
   - Authentication bypass

2. **Data Loss**
   - User data deletion
   - Project/task data corruption
   - Database connectivity issues

3. **System Crashes**
   - Server downtime
   - Application crashes
   - Database failures

---

## 📞 **Support & Contact**

### 🛠️ **Technical Support**
- **System Administrator**: Available during testing period
- **Developer Team**: On standby for critical issues
- **Response Time**: < 2 hours for critical issues

### 📧 **Reporting Channels**
- **Email**: [Your email for bug reports]
- **Slack/Teams**: [Your communication channel]
- **Issue Tracker**: [GitHub/Jira if applicable]

---

## 📅 **Testing Timeline**

### 🗓️ **Testing Schedule**
- **Start Date**: [Specify date]
- **Duration**: [Specify duration]
- **Daily Testing Hours**: [Specify hours]
- **Final Report Due**: [Specify date]

### 🎯 **Milestones**
- [ ] Day 1-2: Initial setup and basic functionality
- [ ] Day 3-5: Core features and user workflows
- [ ] Day 6-7: Integration and performance testing
- [ ] Day 8-10: Bug fixes and retesting
- [ ] Day 11-12: Final validation and reporting

---

## ✅ **Pre-Testing Checklist**

- [ ] Application is accessible at `https://pms.omyratech.com`
- [ ] Test accounts are working
- [ ] SSL certificate is valid
- [ ] All services are running
- [ ] Testing environment is prepared
- [ ] Bug reporting system is ready
- [ ] Team has access to this documentation

---

## 🎉 **Getting Started**

1. **Access the Application**: Navigate to `https://pms.omyratech.com`
2. **Login**: Use the provided admin credentials
3. **Explore**: Start with the dashboard and navigation
4. **Test**: Follow the testing scope outlined above
5. **Report**: Document any issues using the bug report template

---

**Good luck with testing!** 🚀

*Last Updated: June 19, 2025*
