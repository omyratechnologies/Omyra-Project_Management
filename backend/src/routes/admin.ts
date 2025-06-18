import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAllProjects,
  updateProjectStatus,
  deleteProject,
  getRoles,
  updateUserRole,
  getAllClientsAdmin,
  assignClientToProject,
  removeClientFromProject,
  getClientProjects,
  createAdmin,
  getAllAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin
} from '../controllers/adminController.js';
import { validationResult, body } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation middleware for express-validator
const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  };
};

const router = Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard Statistics
router.get('/dashboard/stats', getDashboardStats);

// User Management Routes
router.get('/users', getAllUsers);
router.post('/users', 
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('role').optional().isIn(['admin', 'project_manager', 'team_member', 'client'])
      .withMessage('Role must be one of: admin, project_manager, team_member, client')
  ]), 
  createUser
);
router.put('/users/:userId', 
  validate([
    body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['admin', 'project_manager', 'team_member', 'client'])
      .withMessage('Role must be one of: admin, project_manager, team_member, client'),
    body('status').optional().isIn(['active', 'inactive', 'suspended'])
      .withMessage('Status must be one of: active, inactive, suspended')
  ]), 
  updateUser
);
router.delete('/users/:userId', deleteUser);
router.patch('/users/:userId/reset-password', 
  validate([
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ]), 
  resetUserPassword
);

// Project Management Routes
router.get('/projects', getAllProjects);
router.patch('/projects/:projectId/status', 
  validate([
    body('status').isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
      .withMessage('Status must be one of: planning, active, on_hold, completed, cancelled')
  ]), 
  updateProjectStatus
);
router.delete('/projects/:projectId', deleteProject);

// RBAC Management Routes
router.get('/roles', getRoles);
router.patch('/users/:userId/role', 
  validate([
    body('role').isIn(['admin', 'project_manager', 'team_member', 'client'])
      .withMessage('Role must be one of: admin, project_manager, team_member, client')
  ]), 
  updateUserRole
);

// Client Management Routes
router.get('/clients', getAllClientsAdmin);
router.post('/clients/:clientId/projects/:projectId', assignClientToProject);
router.delete('/clients/:clientId/projects/:projectId', removeClientFromProject);
router.get('/clients/:clientId/projects', getClientProjects);

// Admin management routes
router.post(
  '/admins',
  validate([
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('fullName')
      .isLength({ min: 2 })
      .withMessage('Full name must be at least 2 characters long'),
  ]),
  createAdmin
);

router.get('/admins', getAllAdmins);
router.get('/admins/:id', getAdmin);

router.put(
  '/admins/:id',
  validate([
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('fullName')
      .optional()
      .isLength({ min: 2 })
      .withMessage('Full name must be at least 2 characters long'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be either active or inactive'),
  ]),
  updateAdmin
);

router.delete('/admins/:id', deleteAdmin);

// System Analytics Routes
router.get('/analytics/users', (req, res) => {
  res.json({ message: 'User analytics endpoint - to be implemented' });
});

router.get('/analytics/projects', (req, res) => {
  res.json({ message: 'Project analytics endpoint - to be implemented' });
});

router.get('/analytics/tasks', (req, res) => {
  res.json({ message: 'Task analytics endpoint - to be implemented' });
});

// System Settings Routes
router.get('/settings/system', (req, res) => {
  res.json({ message: 'System settings endpoint - to be implemented' });
});

router.put('/settings/system', (req, res) => {
  res.json({ message: 'Update system settings endpoint - to be implemented' });
});

// Audit Log Routes
router.get('/audit-logs', (req, res) => {
  res.json({ message: 'Audit logs endpoint - to be implemented' });
});

export default router;
