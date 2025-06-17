# Omyra Project Management System - Testing Guide

## 🎯 System Overview

The Omyra Project Management System has been successfully migrated from Supabase to a custom Node.js/Express/MongoDB backend. This guide provides comprehensive instructions for testing all features.

## 🚀 Quick Start

### Prerequisites
1. Backend server running on `http://localhost:5001`
2. Frontend server running on `http://localhost:8080`
3. MongoDB database populated with seed data

### Test Users
All users have the password: `password123`

| Email | Role | Access Level |
|-------|------|--------------|
| admin@omyra.com | Admin | Full system access |
| pm@omyra.com | Project Manager | Create/manage projects and tasks |
| developer@omyra.com | Team Member | View/update assigned tasks |
| designer@omyra.com | Team Member | View/update assigned tasks |

## 🧪 Test Scenarios

### 1. Authentication Testing

#### Login Test
1. Open `http://localhost:8080` in your browser
2. You should be redirected to `/auth` (login page)
3. Test login with:
   - Email: `admin@omyra.com`
   - Password: `password123`
4. Verify successful redirect to dashboard
5. Check that user name appears in top navigation

#### Logout Test
1. Click on user menu in top-right corner
2. Click "Logout"
3. Verify redirect to login page
4. Try accessing `/` directly - should redirect to `/auth`

#### Registration Test
1. On auth page, switch to "Sign Up" tab
2. Enter test data:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `testpass123`
3. Verify account creation and automatic login

### 2. Dashboard Testing

#### Dashboard Overview
1. Login as admin user
2. Verify dashboard loads with:
   - Project overview cards
   - Recent activity feed
   - Team activity section
   - Quick stats

#### Navigation Testing
1. Test all sidebar navigation links:
   - Dashboard (/)
   - Projects (/projects)
   - Tasks (/tasks)
   - Team (/team)
   - Settings (/settings)
2. Verify each page loads without errors

### 3. Projects Management Testing

#### View Projects
1. Navigate to `/projects`
2. Verify list of projects displays:
   - E-commerce Platform (Active)
   - Mobile App Development (Planning)
   - API Modernization (Active)

#### Create Project (Admin/PM only)
1. Login as admin or pm user
2. Click "Create Project" button
3. Fill form:
   - Title: `Test Project`
   - Description: `Testing project creation`
   - Status: `planning`
   - Start Date: Current date
   - End Date: Future date
4. Submit and verify project appears in list

#### Project Details
1. Click on any project card
2. Verify project details modal/page opens
3. Check project information, members, and tasks

#### Update Project (Creator/Admin only)
1. Open project details
2. Click edit button
3. Modify project information
4. Save and verify changes persist

### 4. Task Management Testing

#### View Tasks
1. Navigate to `/tasks`
2. Verify tasks display with:
   - Task titles and descriptions
   - Status indicators (Todo, In Progress, Review, Done)
   - Priority badges (Low, Medium, High, Urgent)
   - Assigned user avatars
   - Due dates

#### Create Task (Admin/PM only)
1. Click "Create Task" button
2. Fill form:
   - Title: `Test Task`
   - Description: `Testing task creation`
   - Status: `todo`
   - Priority: `medium`
   - Project: Select from dropdown
   - Assigned To: Select team member
   - Due Date: Future date
3. Submit and verify task appears in list

#### Update Task Status
1. Find a task assigned to current user
2. Click on task to open details
3. Change status (e.g., from Todo to In Progress)
4. Verify status updates in task list

#### Task Filtering
1. Test status filters (All, Todo, In Progress, etc.)
2. Test priority filters
3. Test search functionality
4. Verify filters work correctly

### 5. Team Management Testing

#### View Team Members
1. Navigate to `/team`
2. Verify all team members display:
   - System Administrator (Admin)
   - Project Manager (PM)
   - Senior Developer (Team Member)
   - UI/UX Designer (Team Member)

#### Member Profiles
1. Click on team member cards
2. Verify profile information displays
3. Check role badges and permissions

#### Invite Team Member (Admin only)
1. Login as admin
2. Look for "Invite Member" button
3. Test invitation flow if implemented

### 6. Role-Based Access Control (RBAC) Testing

#### Admin Access
1. Login as admin user
2. Verify access to:
   - All projects (read/write)
   - All tasks (read/write)
   - Team management
   - System settings
   - User management

#### Project Manager Access
1. Login as pm user
2. Verify can:
   - Create/edit projects
   - Create/assign tasks
   - View all team members
   - Cannot access admin settings

#### Team Member Access
1. Login as developer or designer
2. Verify can:
   - View assigned projects
   - Update own task status
   - View team members
   - Cannot create projects or tasks
   - Cannot access admin functions

### 7. API Integration Testing

#### Network Requests
1. Open browser dev tools (F12)
2. Navigate through the app
3. Monitor Network tab for API calls
4. Verify all requests return 200 status codes
5. Check request/response data structure

#### Error Handling
1. Stop the backend server temporarily
2. Try performing actions in frontend
3. Verify error messages display properly
4. Restart backend and verify recovery

### 8. Responsive Design Testing

#### Mobile View
1. Resize browser to mobile width
2. Verify sidebar collapses to hamburger menu
3. Test navigation on mobile
4. Verify all forms are usable on mobile

#### Tablet View
1. Test at tablet breakpoint
2. Verify layout adjusts appropriately
3. Test all interactive elements

## 🔍 API Endpoint Testing

You can test API endpoints directly using curl or Postman:

### Authentication
```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@omyra.com", "password": "password123"}'

# Get Profile (requires token)
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Projects
```bash
# Get all projects
curl -X GET http://localhost:5001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create project
curl -X POST http://localhost:5001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Project", "description": "Testing", "status": "planning"}'
```

### Tasks
```bash
# Get all tasks
curl -X GET http://localhost:5001/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Update task status
curl -X PATCH http://localhost:5001/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

## 🚨 Known Issues & Limitations

1. **Real-time Updates**: Currently no WebSocket implementation for live updates
2. **File Uploads**: Avatar uploads not yet implemented
3. **Email Notifications**: Not implemented in current version
4. **Advanced Filtering**: Some advanced filter options may need refinement

## ✅ Success Criteria

The system is working correctly if:

1. ✅ All users can login/logout successfully
2. ✅ Dashboard displays data from backend
3. ✅ Projects CRUD operations work for authorized users
4. ✅ Tasks CRUD operations work for authorized users
5. ✅ RBAC restricts access appropriately
6. ✅ All API endpoints return expected data
7. ✅ Frontend handles errors gracefully
8. ✅ Navigation works across all pages
9. ✅ Responsive design works on different screen sizes
10. ✅ No console errors in browser dev tools

## 🎉 What's Been Accomplished

- ✅ Complete removal of Supabase dependencies
- ✅ New Node.js/Express/MongoDB backend
- ✅ Full authentication system with JWT
- ✅ Role-based access control (RBAC)
- ✅ RESTful API with proper error handling
- ✅ Frontend integration with Axios
- ✅ Database seeding with realistic test data
- ✅ Comprehensive documentation
- ✅ All core features working end-to-end

The Omyra Project Management System is now fully operational with the new backend!
