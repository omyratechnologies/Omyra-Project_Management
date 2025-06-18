# Role-Based Access Control (RBAC) Implementation

## Overview
This document outlines the comprehensive RBAC system implemented for the Omyra Project Management platform, ensuring proper access control based on user roles.

## User Roles

### 1. Admin
- **Full system access and control**
- Can perform all CRUD operations
- Can change project status anytime
- Can delete meetings
- Can manage all projects, tasks, and users
- Has override permissions for all operations

### 2. Project Manager
- **Project and team management capabilities**
- Can access only assigned projects
- Can assign tasks to developers and team members
- Can create and attend meetings
- Can edit meeting links but **cannot delete meetings**
- Can manage project members and resources
- Cannot change project status (Admin only)

### 3. Team Member/Developer
- **Limited access to assigned work**
- Can view assigned projects and tasks
- Can view other members in the same projects
- Can raise issues or remarks in tasks
- Can view and attend meetings
- Can add reasons if unable to join meetings
- Cannot assign tasks to others
- Cannot create meetings

### 4. Client
- **Read-only access with feedback capabilities**
- Can view respective projects and members
- Can provide feedback and new requests
- Can view project progress and updates
- Cannot access tasks, meetings, or internal operations
- Cannot modify any project data

## Detailed Permissions

### Project Management

#### Admin Permissions:
- ✅ View all projects
- ✅ Create new projects
- ✅ Update any project
- ✅ Change project status (planning → active → completed, etc.)
- ✅ Delete projects
- ✅ Add/remove project members
- ✅ Access all project data

#### Project Manager Permissions:
- ✅ View assigned projects only
- ✅ Create new projects
- ✅ Update assigned projects
- ❌ Change project status (Admin only)
- ❌ Delete projects (Admin only)
- ✅ Add/remove members from assigned projects
- ✅ Manage project resources

#### Team Member Permissions:
- ✅ View assigned projects only
- ✅ View project members in same projects
- ❌ Create projects
- ❌ Update projects
- ❌ Change project status
- ❌ Delete projects
- ❌ Manage project members

#### Client Permissions:
- ✅ View associated projects only
- ✅ View project members
- ❌ Create/update/delete projects
- ❌ Change project status
- ❌ Manage project members

### Task Management

#### Admin Permissions:
- ✅ View all tasks
- ✅ Create tasks in any project
- ✅ Assign tasks to any user
- ✅ Update any task
- ✅ Delete any task
- ✅ Resolve task issues

#### Project Manager Permissions:
- ✅ View tasks in assigned projects
- ✅ Create tasks in assigned projects
- ✅ Assign tasks to team members and developers
- ✅ Update tasks in assigned projects
- ✅ Delete tasks in assigned projects
- ✅ Manage task issues

#### Team Member Permissions:
- ✅ View assigned tasks only
- ✅ Update assigned task status
- ✅ Create task issues/remarks
- ❌ Create new tasks
- ❌ Assign tasks to others
- ❌ Delete tasks

#### Client Permissions:
- ❌ No task access
- ❌ Cannot view, create, or modify tasks

### Meeting Management

#### Admin Permissions:
- ✅ View all meetings
- ✅ Create meetings
- ✅ Update any meeting
- ✅ Edit meeting links
- ✅ **Delete meetings** (Only role with delete permission)
- ✅ Manage attendees

#### Project Manager Permissions:
- ✅ View project meetings
- ✅ Create meetings for assigned projects
- ✅ Update meeting details
- ✅ **Edit meeting links** (Special permission)
- ❌ **Delete meetings** (Admin only)
- ✅ Manage attendees

#### Team Member Permissions:
- ✅ View assigned meetings
- ✅ Attend meetings
- ✅ Add attendance status and reasons
- ❌ Create meetings
- ❌ Update meetings
- ❌ Edit meeting links
- ❌ Delete meetings

#### Client Permissions:
- ✅ View project-related meetings (if invited)
- ✅ Attend meetings (if invited)
- ❌ Create/update/delete meetings
- ❌ Edit meeting links

### Feedback and Issues

#### Task Issues (Team Members and above):
- ✅ **Team Members**: Can create issues for assigned tasks
- ✅ **Project Managers**: Can create and resolve issues in assigned projects
- ✅ **Admins**: Can manage all task issues
- ❌ **Clients**: Cannot create task issues

#### Client Feedback (Clients only):
- ✅ **Clients**: Can provide feedback on associated projects
- ✅ **Project Managers/Admins**: Can respond to feedback
- ❌ **Team Members**: Cannot access client feedback

### Confluence Pages (Knowledge Management)

#### Creation and Editing:
- ✅ **Admins**: Full access to all pages
- ✅ **Project Managers**: Can create and edit project-related pages
- ✅ **Team Members**: Can create documentation and meeting notes
- ❌ **Clients**: Cannot create confluence pages

#### Viewing:
- Based on page permissions and role-based access
- Public pages visible to all roles
- Private pages restricted by role permissions

## API Endpoints and Permissions

### Authentication Required:
All endpoints require valid JWT authentication.

### Role-Based Endpoint Access:

```typescript
// Project Status Changes (Admin Only)
PUT /api/projects/:id/status
Middleware: canChangeProjectStatus (Admin only)

// Task Assignment (Admin and PM only)
PUT /api/tasks/:id/assign
Middleware: canAssignTasks

// Meeting Link Editing (Admin and PM only)
PUT /api/meetings/:id/link
Middleware: canEditMeetingLinks

// Meeting Deletion (Admin only)
DELETE /api/meetings/:id
Middleware: canDeleteMeeting

// Task Issues (Team Members and above)
POST /api/tasks/:taskId/issues
Middleware: canCreateTaskIssue

// Client Feedback (Clients only)
POST /api/projects/:projectId/feedback
Middleware: canCreateFeedback
```

## Middleware Functions

### Core RBAC Middleware:
- `authorize(...roles)`: Basic role checking
- `isAdmin`: Admin-only access
- `isAdminOrProjectManager`: Admin or PM access
- `isNotClient`: All roles except client
- `isTeamMemberOrAbove`: Team member and above

### Advanced Permission Middleware:
- `canManageProject`: Project-specific management permissions
- `canViewProject`: Project viewing permissions
- `canAssignTasks`: Task assignment permissions
- `canManageMeetings`: Meeting management permissions
- `canEditMeetingLinks`: Meeting link editing permissions
- `canDeleteMeeting`: Meeting deletion permissions (Admin only)
- `canChangeProjectStatus`: Project status change permissions (Admin only)
- `canCreateTaskIssue`: Task issue creation permissions
- `canCreateFeedback`: Feedback creation permissions (Client only)

## Content Filtering

### Role-Based Content Display:

#### Admin:
- Sees all content across the system
- Full dashboard with system-wide analytics
- Complete user and project management tools

#### Project Manager:
- Sees only assigned projects and related content
- Project-specific dashboard and analytics
- Team management tools for assigned projects

#### Team Member:
- Sees only assigned tasks and projects
- Personal dashboard with assigned work
- Limited view of project members

#### Client:
- Sees only associated projects
- Project progress and milestone views
- Feedback and communication tools

## Security Features

### Access Control:
- JWT-based authentication
- Role-based authorization
- Project membership validation
- Resource ownership verification

### Data Protection:
- User-specific data filtering
- Role-based query restrictions
- Secure API endpoints
- Input validation and sanitization

### Audit Trail:
- Action logging for sensitive operations
- User activity tracking
- Permission change notifications
- Email notifications for important updates

## Implementation Notes

1. **Hierarchical Permissions**: Admin > Project Manager > Team Member > Client
2. **Project-Scoped Access**: Non-admin users only access assigned projects
3. **Meeting Restrictions**: Only admins can delete meetings, PMs can edit links
4. **Task Assignment**: Only admins and PMs can assign tasks
5. **Status Changes**: Only admins can change project status
6. **Feedback System**: Separate channels for internal issues and client feedback
7. **Confluence Integration**: Role-based page creation and viewing permissions

This RBAC system ensures secure, role-appropriate access to all system features while maintaining data integrity and user privacy.
