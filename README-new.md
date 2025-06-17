# Omyra Project Management System

A comprehensive full-stack project management application built with React, TypeScript, Node.js, Express, and MongoDB. Features role-based access control, real-time updates, and a modern, responsive UI.

## 🚀 Features

### Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control (RBAC)** with three user roles:
  - **Admin**: Full system access, user management
  - **Project Manager**: Create/manage projects, tasks, and team members
  - **Team Member**: View and update assigned tasks

### Core Functionality
- **Dashboard**: Real-time project/task/team statistics and overview
- **Project Management**: Complete CRUD operations with team member management
- **Task Management**: Create, assign, track tasks with drag & drop status updates
- **Team Management**: User roles, profile management, and team collaboration
- **Real-time Updates**: Live data synchronization across the application

### Technical Features
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Data Validation**: Comprehensive input validation with Zod schemas
- **Error Handling**: Graceful error handling with user-friendly messages
- **Performance**: Optimized queries and efficient state management

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Query** for server state management
- **React Router** for client-side routing
- **React Hook Form** for form handling
- **Axios** for API communication

### Backend
- **Node.js** with TypeScript
- **Express.js** for REST API
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for validation
- **CORS & Helmet** for security

### Development Tools
- **ESLint** for code linting
- **TypeScript** for type safety
- **Hot reloading** for development
- **MongoDB** for data persistence

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn**

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd omyra-project-nexus
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
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
PORT=5001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:8080
```

#### Start MongoDB
```bash
# macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# Or start manually
mongod --config /opt/homebrew/etc/mongod.conf
```

#### Seed Database
```bash
npm run db:seed
```

#### Start Backend Server
```bash
npm run dev
```

The backend will be available at `http://localhost:5001`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ..  # Return to root directory
npm install
```

#### Environment Configuration
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# Backend API Configuration
VITE_API_URL=http://localhost:5001/api
```

#### Start Frontend Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`

## 🔐 Test Credentials

After running the seed script, you can use these test accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| **Admin** | admin@omyra.com | password123 | Full system access |
| **Project Manager** | pm@omyra.com | password123 | Create/manage projects and tasks |
| **Developer** | developer@omyra.com | password123 | View/update assigned tasks |
| **Designer** | designer@omyra.com | password123 | View/update assigned tasks |

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (authenticated)

### Project Endpoints
- `GET /api/projects` - Get user's projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (admin/PM only)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add project member
- `DELETE /api/projects/:id/members/:userId` - Remove project member

### Task Endpoints
- `GET /api/tasks` - Get tasks (filtered by user role)
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task (admin/PM only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin/PM only)

### Team Endpoints
- `GET /api/team` - Get team members
- `GET /api/team/:id` - Get team member details
- `PUT /api/team/:id` - Update team member
- `DELETE /api/team/:id` - Delete team member (admin only)

### Health Check
- `GET /api/health` - API health status

## 🔒 Role-Based Access Control

### Admin
- ✅ Full access to all projects and tasks
- ✅ Manage all users and team members
- ✅ Delete projects and users
- ✅ Change user roles
- ✅ System-wide analytics

### Project Manager
- ✅ Create new projects
- ✅ Manage projects they're members of
- ✅ Create and assign tasks
- ✅ Add/remove project members
- ❌ Cannot access other PMs' projects (unless added as member)

### Team Member
- ✅ View projects they're members of
- ✅ View and update tasks assigned to them
- ✅ Update their own profile
- ❌ Cannot create projects or tasks
- ❌ Cannot manage other users

## 🏗️ Project Structure

```
omyra-project-nexus/
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   ├── layout/         # Layout components
│   │   │   └── ui/             # UI library components
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility libraries
│   │   ├── pages/              # Page components
│   │   └── types/              # TypeScript type definitions
├── backend/
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # MongoDB models
│   │   ├── routes/             # API routes
│   │   ├── scripts/            # Database scripts
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   └── server.ts           # Server entry point
```

## 📜 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run db:seed      # Seed database with sample data
```

## 🔧 Development

### Adding New Features

1. **Backend**: Add models → controllers → routes → update types
2. **Frontend**: Create hooks → components → pages → update routing
3. **Database**: Update seed script for new data structures
4. **Types**: Maintain type safety across frontend and backend

### Code Standards

- **TypeScript**: Strict mode enabled, full type coverage
- **ESLint**: Configured for React and Node.js best practices
- **Component Structure**: Functional components with hooks
- **API Design**: RESTful endpoints with consistent response formats
- **Error Handling**: Comprehensive error boundaries and validation

## 🔐 Security Features

- **Password Security**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth with expiration
- **CORS Protection**: Configured for specific frontend origins
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Zod schemas for all inputs
- **Role-Based Access**: Granular permissions system
- **XSS Protection**: Helmet security headers

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure MongoDB Atlas or secured MongoDB
4. Set up proper CORS origins
5. Use HTTPS in production
6. Configure logging and monitoring

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Configure API URL for production
4. Set up CDN for optimal performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes with proper TypeScript types
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

This project is proprietary software for Omyra Project Management System.

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api/health`

---

**Built with ❤️ using modern web technologies**
