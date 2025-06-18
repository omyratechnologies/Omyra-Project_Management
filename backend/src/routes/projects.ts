import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  assignClientToProject,
  removeClientFromProject
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdminOrProjectManager, canChangeProjectStatus } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { createProjectSchema, updateProjectSchema, addProjectMemberSchema, assignClientToProjectSchema } from '../utils/validation.js';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticate);

const idSchema = z.object({
  id: z.string().min(1, 'ID is required')
});

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', isAdminOrProjectManager, validateBody(createProjectSchema), createProject);
router.put('/:id', validateBody(updateProjectSchema), updateProject);
router.put('/:id/status', canChangeProjectStatus, updateProjectStatus);
router.delete('/:id', deleteProject);
router.post('/:id/members', isAdminOrProjectManager, validateBody(addProjectMemberSchema), addProjectMember);
router.delete('/:id/members/:userId', isAdminOrProjectManager, removeProjectMember);
router.put('/:id/client', isAdminOrProjectManager, validateBody(assignClientToProjectSchema), assignClientToProject);
router.delete('/:id/client', isAdminOrProjectManager, removeClientFromProject);

export default router;
