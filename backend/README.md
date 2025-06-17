# Omyra Project Management - Backend API

A comprehensive backend API built with Node.js, Express, and MongoDB for the Omyra Project Management System. Features role-based access control, authentication, and complete project management functionality.

## 🚀 Features

### Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control (RBAC)** with three user roles:
  - **Admin**: Full system access
  - **Project Manager**: Can create/manage projects and tasks
  - **Team Member**: Can view and update assigned tasks

### Core Functionality
- **User Management**: Registration, login, profile management
- **Project Management**: CRUD operations with member management
- **Task Management**: Create, assign, and track tasks with priorities
- **Team Management**: View team members and manage roles

### Security & Best Practices
- Password hashing with bcrypt
- Rate limiting and CORS protection
- Request validation with Zod schemas
- Comprehensive error handling
- MongoDB security with proper indexing

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: TSX for hot reloading

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Getting Started

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Configure your `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/omyra-project-nexus

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

Start MongoDB locally or use MongoDB Atlas, then seed the database:

```bash
# Seed the database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
# Start development server with hot reloading
npm run dev
```

The API will be available at `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (authenticated)

### Projects
- `GET /api/projects` - Get user's projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (admin/PM only)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add project member (admin/PM only)
- `DELETE /api/projects/:id/members/:userId` - Remove project member (admin/PM only)

### Tasks
- `GET /api/tasks` - Get tasks (filtered by user role)
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task (admin/PM only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin/PM only)

### Team
- `GET /api/team` - Get team members
- `GET /api/team/:id` - Get team member details
- `PUT /api/team/:id` - Update team member
- `DELETE /api/team/:id` - Delete team member (admin only)

### Health Check
- `GET /api/health` - API health status

## 🔐 Sample Test Data

After running the seed script, you can use these test accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| Admin | admin@omyra.com | password123 | Full system access |
| Project Manager | pm@omyra.com | password123 | Create/manage projects and tasks |
| Developer | developer@omyra.com | password123 | View/update assigned tasks |
| Designer | designer@omyra.com | password123 | View/update assigned tasks |

## 🏗️ Database Schema

### Users Collection
- Email/password authentication
- Reference to user profile

### Profiles Collection
- User details (name, role, avatar)
- Role-based permissions

### Projects Collection
- Project information and status
- Creator reference and timestamps

### Project Members Collection
- Many-to-many relationship between users and projects
- Role within project tracking

### Tasks Collection
- Task details with priority and status
- Assignment and project relationships

## 🔒 Role-Based Access Control

### Admin
- Full access to all projects and tasks
- Can manage all users and team members
- Can delete projects and users

### Project Manager
- Can create new projects
- Can manage projects they're members of
- Can create and manage tasks
- Can add/remove project members

### Team Member
- Can view projects they're members of
- Can view and update tasks assigned to them
- Cannot create projects or tasks
- Cannot manage other users

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reloading
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Database
npm run db:seed      # Seed database with sample data
```

## 🔧 Development

### Project Structure
```
src/
├── config/          # Database and environment configuration
├── controllers/     # Route handlers and business logic
├── middleware/      # Authentication, validation, and error handling
├── models/          # MongoDB/Mongoose models
├── routes/          # Express route definitions
├── scripts/         # Database seeding and utility scripts
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (auth, validation, responses)
└── server.ts        # Main application entry point
```

### Adding New Features

1. **Models**: Define MongoDB schemas in `src/models/`
2. **Types**: Add TypeScript interfaces in `src/types/`
3. **Controllers**: Implement business logic in `src/controllers/`
4. **Routes**: Define API endpoints in `src/routes/`
5. **Middleware**: Add authentication/validation in `src/middleware/`

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configured for frontend domain
- **Request Validation**: Zod schemas for all inputs
- **Role-Based Access**: Granular permission system

## 📊 Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a strong JWT secret
3. Configure MongoDB Atlas or secured MongoDB instance
4. Set up proper CORS origins
5. Use HTTPS in production
6. Configure proper rate limiting
7. Set up logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for Omyra Project Management System.
