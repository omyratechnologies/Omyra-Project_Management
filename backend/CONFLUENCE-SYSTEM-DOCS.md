# Confluence Knowledge Base System Documentation

## Overview

The Omyra Project Nexus includes a comprehensive knowledge base system built on Confluence-style page management. This system allows teams to create, organize, and maintain documentation, processes, meeting notes, and feature specifications in a centralized location.

## Architecture

### Frontend Components

#### Main Components
- **Location**: `frontend/src/components/confluence/`
- **Purpose**: Complete knowledge base management interface

##### ConfluencePages.tsx
- **Main component** for displaying and managing pages
- **Features**:
  - Page listing with filtering and search
  - CRUD operations for pages
  - Permission-based access control
  - Rich content display
  - Template-based page creation

##### ConfluencePageViewer.tsx
- **Dedicated page viewer** with enhanced reading experience
- **Features**:
  - Full-screen page display
  - Metadata and version information
  - Edit and share functionality
  - Version history tracking
  - Responsive design

##### RichTextEditor.tsx
- **Advanced text editor** with formatting capabilities
- **Features**:
  - Live preview mode
  - Markdown-style formatting
  - Toolbar with common formatting options
  - HTML rendering for complex content
  - Real-time preview

##### PageTemplates.tsx
- **Template system** for common page types
- **Templates Available**:
  - Project Overview
  - Meeting Notes
  - Technical Design Document
  - Feature Requirements
  - Process Documentation
  - Sprint Retrospective

### Backend Components

#### Controllers
- **Location**: `backend/src/controllers/confluenceController.ts`
- **Endpoints**:
  - `POST /api/confluence/pages` - Create new page
  - `GET /api/confluence/pages` - List pages with filtering
  - `GET /api/confluence/pages/:id` - Get specific page
  - `PUT /api/confluence/pages/:id` - Update page
  - `DELETE /api/confluence/pages/:id` - Delete page
  - `GET /api/confluence/pages/:id/versions` - Get page version history

#### Models
- **Location**: `backend/src/models/ConfluencePage.ts`
- **Schema Fields**:
  - `title` - Page title
  - `content` - Page content (supports markdown/HTML)
  - `type` - Page type (feature, documentation, process, meeting_notes)
  - `project` - Associated project (optional)
  - `createdBy` - Page creator
  - `lastModifiedBy` - Last editor
  - `tags` - Page tags for categorization
  - `isPublic` - Public/private visibility
  - `viewPermissions` - Roles allowed to view
  - `editPermissions` - Roles allowed to edit
  - `status` - Page status (draft, published, archived)
  - `version` - Page version number
  - `parentPage` - Hierarchical page structure

## Page Types

### 1. Documentation
- **Purpose**: Technical documentation, guides, API references
- **Use Cases**: 
  - Architecture documentation
  - Development guides
  - API documentation
  - User manuals

### 2. Features
- **Purpose**: Feature specifications and requirements
- **Use Cases**:
  - User stories
  - Acceptance criteria
  - Feature specifications
  - Business requirements

### 3. Processes
- **Purpose**: Team processes and workflows
- **Use Cases**:
  - Development workflows
  - Code review processes
  - Deployment procedures
  - Quality assurance processes

### 4. Meeting Notes
- **Purpose**: Meeting documentation and decisions
- **Use Cases**:
  - Sprint planning notes
  - Retrospective outcomes
  - Stakeholder meetings
  - Decision records

## Templates

### Project Overview Template
```markdown
# Project Overview

## Project Summary
[Brief description of the project]

## Goals and Objectives
- Primary goal: [Main objective]
- Secondary goals: [List secondary objectives]

## Project Scope
### In Scope
- [Feature/requirement 1]
- [Feature/requirement 2]

### Out of Scope
- [Item 1]
- [Item 2]

## Key Stakeholders
- **Project Manager:** [Name]
- **Technical Lead:** [Name]
- **Product Owner:** [Name]
```

### Meeting Notes Template
```markdown
# Meeting Notes

## Meeting Details
- **Date:** [Date]
- **Time:** [Time]
- **Duration:** [Duration]
- **Meeting Type:** [Type]

## Attendees
- [Name] - [Role]

## Action Items
| Action | Owner | Due Date | Status |
|--------|--------|----------|--------|
| [Action] | [Name] | [Date] | Status |
```

### Technical Design Template
```markdown
# Technical Design Document

## Overview
[Brief description of the feature/system]

## System Architecture
[High-level architecture description]

## API Design
[API endpoint specifications]

## Database Schema
[Database table structures]

## Security Considerations
[Security requirements and considerations]
```

## Features

### Content Management
- **Rich Text Editing**: Advanced editor with formatting toolbar
- **Template System**: Pre-built templates for common page types
- **Version Control**: Track changes and maintain page history
- **Search & Filter**: Full-text search with type and status filtering
- **Tagging System**: Organize pages with custom tags

### Collaboration
- **Permission System**: Role-based access control
- **Public/Private Pages**: Control page visibility
- **Real-time Updates**: Live updates when pages are modified
- **Comments System**: (Future enhancement)

### Organization
- **Hierarchical Structure**: Parent-child page relationships
- **Project Association**: Link pages to specific projects
- **Status Management**: Draft, published, archived states
- **Category Filtering**: Filter by page type and status

## Permission System

### View Permissions
- **Public Pages**: Visible to all authenticated users
- **Private Pages**: Restricted to specific roles
- **Role-based Access**: Admin, Project Manager, Team Member, Client

### Edit Permissions
- **Creator**: Page creator can always edit
- **Role-based**: Configurable role permissions
- **Admin Override**: Admins can edit any page

## Usage Guide

### Creating a New Page

1. **Navigate** to the Confluence section
2. **Click** "Create Page" button
3. **Choose** a template or start from scratch
4. **Fill** in page details:
   - Title
   - Type (Documentation, Feature, Process, Meeting Notes)
   - Content using the rich text editor
5. **Set** permissions and visibility
6. **Save** as draft or publish immediately

### Editing an Existing Page

1. **Navigate** to the page
2. **Click** the "Edit" button (if you have permissions)
3. **Modify** content using the rich text editor
4. **Update** status if needed
5. **Save** changes (automatically increments version)

### Searching and Filtering

1. **Use** the search bar for full-text search
2. **Apply** filters:
   - Page type (Documentation, Features, etc.)
   - Status (Draft, Published, Archived)
   - Project association
3. **Browse** by category tabs

### Using Templates

1. **Click** "Create Page"
2. **Select** from available templates:
   - Project Overview
   - Meeting Notes
   - Technical Design
   - Feature Requirements
   - Process Documentation
   - Sprint Retrospective
3. **Customize** the template content
4. **Save** your page

## API Reference

### Create Page
```http
POST /api/confluence/pages
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Page Title",
  "content": "Page content",
  "type": "documentation",
  "projectId": "project-id",
  "tags": ["tag1", "tag2"],
  "isPublic": false,
  "viewPermissions": ["admin", "project_manager"],
  "editPermissions": ["admin"]
}
```

### Get Pages
```http
GET /api/confluence/pages?type=documentation&status=published
Authorization: Bearer <token>
```

### Update Page
```http
PUT /api/confluence/pages/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "content": "Updated content",
  "status": "published"
}
```

## Database Schema

```sql
-- ConfluencePage Collection (MongoDB)
{
  _id: ObjectId,
  title: String (required),
  content: String (required),
  type: String (enum: ['feature', 'documentation', 'process', 'meeting_notes']),
  project: ObjectId (ref: 'Project'),
  createdBy: ObjectId (ref: 'User', required),
  lastModifiedBy: ObjectId (ref: 'User', required),
  tags: [String],
  isPublic: Boolean (default: false),
  viewPermissions: [String], // Role names
  editPermissions: [String], // Role names
  status: String (enum: ['draft', 'published', 'archived'], default: 'draft'),
  version: Number (default: 1),
  parentPage: ObjectId (ref: 'ConfluencePage'),
  createdAt: Date,
  updatedAt: Date
}
```

## Security

### Authentication
- All endpoints require valid JWT token
- User identity extracted from token

### Authorization
- **View Access**: Public pages OR role in viewPermissions OR page creator OR admin
- **Edit Access**: Role in editPermissions OR page creator OR admin
- **Delete Access**: Page creator OR admin only

### Data Validation
- Input sanitization for XSS prevention
- Content length limits
- Permission validation
- Required field validation

## Performance Optimization

### Database Indexes
```javascript
// MongoDB indexes for efficient queries
confluencePageSchema.index({ project: 1, status: 1 });
confluencePageSchema.index({ createdBy: 1 });
confluencePageSchema.index({ type: 1 });
confluencePageSchema.index({ tags: 1 });
confluencePageSchema.index({ isPublic: 1 });
```

### Frontend Optimization
- **Lazy Loading**: Pages loaded on demand
- **Search Debouncing**: Prevent excessive API calls
- **Caching**: Client-side caching of frequently accessed pages
- **Pagination**: Large page lists paginated

## Future Enhancements

### Phase 1 (Near Term)
- [ ] Page comments and discussions
- [ ] Page linking and references
- [ ] Export functionality (PDF, Word)
- [ ] Page templates import/export

### Phase 2 (Medium Term)
- [ ] Real-time collaborative editing
- [ ] Advanced search with filters
- [ ] Page analytics and metrics
- [ ] Integration with external tools

### Phase 3 (Long Term)
- [ ] AI-powered content suggestions
- [ ] Automated page organization
- [ ] Advanced workflow automation
- [ ] Multi-language support

## Troubleshooting

### Common Issues

#### Pages Not Loading
- Check user permissions
- Verify authentication token
- Check network connectivity
- Review server logs for errors

#### Content Not Saving
- Verify edit permissions
- Check content length limits
- Ensure required fields are filled
- Check for special characters causing issues

#### Search Not Working
- Verify search terms
- Check filters applied
- Clear browser cache
- Restart search service if necessary

### Error Messages

#### "Access Denied"
- User lacks view/edit permissions
- Page is private and user not in viewPermissions
- Authentication token expired

#### "Page Not Found"
- Page may have been deleted
- Incorrect page ID
- User lacks access permissions

#### "Validation Error"
- Required fields missing
- Invalid data format
- Content exceeds length limits

## Monitoring and Logging

### Key Metrics
- Page creation rate
- User engagement (views, edits)
- Popular page types
- Search query patterns

### Log Events
- Page CRUD operations
- Permission changes
- User access patterns
- Error occurrences

### Health Checks
- Database connectivity
- Search service status
- Authentication service
- File system access (for templates)

## Deployment

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/omyra

# Authentication
JWT_SECRET=your-jwt-secret

# File Storage (if using file uploads)
UPLOAD_PATH=/var/uploads/confluence

# Search Service (if using external search)
SEARCH_SERVICE_URL=http://localhost:9200
```

### Deployment Steps
1. **Build** frontend assets
2. **Deploy** backend services
3. **Run** database migrations
4. **Configure** environment variables
5. **Start** services
6. **Verify** health endpoints

This comprehensive documentation provides everything needed to understand, use, and maintain the Confluence knowledge base system in the Omyra Project Nexus application.
