# Client Account Management System

This document provides comprehensive information about the client account management system in the Omyra Project Nexus application.

## Overview

The client account system allows external clients to register, manage their accounts, and interact with projects assigned to them. The system provides role-based access control with different permissions for administrators, project managers, and clients.

## Features

### Client Registration
- **Public Registration**: Clients can register themselves through a public endpoint
- **Admin Creation**: Administrators and project managers can create client accounts
- **Account Approval**: New client accounts start in "pending" status and require admin approval
- **Email Notifications**: Welcome and approval emails are sent automatically

### Client Management
- **Profile Management**: Clients can view and update their profile information
- **Company Information**: Comprehensive company details including billing information
- **Status Management**: Active, inactive, and pending statuses
- **Project Assignment**: Clients can be assigned to specific projects

### Access Control
- **Role-Based Permissions**: Different access levels for admin, project_manager, and client roles
- **Self-Service**: Clients can view and update their own profiles
- **Admin Controls**: Full CRUD operations for administrators

## API Endpoints

### Public Endpoints

#### Register Client
```http
POST /api/clients/register
Content-Type: application/json

{
  "email": "client@company.com",
  "password": "securepassword123",
  "fullName": "John Smith",
  "companyName": "ABC Corporation",
  "industry": "Technology",
  "website": "https://abccorp.com",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Business Ave",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "zipCode": "94102"
  },
  "contactPerson": {
    "name": "John Smith",
    "title": "CEO",
    "email": "john@abccorp.com",
    "phone": "+1-555-0123"
  },
  "billingInfo": {
    "billingEmail": "billing@abccorp.com",
    "billingAddress": {
      "street": "123 Business Ave",
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "zipCode": "94102"
    },
    "paymentTerms": "net-30"
  },
  "notes": "New client registration"
}
```

### Protected Endpoints (Require Authentication)

#### Create Client (Admin/PM Only)
```http
POST /api/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  // Same payload as registration
}
```

#### Get All Clients (Admin/PM Only)
```http
GET /api/clients
Authorization: Bearer <token>

Query Parameters:
- status: active|inactive|pending
- page: number (default: 1)
- limit: number (default: 10, max: 100)
```

#### Get Client Profile (Own Profile for Clients)
```http
GET /api/clients/me
Authorization: Bearer <token>
```

#### Get Specific Client
```http
GET /api/clients/:clientId
Authorization: Bearer <token>
```

#### Update Client
```http
PUT /api/clients/:clientId
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Updated Company Name",
  "industry": "Updated Industry",
  "status": "active",
  // ... other fields to update
}
```

#### Approve Client (Admin Only)
```http
PATCH /api/clients/:clientId/approve
Authorization: Bearer <token>
```

#### Deactivate Client (Admin Only)
```http
PATCH /api/clients/:clientId/deactivate
Authorization: Bearer <token>
```

#### Delete Client (Admin Only)
```http
DELETE /api/clients/:clientId
Authorization: Bearer <token>
```

## Data Models

### Client Model
```typescript
interface IClient {
  _id?: string;
  user: ObjectId; // Reference to User
  companyName: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  contactPerson: {
    name: string;
    title?: string;
    email: string;
    phone?: string;
  };
  status: 'active' | 'inactive' | 'pending';
  projects?: ObjectId[]; // References to Projects
  notes?: string;
  billingInfo?: {
    billingEmail?: string;
    billingAddress?: Address;
    paymentTerms?: 'net-15' | 'net-30' | 'net-60' | 'immediate';
  };
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Permission Matrix

| Action | Admin | Project Manager | Client | Guest |
|--------|-------|----------------|--------|-------|
| Register Client | ✅ | ✅ | ❌ | ✅ |
| Create Client | ✅ | ✅ | ❌ | ❌ |
| View All Clients | ✅ | ✅ | ❌ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ | ❌ |
| View Other Client | ✅ | ✅ | ❌ | ❌ |
| Update Own Profile | ✅ | ✅ | ✅ | ❌ |
| Update Other Client | ✅ | ✅ | ❌ | ❌ |
| Change Client Status | ✅ | ❌ | ❌ | ❌ |
| Approve Client | ✅ | ❌ | ❌ | ❌ |
| Delete Client | ✅ | ❌ | ❌ | ❌ |

## Email Notifications

### Welcome Email
Sent automatically when a client registers:
- Welcome message
- Account pending approval notice
- Link to dashboard

### Approval Email
Sent when an admin approves a client account:
- Account approval confirmation
- Access to full features
- Link to dashboard

## Usage Examples

### Creating a Client Account via Registration

```bash
curl -X POST http://localhost:5000/api/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@company.com",
    "password": "securepassword123",
    "fullName": "John Smith",
    "companyName": "ABC Corporation",
    "contactPerson": {
      "name": "John Smith",
      "email": "john@abccorp.com"
    }
  }'
```

### Approving a Client (Admin)

```bash
curl -X PATCH http://localhost:5000/api/clients/64a1b2c3d4e5f6789012345/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Getting Client Profile (Client)

```bash
curl -X GET http://localhost:5000/api/clients/me \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

## Error Handling

Common error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Only administrators can approve clients."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Client not found"
}
```

## Integration with Project Management

Clients can be:
- Assigned to specific projects
- Given access to project feedback features
- Invited to project meetings
- Provided with project progress updates

## Security Considerations

1. **Password Security**: Passwords are hashed using bcrypt
2. **JWT Authentication**: All protected routes require valid JWT tokens
3. **Role-Based Access**: Strict permission checks on all operations
4. **Email Verification**: Contact emails are validated
5. **Data Validation**: All input is validated using Zod schemas

## Development and Testing

### Running Tests
```bash
# Test client creation
npm run test-client-creation

# Run full test suite
npm test
```

### Environment Variables
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@your-domain.com
FRONTEND_URL=http://localhost:5173
```

## Future Enhancements

1. **Client Portal**: Dedicated client dashboard
2. **Invoice Integration**: Billing and invoice management
3. **Document Sharing**: Secure file sharing with clients
4. **Client Feedback**: Enhanced feedback and rating system
5. **Multi-language Support**: Internationalization for global clients
