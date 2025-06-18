import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { canCreateTaskIssue, isNotClient } from '../middleware/rbac.js';
import {
  createTaskIssue,
  getTaskIssues,
  updateTaskIssue,
  getTaskIssue,
  deleteTaskIssue
} from '../controllers/taskIssueController.js';

const router = Router();

// Create task issue (team members and above)
router.post('/tasks/:taskId/issues', authenticate, canCreateTaskIssue, createTaskIssue);

// Get task issues
router.get('/tasks/:taskId/issues', authenticate, canCreateTaskIssue, getTaskIssues);

// Get specific task issue
router.get('/issues/:issueId', authenticate, isNotClient, getTaskIssue);

// Update task issue (admins, PMs, and assigned users)
router.put('/issues/:issueId', authenticate, isNotClient, updateTaskIssue);

// Delete task issue (admin or reporter)
router.delete('/issues/:issueId', authenticate, isNotClient, deleteTaskIssue);

export default router;
