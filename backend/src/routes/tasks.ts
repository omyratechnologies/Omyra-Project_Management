import { Router } from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  assignTask,
  deleteTask
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdminOrProjectManager, canAssignTasks } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { createTaskSchema, updateTaskSchema } from '../utils/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', isAdminOrProjectManager, validateBody(createTaskSchema), createTask);
router.put('/:id', validateBody(updateTaskSchema), updateTask);
router.put('/:id/assign', canAssignTasks, assignTask);
router.delete('/:id', isAdminOrProjectManager, deleteTask);

export default router;
